import { GoogleGenAI } from '@google/genai';
import { AIChatMessage, AICodeGenerationResult, AIDebugResult, SimulationAction } from '../../../src/types/index.js';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not configured. Real AI calls require this key.');
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

const PRIMARY_MODEL = process.env.AI_PRIMARY_MODEL || 'gemini-3.8-flash';
const FAST_MODEL = process.env.AI_FAST_MODEL || 'gemini-3.8-flash';

export const geminiService = {
  /**
   * Health check for Gemini API connectivity
   */
  async checkHealth(): Promise<{ status: string; hasKey: boolean; model: string }> {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
    return {
      status: hasKey ? 'configured' : 'missing_api_key',
      hasKey,
      model: PRIMARY_MODEL
    };
  },

  /**
   * AI Tutor Conversation
   */
  async chatTutor(
    userMessage: string,
    history: AIChatMessage[] = [],
    context?: { experienceLevel?: string; currentLesson?: string; currentCode?: string }
  ): Promise<string> {
    const ai = getGeminiClient();
    const systemInstruction = `You are the RoboLearn AI Tutor, an expert, enthusiastic robotics, electronics, and embedded systems professor.
Your role:
- Guide learners step-by-step through programming (C, C++, Python, Arduino, ESP32), circuits, sensors, and robotics.
- If the user asks for a solution to a problem or challenge, provide gentle conceptual hints first instead of giving away the entire answer immediately.
- Adapt tone to the learner's experience level: ${context?.experienceLevel || 'Beginner'}.
- Reference physical electronics safely (resistor limits, voltage polarity, common ground).
- Format code cleanly in markdown with explanatory comments.
- Keep responses engaging, supportive, and mathematically/physically accurate.`;

    const recentHistory = history.slice(-6).map(msg => `${msg.sender.toUpperCase()}: ${msg.content}`).join('\n');
    const prompt = `${recentHistory ? `Previous Conversation:\n${recentHistory}\n\n` : ''}${context?.currentCode ? `User's Current Code:\n\`\`\`\n${context.currentCode}\n\`\`\`\n\n` : ''}User Question: ${userMessage}`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I couldn't generate an answer at this moment. Please try again.";
  },

  /**
   * AI Code Generator (Prompt -> Code + Wiring + Simulation Actions)
   */
  async generateCode(
    userPrompt: string,
    targetBoard = 'Arduino Uno',
    language = 'cpp'
  ): Promise<AICodeGenerationResult> {
    const ai = getGeminiClient();

    const systemInstruction = `You are the RoboLearn AI Firmware & Robotics Engineer.
Generate complete, working, production-grade embedded microcontroller code based on the user's prompt.
Target Board: ${targetBoard}
Language: ${language}

CRITICAL: Return ONLY valid, raw JSON (no surrounding markdown backticks or commentary) matching this schema:
{
  "language": "cpp",
  "code": "// Complete working code...",
  "requiredComponents": ["arduino-uno", "led", "resistor"],
  "wiring": [
    { "from": "LED Anode", "to": "Pin 13 via 220Ω resistor", "note": "Current limiting" }
  ],
  "explanation": "Detailed step by step explanation of how the code works...",
  "functionsUsed": [
    { "name": "pinMode", "purpose": "Configures GPIO pin direction" }
  ],
  "possibleErrors": [
    "Missing current-limiting resistor will burn out the LED"
  ],
  "simulationSupported": true,
  "simulationActions": [
    { "type": "LED_BLINK", "pin": 13, "duration": 1000 }
  ],
  "challenge": {
    "title": "Level-Up Challenge",
    "prompt": "Can you modify the code to change the blink rate?"
  }
}

Supported simulation action types:
- "LED_SET" (pin, state: "ON"|"OFF")
- "LED_BLINK" (pin, duration)
- "SERVO_SET" (angle: 0-180)
- "SERVO_SWEEP" (pin, duration)
- "ROBOT_MOVE" (direction: "FORWARD"|"BACKWARD", duration)
- "ROBOT_TURN" (direction: "LEFT"|"RIGHT", angle: 90)
- "ROBOT_STOP" ()
- "BUZZER_TONE" (frequency, duration)
- "OBSTACLE_DETECT" (distance)
Set "simulationSupported": true if the action matches these physical behaviors.`;

    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `Generate code for: "${userPrompt}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      return parsed as AICodeGenerationResult;
    } catch (e) {
      console.error('Failed to parse JSON from Gemini code generator:', response.text);
      return {
        language,
        code: `// Generated code for: ${userPrompt}\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`,
        requiredComponents: ['arduino-uno', 'led', 'resistor'],
        wiring: [{ from: 'LED Anode', to: 'Pin 13 via 220 ohm resistor', note: 'Limit current' }],
        explanation: 'Default blink logic toggling digital pin 13.',
        functionsUsed: [{ name: 'digitalWrite', purpose: 'Sets pin state' }],
        possibleErrors: ['Check wire connections'],
        simulationSupported: true,
        simulationActions: [{ type: 'LED_BLINK', pin: 13, duration: 1000 }]
      };
    }
  },

  /**
   * AI Code Explainer
   */
  async explainCode(code: string, language = 'cpp'): Promise<{ summary: string; lineByLine: { line: number; explanation: string }[]; concepts: string[] }> {
    const ai = getGeminiClient();

    const systemInstruction = `You are an expert embedded software tutor.
Analyze the user's code and provide:
1. An overall executive summary of what the code achieves on the hardware.
2. A line-by-line breakdown of important instructions.
3. Key embedded systems concepts utilized (e.g. GPIO, PWM, Interrupts, Timers).
Return raw JSON in this structure:
{
  "summary": "...",
  "lineByLine": [
    { "line": 1, "explanation": "..." }
  ],
  "concepts": ["GPIO Output", "Delay Timing", "Infinite Loop"]
}`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Language: ${language}\nCode:\n\`\`\`\n${code}\n\`\`\``,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch {
      return {
        summary: 'This program configures the microcontroller to interact with connected peripherals.',
        lineByLine: [{ line: 1, explanation: 'Initializes the hardware pins and configuration.' }],
        concepts: ['Embedded Microcontroller Loop']
      };
    }
  },

  /**
   * AI Code Debugger
   */
  async debugCode(
    code: string,
    language = 'cpp',
    errorMessage?: string,
    hardwareContext?: string
  ): Promise<AIDebugResult> {
    const ai = getGeminiClient();

    const systemInstruction = `You are a world-class firmware debugger for Arduino, ESP32, and robotics.
Analyze the submitted code, error messages, and hardware setup.
Identify syntax errors, logical bugs, timing flaws, floating pin issues, or hardware mismatches.
Return ONLY raw JSON with:
{
  "problem": "Brief description of the bug",
  "cause": "Why this happens in embedded hardware or C++ syntax",
  "solution": "How to fix it step by step",
  "correctedCode": "The full working, corrected code",
  "explanation": "Detailed technical explanation",
  "confidence": "High" | "Medium" | "Low",
  "preventionTips": ["Tip 1", "Tip 2"]
}`;

    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `Language: ${language}\nHardware: ${hardwareContext || 'Arduino Uno'}\nError Message: ${errorMessage || 'None provided'}\nCode:\n\`\`\`\n${code}\n\`\`\``,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch {
      return {
        problem: 'Syntax or logic issue detected.',
        cause: 'Verify pin assignments and ensure all brackets are closed properly.',
        solution: 'Review the setup and loop structure.',
        correctedCode: code,
        explanation: 'Check for missing semicolons, correct baud rates, and valid pin numbers.',
        confidence: 'Medium',
        preventionTips: ['Always initialize pin modes in setup() before using in loop()']
      };
    }
  },

  /**
   * AI Component Explainer with verified database context (RAG)
   */
  async explainComponent(componentContext: any, userQuestion?: string): Promise<string> {
    const ai = getGeminiClient();

    const systemInstruction = `You are the RoboLearn AI Hardware Specialist.
Explain this electronic component accurately using the verified specifications and pinouts provided.
Do NOT invent specifications; prioritize the provided verified data.
Answer any specific question the user asks about this component, including working principles, safety, and robotics usage.`;

    const prompt = `Verified Component Data:
Name: ${componentContext.name}
Category: ${componentContext.category}
What it is: ${componentContext.whatIsIt}
How it works: ${componentContext.howItWorks}
Specs: ${JSON.stringify(componentContext.specifications)}
Pins: ${JSON.stringify(componentContext.pins)}
Common Mistakes: ${JSON.stringify(componentContext.commonMistakes)}

User Question: ${userQuestion || 'Explain how to use this component with an Arduino safely and what projects it enables.'}`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    return response.text || 'Explanation unavailable at this moment.';
  },

  /**
   * Progressive Hint Generator
   */
  async getHint(challengeTitle: string, problem: string, currentCode: string, hintLevel = 1): Promise<string> {
    const ai = getGeminiClient();

    const systemInstruction = `You are a Socratic robotics tutor.
Give a single targeted, pedagogical hint for the learner without giving away the full code solution.
Hint Level 1: Conceptual nudge.
Hint Level 2: Which function or logic to look at.
Hint Level 3: A small pseudocode clue.`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Challenge: "${challengeTitle}"\nProblem: ${problem}\nHint Level: ${hintLevel}\nUser's Current Code:\n\`\`\`\n${currentCode}\n\`\`\``,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return response.text || 'Think about the pin configuration in setup() and the timing loop.';
  }
};
