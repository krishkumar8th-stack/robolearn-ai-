import { GoogleGenAI } from '@google/genai';
import { AIChatMessage, AICodeGenerationResult, AIDebugResult } from '../../../src/types/index.js';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server.');
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'robolearn-ai' } },
    });
  }
  return geminiClient;
}

const PRIMARY_MODEL = process.env.AI_PRIMARY_MODEL?.trim() || 'gemini-3.8-flash';
const FAST_MODEL = process.env.AI_FAST_MODEL?.trim() || 'gemini-3.8-flash';

const GENERAL_SYSTEM = `You are RoboLearn AI, a capable general-purpose AI assistant inside a student learning and coding platform.

Answer the user's actual question, not just robotics questions. You can help with programming, mathematics, science, electronics, robotics, debugging, web development, study help, writing, planning, and everyday factual questions.

Rules for responses:
- Be accurate, practical, and honest about uncertainty.
- Use current web information when the question depends on recent/current facts; the API may use Google Search grounding when useful.
- Adapt depth to the user's apparent level. Start clearly, then add depth when useful.
- For technical questions, show concrete examples and explain important assumptions.
- For code, provide complete runnable code when the user asks for an implementation; otherwise focus on the requested portion.
- For debugging, identify the likely root cause before proposing changes.
- Use Markdown naturally: headings, bullets, tables, and fenced code blocks when helpful.
- Do not claim you executed code, accessed a private system, or verified an external fact unless that actually happened.
- For hardware questions, do not invent ratings, pinouts, or exact specifications; tell the learner to verify the component documentation when a part-specific value matters.
- For schoolwork, teach the reasoning and present steps clearly rather than only giving a final line.
- Keep the tone friendly and direct.`;

function buildHistory(history: AIChatMessage[]): string {
  return history.slice(-20).map(msg => {
    const speaker = msg.sender === 'assistant' ? 'ASSISTANT' : msg.sender === 'system' ? 'SYSTEM' : 'USER';
    return `${speaker}: ${msg.content}`;
  }).join('\n');
}

function cleanJsonText(text: string): string {
  return text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
}

