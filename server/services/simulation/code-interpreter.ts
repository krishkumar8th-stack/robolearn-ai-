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

function readNumber(value: string, variables: Record<string, number>, fallback = 0): number {
  const trimmed = value.trim();
  if (/^[-+]?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (trimmed in variables) return variables[trimmed];
  const numeric = Number(trimmed.replace(/[^0-9.+-]/g, ''));
  return Number.isFinite(numeric) && numeric !== 0 ? numeric : fallback;
}

function evaluateCondition(condition: string, variables: Record<string, number>): boolean {
  const normalized = condition.trim().replace(/^\(|\)$/g, '');
  const orParts = normalized.split(/\|\|/);
  if (orParts.length > 1) return orParts.some(part => evaluateCondition(part, variables));
  const andParts = normalized.split(/&&/);
  if (andParts.length > 1) return andParts.every(part => evaluateCondition(part, variables));

  const match = normalized.match(/^(.+?)\s*(<=|>=|==|!=|<|>)\s*(.+)$/);
  if (!match) return Boolean(readNumber(normalized, variables, 0));
  const left = readNumber(match[1], variables);
  const right = readNumber(match[3], variables);
  switch (match[2]) {
    case '<': return left < right;
    case '<=': return left <= right;
    case '>': return left > right;
    case '>=': return left >= right;
    case '==': return left === right;
    case '!=': return left !== right;
    default: return false;
  }
}

function extractSelectedIfBranches(source: string, variables: Record<string, number>, logs: string[]): { source: string; handled: number } {
  let handled = 0;
  const pattern = /if\s*\(([^()]*)\)\s*\{([\s\S]*?)\}(?:\s*else\s*\{([\s\S]*?)\})?/gi;
  const selected = source.replace(pattern, (_match, condition: string, whenTrue: string, whenFalse?: string) => {
    handled += 1;
    const result = evaluateCondition(condition, variables);
    logs.push(`[CONTROL] ${condition.trim()} → ${result ? 'true' : 'false'}`);
    return result ? whenTrue : (whenFalse || '');
  });
  return { source: selected, handled };
}

function expandNumericForLoops(source: string, logs: string[]): { source: string; handled: number } {
  let handled = 0;
  const pattern = /for\s*\(\s*(?:int|long)\s+(\w+)\s*=\s*(-?\d+)\s*;\s*\1\s*(<=|>=|<|>)\s*(-?\d+)\s*;\s*\1\s*(\+\+|--|\+=\s*\d+|-=\s*\d+)\s*\)\s*\{([\s\S]*?)\}/gi;
  const expanded = source.replace(pattern, (_match, variable: string, startRaw: string, operator: string, endRaw: string, stepRaw: string, body: string) => {
    handled += 1;
    const start = Number(startRaw);
    const end = Number(endRaw);
    const stepMatch = stepRaw.match(/(\+\+|--|\+=\s*(\d+)|-=\s*(\d+))/);
    const step = stepMatch?.[1] === '--' || stepMatch?.[3] ? -(Number(stepMatch?.[3] || 1)) : Number(stepMatch?.[2] || 1);
    if (!step) return '';
    const values: number[] = [];
    const valid = (value: number) => operator === '<' ? value < end : operator === '<=' ? value <= end : operator === '>' ? value > end : value >= end;
    for (let value = start, guard = 0; valid(value) && guard < 100; value += step, guard += 1) values.push(value);
    logs.push(`[LOOP] Expanded ${variable} over ${values.length} iteration(s).`);
    return values.map(value => body.replace(new RegExp(`\\\\b${variable}\\\\b`, 'g'), String(value))).join('\n');
  });
  return { source: expanded, handled };
}

function parseStatements(source: string, sensorDistance: number, actions: SimulationAction[], logs: string[]): number {
  const variables: Record<string, number> = { distance: sensorDistance, d: sensorDistance };
  let unsupportedCount = 0;

  const addDelayToPreviousAction = (ms: number) => {
    if (actions.length === 0) {
      logs.push(`[TIMING] Initial delay ${ms} ms skipped because no hardware action precedes it.`);
      return;
    }
    const previous = actions[actions.length - 1];
    previous.duration = Math.max(previous.duration || 0, ms);
    previous.delayMs = ms;
  };

  const lines = source.split(/\n|;/).map(line => line.trim()).filter(Boolean);

  for (const line of lines) {
    const assignment = line.match(/^(?:const\s+)?(?:int|long|float|double|byte)\s+(\w+)\s*=\s*([^;]+)$/i);
    if (assignment) {
      const variable = assignment[1];
      const expression = assignment[2].trim();
      if (/(?:pulseIn|getDistance|getSonarDistance|readDistance|readUltrasonic)/i.test(expression)) {
        variables[variable] = sensorDistance;
        actions.push({ type: 'ULTRASONIC_PING', distance: sensorDistance, duration: 100 });
        logs.push(`[SONAR] ${variable} = ${Math.round(sensorDistance)} cm`);
      } else {
        variables[variable] = readNumber(expression, variables, 0);
      }
      continue;
    }

    const digital = line.match(/digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*(HIGH|LOW|1|0|true|false)\s*\)\s*$/i);
    if (digital) {
      const on = /HIGH|1|true/i.test(digital[2]);
      actions.push({ type: 'LED_SET', pin: digital[1], componentId: 'led', state: on ? 'ON' : 'OFF', duration: 50 });
      logs.push(`[GPIO] Pin ${digital[1]} → ${on ? 'HIGH' : 'LOW'}`);
      continue;
    }

    const ternaryDigital = line.match(/digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*([^?]+)\?\s*(HIGH|LOW|1|0)\s*:\s*(HIGH|LOW|1|0)\s*\)\s*$/i);
    if (ternaryDigital) {
      const condition = ternaryDigital[2];
      const conditionResult = evaluateCondition(condition, variables);
      const chosen = conditionResult ? ternaryDigital[3] : ternaryDigital[4];
      const on = /HIGH|1/i.test(chosen);
      actions.push({ type: 'LED_SET', pin: ternaryDigital[1], componentId: 'led', state: on ? 'ON' : 'OFF', duration: 50 });
      logs.push(`[GPIO] Pin ${ternaryDigital[1]} → ${on ? 'HIGH' : 'LOW'} (${condition.trim()} → ${conditionResult})`);
      continue;
    }

    const analog = line.match(/analogWrite\s*\(\s*(\w+|\d+)\s*,\s*([^\)]+)\)/i);
    if (analog) {
      const speed = clamp(readNumber(analog[2], variables, 0), 0, 255);
      actions.push({ type: 'MOTOR_SPEED', pin: analog[1], speed, direction: speed > 0 ? 'FORWARD' : 'STOP', duration: 100 });
      logs.push(`[PWM] Pin ${analog[1]} → ${Math.round(speed)}/255`);
      continue;
    }

    const servo = line.match(/(?:\b([A-Za-z_]\w*)\s*\.\s*)?write\s*\(\s*([^\)]+)\)/i);
    if (servo && !/digitalWrite|analogWrite/i.test(line)) {
      const angle = clamp(readNumber(servo[2], variables, 90), 0, 180);
      actions.push({ type: 'SERVO_SET', componentId: servo[1] || 'servo', angle, duration: 250 });
      logs.push(`[SERVO] ${Math.round(angle)}°`);
      continue;
    }

    const tone = line.match(/tone\s*\(\s*\d+\s*,\s*(\d+)\s*(?:,\s*(\d+)\s*)?\)/i);
    if (tone) {
      const frequency = Number(tone[1]);
      const duration = Number(tone[2] || 200);
      actions.push({ type: 'BUZZER_TONE', frequency, duration });
      logs.push(`[BUZZER] ${frequency} Hz for ${duration} ms`);
      continue;
    }

    if (/(?:pulseIn|getDistance|getSonarDistance|readDistance|readUltrasonic)\s*\(/i.test(line)) {
      actions.push({ type: 'ULTRASONIC_PING', distance: sensorDistance, duration: 100 });
      logs.push(`[SONAR] HC-SR04 reading: ${Math.round(sensorDistance)} cm`);
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

    const delay = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
    if (delay) {
      addDelayToPreviousAction(Number(delay[1]));
      continue;
    }

    if (/^(?:#include|using\b|const\s+int|const\s+long|int\s+\w+\s*=|float\s+\w+\s*=|double\s+\w+\s*=|bool\b|byte\b|String\b|pinMode\b|Serial\.|void\b|return\b|setup\s*\(|loop\s*\(|\{|\})/i.test(line)) continue;

    unsupportedCount += 1;
  }

  return unsupportedCount;
}

export function parseAndInterpretCode(code: string, language = 'cpp', sensorDistance = 42): CodeInterpretationResult {
  if (!code.trim()) {
    return { success: false, supported: false, message: 'Code editor is empty.', actions: [], logs: ['[COMPILER] No source code supplied.'] };
  }

  if (language !== 'cpp' && language !== 'c') {
    return { success: false, supported: false, message: 'The virtual hardware bridge currently supports Arduino C/C++ only.', actions: [], logs: ['[COMPILER] Use Arduino C/C++ for hardware simulation.'] };
  }

  const safeDistance = clamp(Number(sensorDistance) || 42, 2, 400);
  const source = stripComments(code);
  const actions: SimulationAction[] = [];
  const logs: string[] = [
    `[SIM] Arduino virtual board • sensor distance ${Math.round(safeDistance)} cm`
  ];

  const variables: Record<string, number> = { distance: safeDistance, d: safeDistance };
  const branchResult = extractSelectedIfBranches(source, variables, logs);
  const loopResult = expandNumericForLoops(branchResult.source, logs);
  const unsupportedCount = parseStatements(loopResult.source, safeDistance, actions, logs);

  if (actions.length === 0) {
    return {
      success: false,
      supported: false,
      message: 'No supported hardware instruction was found. Try digitalWrite, analogWrite, Servo.write, tone, ultrasonic reads, or rover motion helpers.',
      actions: [],
      logs: [...logs, '[COMPILER] No executable virtual-hardware actions were produced.']
    };
  }

  const suffix = unsupportedCount > 0
    ? ` ${unsupportedCount} statement(s) were skipped because the lab executes a safe Arduino C/C++ hardware subset, not arbitrary native C++.`
    : '';

  return {
    success: true,
    supported: true,
    message: `Prepared ${actions.length} hardware action(s) using the current virtual sensor state.${suffix}`,
    actions,
    logs
  };
}
