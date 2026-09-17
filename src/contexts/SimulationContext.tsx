import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { SimulationAction, SimulationState } from '../types/index';

interface SimulationContextType {
  state: SimulationState;
  selected3DComponent: string | null;
  cameraViewMode: 'default' | 'top' | 'rover' | 'circuit';
  setSelected3DComponent: (id: string | null) => void;
  setCameraViewMode: (mode: 'default' | 'top' | 'rover' | 'circuit') => void;
  runActions: (actions: SimulationAction[], userLogs?: string[]) => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  setObstacleDistance: (distance: number) => void;
  setSpeedMultiplier: (mult: number) => void;
  appendLog: (text: string, type?: 'info' | 'output' | 'error') => void;
}

const initialRobotState = { x: 0, z: 2.2, rotationY: 0, speed: 0, status: 'IDLE' as const };
const initialObstacleState = { x: 0, z: -2.0, distanceToRobot: 42 };

const createInitialState = (): SimulationState => ({
  isRunning: false,
  isPaused: false,
  speedMultiplier: 1,
  leds: { '13': { on: false, brightness: 0 }, led_01: { on: false, brightness: 0 } },
  servos: { servo_01: { angle: 90 } },
  motors: {
    motor_left: { speed: 0, direction: 'STOP' },
    motor_right: { speed: 0, direction: 'STOP' }
  },
  robot: { ...initialRobotState },
  obstacle: { ...initialObstacleState },
  serialLogs: [
    { timestamp: Date.now(), text: 'Virtual hardware bridge ready.', type: 'info' },
    { timestamp: Date.now(), text: 'Arduino Uno profile • 16 MHz • 9600 baud', type: 'info' }
  ]
});

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SimulationState>(createInitialState);
  const [selected3DComponent, setSelected3DComponent] = useState<string | null>('arduino-uno');
  const [cameraViewMode, setCameraViewMode] = useState<'default' | 'top' | 'rover' | 'circuit'>('default');

  const animationFrameRef = useRef<number | null>(null);
  const actionTimersRef = useRef<number[]>([]);
  const speedMultiplierRef = useRef(1);

  const appendLog = (text: string, type: 'info' | 'output' | 'error' = 'output') => {
    setState(prev => ({
      ...prev,
      serialLogs: [...prev.serialLogs.slice(-100), { timestamp: Date.now(), text, type }]
    }));
  };

  const clearScheduledActions = () => {
    actionTimersRef.current.forEach(timer => window.clearTimeout(timer));
    actionTimersRef.current = [];
  };

  const stopSimulation = () => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    clearScheduledActions();
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      motors: { motor_left: { speed: 0, direction: 'STOP' }, motor_right: { speed: 0, direction: 'STOP' } },
      robot: { ...prev.robot, speed: 0, status: 'IDLE' }
    }));
    appendLog('[SIMULATOR] Stopped.', 'info');
  };

  const resetSimulation = () => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    clearScheduledActions();
    setState(createInitialState());
  };

  const setObstacleDistance = (dist: number) => {
    const safeDistance = Math.max(2, Math.min(400, Number(dist) || 20));
    setState(prev => ({
      ...prev,
      obstacle: { x: prev.obstacle.x, z: prev.robot.z - safeDistance * 0.1, distanceToRobot: Math.round(safeDistance) }
    }));
  };

  const setSpeedMultiplier = (mult: number) => {
    const safeMultiplier = Math.max(0.25, Math.min(4, Number(mult) || 1));
    speedMultiplierRef.current = safeMultiplier;
    setState(prev => ({ ...prev, speedMultiplier: safeMultiplier }));
  };

  const runActions = (actions: SimulationAction[], userLogs?: string[]) => {
    if (!actions.length) {
      appendLog('[SIMULATOR] Nothing to execute.', 'error');
      return;
    }

    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    clearScheduledActions();

    userLogs?.forEach(log => appendLog(log, 'info'));
    setState(prev => ({ ...prev, isRunning: true, isPaused: false }));
    appendLog(`[SIMULATOR] Executing ${actions.length} action(s).`, 'info');

    const executeAction = (index: number) => {
      if (index >= actions.length) {
        setState(prev => ({ ...prev, isRunning: false, isPaused: false }));
        appendLog('[SIMULATOR] Routine complete.', 'info');
        return;
      }

      const action = actions[index];
      const duration = Math.max(50, (action.duration ?? 250) / speedMultiplierRef.current);

      setState(prev => {
        const next = { ...prev };
        switch (action.type) {
          case 'LED_SET': {
            const on = action.state === 'ON' || action.state === true;
            next.leds = {
              ...next.leds,
              [String(action.pin ?? '13')]: { on, brightness: on ? 1 : 0 },
              '13': { on, brightness: on ? 1 : 0 }
            };
            break;
          }
          case 'LED_BLINK': {
            const on = !prev.leds['13']?.on;
            next.leds = { ...next.leds, '13': { on, brightness: on ? 1 : 0 }, led_01: { on, brightness: on ? 1 : 0 } };
            break;
          }
          case 'SERVO_SET':
            next.servos = { ...next.servos, servo_01: { angle: Math.max(0, Math.min(180, action.angle ?? 90)) } };
            break;
          case 'SERVO_SWEEP':
            next.servos = { ...next.servos, servo_01: { angle: Math.max(0, Math.min(180, action.angle ?? 90)) } };
            break;
          case 'MOTOR_SPEED': {
            const speed = Math.max(0, Math.min(255, action.speed ?? 0));
            const direction = action.direction === 'BACKWARD' ? 'BACKWARD' : action.direction === 'FORWARD' ? 'FORWARD' : 'STOP';
            next.motors = {
              motor_left: { speed, direction },
              motor_right: { speed, direction }
            };
            break;
          }
          case 'ROBOT_MOVE': {
            const forward = action.direction !== 'BACKWARD';
            next.robot = { ...next.robot, speed: forward ? 1 : -1, status: 'MOVING' };
            next.motors = {
              motor_left: { speed: 200, direction: forward ? 'FORWARD' : 'BACKWARD' },
              motor_right: { speed: 200, direction: forward ? 'FORWARD' : 'BACKWARD' }
            };
            break;
          }
          case 'ROBOT_TURN': {
            const left = action.direction === 'LEFT';
            next.robot = {
              ...next.robot,
              rotationY: next.robot.rotationY + (left ? Math.PI / 2 : -Math.PI / 2),
              status: 'TURNING'
            };
            next.motors = {
              motor_left: { speed: 180, direction: left ? 'BACKWARD' : 'FORWARD' },
              motor_right: { speed: 180, direction: left ? 'FORWARD' : 'BACKWARD' }
            };
            break;
          }
          case 'ROBOT_STOP':
            next.robot = { ...next.robot, speed: 0, status: 'IDLE' };
            next.motors = { motor_left: { speed: 0, direction: 'STOP' }, motor_right: { speed: 0, direction: 'STOP' } };
            break;
          case 'OBSTACLE_DETECT':
            next.obstacle = { ...next.obstacle, distanceToRobot: Math.max(2, action.distance ?? 20) };
            next.robot = { ...next.robot, status: 'STOPPED_OBSTACLE', speed: 0 };
            break;
          case 'ULTRASONIC_PING':
            next.obstacle = { ...next.obstacle, distanceToRobot: Math.max(2, action.distance ?? 20) };
            break;
          case 'BUZZER_TONE':
            break;
        }
        return next;
      });

      const timer = window.setTimeout(() => executeAction(index + 1), duration);
      actionTimersRef.current.push(timer);
    };

    executeAction(0);
  };

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      setState(prev => {
        if (!prev.isRunning || prev.robot.status !== 'MOVING') return prev;
        const speedVal = prev.robot.speed * 0.8 * prev.speedMultiplier;
        const heading = prev.robot.rotationY;
        const newX = prev.robot.x - Math.sin(heading) * speedVal * delta;
        const newZ = prev.robot.z - Math.cos(heading) * speedVal * delta;
        const dx = prev.obstacle.x - newX;
        const dz = prev.obstacle.z - newZ;
        const distCm = Math.max(2, Math.round(Math.sqrt(dx * dx + dz * dz) * 10));
        return {
          ...prev,
          robot: { ...prev.robot, x: newX, z: newZ },
          obstacle: { ...prev.obstacle, distanceToRobot: distCm }
        };
      });
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <SimulationContext.Provider value={{
      state, selected3DComponent, cameraViewMode,
      setSelected3DComponent, setCameraViewMode,
      runActions, stopSimulation, resetSimulation,
      setObstacleDistance, setSpeedMultiplier, appendLog
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within a SimulationProvider');
  return context;
}