export const geminiService = {
  async checkHealth(): Promise<{ status: string; hasKey: boolean; model: string; searchGrounding: boolean }> {
    const hasKey = Boolean(process.env.GEMINI_API_KEY?.trim());
    return { status: hasKey ? 'configured' : 'missing_api_key', hasKey, model: PRIMARY_MODEL, searchGrounding: hasKey };
  },

  async translateTexts(texts: string[], targetLanguage: string): Promise<string[]> {
    const ai = getGeminiClient();
    const safeTexts = Array.isArray(texts)
      ? texts
          .filter((text) => typeof text === 'string' && text.trim())
          .slice(0, 35)
          .map((text) => text.slice(0, 500))
      : [];

    if (!safeTexts.length || !targetLanguage || targetLanguage === 'en') {
      return safeTexts;
    }

    const prompt = 'Translate each item from English into ' + targetLanguage + '. Return a JSON array with exactly the same number of items and preserve the order. Do not explain, summarize, merge, or omit anything. Preserve code identifiers, URLs, email addresses, numbers, units, keyboard shortcuts, product/model names, and technical symbols where appropriate.\\n\\nINPUT:\\n' + JSON.stringify(safeTexts);

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'You are a precise software localization engine. Produce natural, UI-friendly translations in the requested language. Preserve code, URLs, emails, numbers, units and product/model names when translation would be incorrect.',
        responseMimeType: 'application/json',
      },
    });

    try {
      const parsed = JSON.parse(cleanJsonText(response.text || '[]'));
      if (!Array.isArray(parsed) || parsed.length !== safeTexts.length) {
        throw new Error('Invalid translation array.');
      }
      return parsed.map((item, index) =>
        typeof item === 'string' && item.trim() ? item.trim() : safeTexts[index]
      );
    } catch {
      throw new Error('AI returned an invalid translation response. Please retry.');
    }
  },

  async chatTutor(
    userMessage: string,
    history: AIChatMessage[] = [],
    context?: { experienceLevel?: string; currentLesson?: string; currentCode?: string; hardware?: string; mode?: string; language?: string }
  ): Promise<string> {
    const ai = getGeminiClient();
    const conversation = buildHistory(history);
    const contextBlock = [
      context?.experienceLevel ? `Learner level: ${context.experienceLevel}` : '',
      context?.currentLesson ? `Current focus: ${context.currentLesson}` : '',
      context?.hardware ? `Hardware context: ${context.hardware}` : '',
      context?.language ? `Preferred programming language: ${context.language}` : '',
      context?.mode ? `Teaching mode: ${context.mode}` : '',
      context?.currentCode ? `Current code:\n${context.currentCode}` : '',
    ].filter(Boolean).join('\n');

    const prompt = [
      conversation ? `Conversation so far:\n${conversation}` : '',
      contextBlock ? `Session context:\n${contextBlock}` : '',
      `Latest user message:\n${userMessage}`,
    ].filter(Boolean).join('\n\n');

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        systemInstruction: `${GENERAL_SYSTEM}\n\nYou are also the user's tutor. In hints-first mode, encourage the learner to think before revealing a full solution. In direct mode, answer directly. Do not be artificially restrictive: answer general questions even when they are outside robotics.\n\nWhen a question depends on information that may have changed recently, use Google Search grounding. Use code execution when a calculation or executable verification materially improves the answer.`,
        tools: [
          { googleSearch: {} },
          { codeExecution: {} },
        ],
      },
    });
    const text = response.text?.trim();
    if (!text) throw new Error('Gemini returned an empty tutor response. Please retry.');
    return text;
  },

  async generateCode(userPrompt: string, targetBoard = 'Arduino Uno', language = 'cpp'): Promise<AICodeGenerationResult> {
    const ai = getGeminiClient();
    const isEmbedded = ['cpp', 'python', 'micropython', 'arduino'].includes(language.toLowerCase()) && /arduino|esp32|raspberry|sensor|servo|motor|robot|embedded|microcontroller|circuit|gpio|pwm|i2c|spi/i.test(`${userPrompt} ${targetBoard}`);

    const systemInstruction = `${GENERAL_SYSTEM}

You are the RoboLearn AI Code Studio engine. The user may ask for ANY programming task, not only robotics.

Generate a complete solution in the requested language. Prefer code that can be copied and run with minimal changes. Never silently switch languages. State important dependencies or setup requirements in the explanation.

When the task involves hardware, include requiredComponents and wiring only for hardware you can support from the user's request. Do not fabricate exact electrical ratings or pinouts; mark uncertain details clearly.

Return JSON with exactly these top-level fields:
language: string
code: string
requiredComponents: string[]
wiring: [{from:string,to:string,description:string}]
explanation: string
functionsUsed: string[]
possibleErrors: string[]
simulationSupported: boolean
simulationActions: [{type:string,payload?:object}]
challenge?: {title:string,description:string,testCases?:string[]}

Use empty arrays when a field is not applicable. Supported simulation action types are: LED_SET, LED_BLINK, SERVO_SET, SERVO_SWEEP, ROBOT_MOVE, ROBOT_TURN, ROBOT_STOP, BUZZER_TONE, OBSTACLE_DETECT.

Hardware target: ${targetBoard}
Requested language: ${language}
Embedded/hardware workflow likely: ${isEmbedded ? 'yes' : 'no'}`;

    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `Build this exactly as requested:\n${JSON.stringify(userPrompt)}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            language: { type: 'string' },
            code: { type: 'string' },
            requiredComponents: { type: 'array', items: { type: 'string' } },
            wiring: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  from: { type: 'string' },
                  to: { type: 'string' },
                  description: { type: 'string' },
                },
                required: ['from', 'to', 'description'],
              },
            },
            explanation: { type: 'string' },
            functionsUsed: { type: 'array', items: { type: 'string' } },
            possibleErrors: { type: 'array', items: { type: 'string' } },
            simulationSupported: { type: 'boolean' },
            simulationActions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  payload: { type: 'object' },
                },
                required: ['type'],
              },
            },
            challenge: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                testCases: { type: 'array', items: { type: 'string' } },
              },
              required: ['title', 'description'],
            },
          },
          required: ['language', 'code', 'requiredComponents', 'wiring', 'explanation', 'functionsUsed', 'possibleErrors', 'simulationSupported', 'simulationActions'],
        },
      },
    });

    try {
      const parsed = JSON.parse(cleanJsonText(response.text || '{}')) as AICodeGenerationResult;
      if (!parsed.code || !Array.isArray(parsed.requiredComponents) || !Array.isArray(parsed.wiring)) throw new Error('Invalid structured response');
      return {
        ...parsed,
        language: parsed.language || language,
        requiredComponents: parsed.requiredComponents || [],
        wiring: parsed.wiring || [],
        functionsUsed: Array.isArray(parsed.functionsUsed) ? parsed.functionsUsed : [],
        possibleErrors: Array.isArray(parsed.possibleErrors) ? parsed.possibleErrors : [],
        simulationActions: Array.isArray(parsed.simulationActions) ? parsed.simulationActions : [],
      };
    } catch {
      throw new Error('AI returned an invalid code-generation response. Please retry.');
    }
  },

  async explainCode(code: string, language = 'cpp'): Promise<{ summary: string; lineByLine: { line: number; explanation: string }[]; concepts: string[] }> {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Language: ${language}\nCode:\n\`\`\`\n${code}\n\`\`\``,
      config: {
        systemInstruction: 'Explain this code accurately. Return JSON with summary, lineByLine [{line, explanation}], and concepts [string]. Do not invent behavior that is not present in the code.',
        responseMimeType: 'application/json',
      },
    });
    try {
      const parsed = JSON.parse(cleanJsonText(response.text || '{}'));
      return {
        summary: typeof parsed.summary === 'string' ? parsed.summary : 'Explanation generated.',
        lineByLine: Array.isArray(parsed.lineByLine) ? parsed.lineByLine : [],
        concepts: Array.isArray(parsed.concepts) ? parsed.concepts : [],
      };
    } catch {
      throw new Error('AI returned an invalid code-explanation response. Please retry.');
    }
  },

  async debugCode(code: string, language = 'cpp', errorMessage?: string, hardwareContext?: string): Promise<AIDebugResult> {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `Language: ${language}\nHardware: ${hardwareContext || 'Not specified'}\nObserved error: ${errorMessage || 'None provided'}\nCode:\n\`\`\`\n${code}\n\`\`\``,
      config: {
        systemInstruction: 'Debug code carefully. Return JSON with problem, cause, solution, correctedCode, explanation, confidence, and preventionTips. Separate confirmed issues from assumptions.',
        responseMimeType: 'application/json',
      },
    });
    try {
      const parsed = JSON.parse(cleanJsonText(response.text || '{}'));
      return parsed as AIDebugResult;
    } catch {
      throw new Error('AI returned an invalid debugging response. Please retry.');
    }
  },

  async explainComponent(componentContext: any, userQuestion?: string): Promise<string> {
    const ai = getGeminiClient();
    const prompt = `Provided component data (treat as source of truth):\n${JSON.stringify(componentContext)}\n\nUser question: ${userQuestion || 'Explain this component and safe Arduino usage.'}`;
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: { systemInstruction: 'Explain hardware accurately. Never invent specifications, pinouts, ratings, or part-specific claims not supported by the supplied component data.' },
    });
    const text = response.text?.trim();
    if (!text) throw new Error('Gemini returned an empty component explanation. Please retry.');
    return text;
  },

  async getHint(challengeTitle: string, problem: string, currentCode: string, hintLevel = 1): Promise<string> {
    const ai = getGeminiClient();
    const safeLevel = Math.max(1, Math.min(3, hintLevel));
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Challenge: ${challengeTitle}\nProblem: ${problem}\nHint level: ${safeLevel}\nCurrent code:\n\`\`\`\n${currentCode}\n\`\`\``,
      config: { systemInstruction: 'Give one targeted Socratic programming hint. Do not reveal the full solution.' },
    });
    const text = response.text?.trim();
    if (!text) throw new Error('Gemini returned an empty hint. Please retry.');
    return text;
  },
};
