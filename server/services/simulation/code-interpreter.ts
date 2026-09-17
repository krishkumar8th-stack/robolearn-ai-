import { SimulationAction } from '../../../src/types/index.js';

export interface CodeInterpretationResult {
  success: boolean;
  supported: boolean;
  message: string;
  actions: SimulationAction[];
  logs: string[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

export function parseAndInterpretCode(code: string, language = 'cpp'): CodeInterpretationResult {
  if (!code.trim()) {
    return { success: false, supported: false, message: 'Code editor is empty.', actions: [], logs: ['[COMPILER] No source code supplied.'] };
  }

  if (language !== 'cpp' && language !== 'c') {
    return {
      success: false,
      supported: false,
      message: `The virtual hardware bridge currently supports Arduino C/C++ execution.`,
      actions: [],
      logs: ['[COMPILER] Use Arduino C/C++ for hardware simulation.']
    };
  }

  const source = stripComments(code);
  const lines = source.split('\n');
  const actions: SimulationAction[] = [];
  const logs: string[] = [];
  let unsupportedCount = 0;

  const addDelayToPreviousAction = (ms: number) => {
    if (actions.length === 0) {
      logs.push(`[TIMING] Initial delay ${ms} ms ignored until a hardware action is available.`);
      return;
    }
    const previous = actions[actions.length - 1];
    previous.duration = Math.max(previous.duration || 0, ms);
    previous.delayMs = ms;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const digital = line.match(/digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*(HIGH|LOW|1|0)\s*\)\s*;?/i);
    if (digital) {
      const on = digital[2].toUpperCase() === 'HIGH' || digital[2] === '1';
      actions.push({ type: 'LED_SET', pin: digital[1], componentId: 'led', state: on ? 'ON' : 'OFF', duration: 50 });
      logs.push(`[GPIO] Pin ${digital[1]} → ${on ? 'HIGH' : 'LOW'}`);
      continue;
    }

    const servo = line.match(/(?:\b([A-Za-z_]\w*)\s*\.\s*)?write\s*\(\s*(\d+(?:\.\d+)?)\s*\)\s*;?/i);
    if (servo && !/digitalWrite|analogWrite/i.test(line)) {
      const angle = clamp(Number(servo[2]), 0, 180);
      actions.push({ type: 'SERVO_SET', componentId: 'servo', angle, duration: 250 });
      logs.push(`[SERVO] ${angle}°`);
      continue;
    }

    const tone = line.match(/tone\s*\(\s*\d+\s*,\s*(\d+)\s*(?:,\s*(\d+)\s*)?\)\s*;?/i);
    if (tone) {
      const frequency = Number(tone[1]);
      const duration = Number(tone[2] || 200);
      actions.push({ type: 'BUZZER_TONE', frequency, duration });
      logs.push(`[BUZZER] ${frequency} Hz for ${duration} ms`);
      continue;
    }

    const distanceRead = /(?:pulseIn|getDistance|getSonarDistance|readDistance|readUltrasonic)/i.test(line);
    if (distanceRead) {
      actions.push({ type: 'ULTRASONIC_PING', distance: 20, duration: 100 });
      logs.push('[SONAR] HC-SR04 reading: 20 cm');
      continue;
    }

    if (/(?:robotForward|forward|moveForward)\s*\(/i.test(line)) {
      actions.push({ type: 'ROBOT_MOVE', direction: 'FORWARD', duration: 1200 });
      logs.push('[ROBOT] Forward');
      continue;
    }
    if (/(?:robotBackward|backward|moveBackward)\s*\(/i.test(line)) {
      actions.push({ type: 'ROBOT_MOVE', direction: 'BACKWARD', duration: 1200 });
      logs.push('[ROBOT] Backward');
      continue;
    }
    if (/(?:robotTurnLeft|turnLeft)\s*\(/i.test(line)) {
      actions.push({ type: 'ROBOT_TURN', direction: 'LEFT', angle: 90, duration: 700 });
      logs.push('[ROBOT] Left 90°');
      continue;
    }
    if (/(?:robotTurnRight|turnRight)\s*\(/i.test(line)) {
      actions.push({ type: 'ROBOT_TURN', direction: 'RIGHT', angle: 90, duration: 700 });
      logs.push('[ROBOT] Right 90°');
      continue;
    }
    if (/(?:robotStop|stopMotors|stop)\s*\(/i.test(line)) {
      actions.push({ type: 'ROBOT_STOP', duration: 100 });
      logs.push('[ROBOT] Stop');
      continue;
    }

    const delay = line.match(/delay\s*\(\s*(\d+)\s*\)\s*;?/i);
    if (delay) {
      addDelayToPreviousAction(Number(delay[1]));
      continue;
    }

    if (/^\s*(?:#include|using\b|const\b|int\b|float\b|double\b|bool\b|long\b|byte\b|String\b|pinMode\b|Serial\.|void\b|if\b|else\b|for\b|while\b|\{|\}|return\b)/i.test(line)) {
      continue;
    }

    unsupportedCount++;
  }

  // A sensor-driven rover still uses the configured virtual sensor distance,
  // rather than pretending the user's C++ was executed by a native compiler.
  const hasObstacleLogic =
    /distance/i.test(source) &&
    /(?:turnLeft|turnRight)/i.test(source) &&
    /(?:forward|moveForward|robotForward)/i.test(source);

  if (hasObstacleLogic) {
    actions.push(
      { type: 'OBSTACLE_DETECT', distance: 20, duration: 150 },
      { type: 'ROBOT_STOP', duration: 100 },
      { type: /turnLeft/i.test(source) ? 'ROBOT_TURN' : 'ROBOT_TURN', direction: /turnLeft/i.test(source) ? 'LEFT' : 'RIGHT', angle: 90, duration: 700 },
      { type: 'ROBOT_MOVE', direction: 'FORWARD', duration: 1200 }
    );
    logs.push('[CONTROL] Obstacle branch detected; using virtual sensor value 20 cm.');
  }

  if (actions.length === 0) {
    return {
      success: false,
      supported: false,
      message: 'No supported hardware instruction was found.',
      actions: [],
      logs: ['[COMPILER] Supported examples: digitalWrite, Servo.write, tone, ultrasonic reads, and rover motion helpers.']
    };
  }

  const suffix = unsupportedCount > 0
    ? ` ${unsupportedCount} statement(s) were skipped because the virtual hardware bridge does not execute arbitrary C++.`
    : '';

  return {
    success: true,
    supported: true,
    message: `Compiled ${actions.length} hardware action(s) for the virtual lab.${suffix}`,
    actions,
    logs
  };
}
