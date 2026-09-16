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

export const geminiService = {
  async checkHealth(): Promise<{ status: string; hasKey: boolean; model: string }> {
    const hasKey = Boolean(process.env.GEMINI_API_KEY?.trim());
    return { status: hasKey ? 'configured' : 'missing_api_key', hasKey, model: PRIMARY_MODEL };
  },

  async chatTutor(userMessage: string, history: AIChatMessage[] = [], context?: { experienceLevel?: string; currentLesson?: string; currentCode?: string }): Promise<string> {
    const ai = getGeminiClient();
    const systemInstruction = `You are the RoboLearn AI Tutor, an expert robotics, electronics, and embedded systems professor. Guide the learner step-by-step through C, C++, Python, Arduino, ESP32, circuits, sensors, and robotics. Give conceptual hints before complete challenge solutions. Adapt to ${context?.experienceLevel || 'Beginner'} level. Keep physical-electronics advice conservative and remind learners to verify voltage, polarity, current limits, and pinouts from documentation. Format code cleanly in markdown.`;
    const recentHistory = history.slice(-8).map(msg => `${msg.sender.toUpperCase()}: ${msg.content}`).join('\n');
    const prompt = `${recentHistory ? `Previous Conversation:\n${recentHistory}\n\n` : ''}${context?.currentCode ? `Current Code:\n\`\`\`\n${context.currentCode}\n\`\`\`\n\n` : ''}User Question: ${userMessage}`;
    const response = await ai.models.generateContent({ model: FAST_MODEL, contents: prompt, config: { systemInstruction } });
    return response.text || 'I could not generate an answer right now. Please try again.';
  },

  async generateCode(userPrompt: string, targetBoard = 'Arduino Uno', language = 'cpp'): Promise<AICodeGenerationResult> {
    const ai = getGeminiClient();
    const systemInstruction = `You are the RoboLearn AI Firmware & Robotics Engineer. Generate complete working embedded code for ${targetBoard} in ${language}. Return structured JSON with language, code, requiredComponents, wiring, explanation, functionsUsed, possibleErrors, simulationSupported, simulationActions, and optional challenge. Do not invent hardware specifications. Supported simulation actions: LED_SET, LED_BLINK, SERVO_SET, SERVO_SWEEP, ROBOT_MOVE, ROBOT_TURN, ROBOT_STOP, BUZZER_TONE, OBSTACLE_DETECT.`;
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `Generate code for: ${JSON.stringify(userPrompt)}`,
      config: { systemInstruction, responseMimeType: 'application/json' },
    });
    try {
      const parsed = JSON.parse(response.text || '{}');
      if (!parsed.code || !Array.isArray(parsed.requiredComponents) || !Array.isArray(parsed.wiring)) throw new Error('Invalid structured response');
      return parsed as AICodeGenerationResult;
    } catch {
      throw new Error('AI returned an invalid code-generation response. Please retry.');
    }
  },

  async explainCode(code: string, language = 'cpp'): Promise<{ summary: string; lineByLine: { line: number; explanation: string }[]; concepts: string[] }> {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Language: ${language}\nCode:\n\`\`\`\n${code}\n\`\`\``,
      config: { systemInstruction: 'Explain this embedded code accurately. Return JSON with summary, lineByLine [{line, explanation}], and concepts [string].', responseMimeType: 'application/json' },
    });
    try {
      return JSON.parse(response.text || '{}');
    } catch {
      throw new Error('AI returned an invalid code-explanation response. Please retry.');
    }
  },

  async debugCode(code: string, language = 'cpp', errorMessage?: string, hardwareContext?: string): Promise<AIDebugResult> {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `Language: ${language}\nHardware: ${hardwareContext || 'Arduino Uno'}\nError: ${errorMessage || 'None provided'}\nCode:\n\`\`\`\n${code}\n\`\`\``,
      config: { systemInstruction: 'Debug embedded firmware accurately. Return JSON with problem, cause, solution, correctedCode, explanation, confidence, and preventionTips.', responseMimeType: 'application/json' },
    });
    try {
      return JSON.parse(response.text || '{}');
    } catch {
      throw new Error('AI returned an invalid debugging response. Please retry.');
    }
  },

  async explainComponent(componentContext: any, userQuestion?: string): Promise<string> {
    const ai = getGeminiClient();
    const prompt = `Provided component data (treat as source of truth):\n${JSON.stringify(componentContext)}\n\nUser question: ${userQuestion || 'Explain this component and safe Arduino usage.'}`;
    const response = await ai.models.generateContent({ model: FAST_MODEL, contents: prompt, config: { systemInstruction: 'Explain hardware accurately. Never invent specifications, pinouts, ratings, or part-specific claims not supported by the supplied component data.' } });
    return response.text || 'Explanation unavailable at this moment.';
  },

  async getHint(challengeTitle: string, problem: string, currentCode: string, hintLevel = 1): Promise<string> {
    const ai = getGeminiClient();
    const safeLevel = Math.max(1, Math.min(3, hintLevel));
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Challenge: ${challengeTitle}\nProblem: ${problem}\nHint level: ${safeLevel}\nCurrent code:\n\`\`\`\n${currentCode}\n\`\`\``,
      config: { systemInstruction: 'Give one targeted Socratic robotics-programming hint. Do not reveal the full solution.' },
    });
    return response.text || 'Think about your pin configuration, control flow, and timing.';
  }
};
