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

const initialRobotState = {
  x: 0,
  z: 2.2,
  rotationY: 0,
  speed: 0,
  status: 'IDLE' as const
};

const initialObstacleState = {
  x: 0,
  z: -2.0,
  distanceToRobot: 42
};

const defaultSimulationState: SimulationState = {
  isRunning: false,
  isPaused: false,
  speedMultiplier: 1,
  leds: {
    '13': { on: false, brightness: 0 },
    led_01: { on: false, brightness: 0 }
  },
  servos: {
    servo_01: { angle: 90 }
  },
  motors: {
    motor_left: { speed: 0, direction: 'STOP' },
    motor_right: { speed: 0, direction: 'STOP' }
  },
  robot: { ...initialRobotState },
  obstacle: { ...initialObstacleState },
  serialLogs: [
    { timestamp: Date.now(), text: 'RoboLearn Virtual Hardware Bridge initialized.', type: 'info' },
    { timestamp: Date.now(), text: 'ATmega328P clock: 16MHz | Baud: 9600 | 5V DC Bus OK', type: 'info' }
  ]
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SimulationState>(defaultSimulationState);
  const [selected3DComponent, setSelected3DComponent] = useState<string | null>('arduino-uno');
  const [cameraViewMode, setCameraViewMode] = useState<'default' | 'top' | 'rover' | 'circuit'>('default');

  const animationFrameRef = useRef<number | null>(null);
  const actionTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runIdRef = useRef(0);
  const lastUiUpdateRef = useRef(0);

  const clearSimulationWork = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    actionTimersRef.current.forEach(clearTimeout);
    actionTimersRef.current = [];
    runIdRef.current += 1;
  };

  const appendLog = (text: string, type: 'info' | 'output' | 'error' = 'output') => {
    setState(prev => ({
      ...prev,
      serialLogs: [...prev.serialLogs.slice(-100), { timestamp: Date.now(), text, type }]
    }));
  };

  const stopSimulation = () => {
    clearSimulationWork();
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      motors: {
        motor_left: { speed: 0, direction: 'STOP' },
        motor_right: { speed: 0, direction: 'STOP' }
      },
      robot: {
        ...prev.robot,
        speed: 0,
        status: 'IDLE'
      }
    }));
    appendLog('[SIMULATOR] Simulation stopped by user.', 'info');
  };

  const resetSimulation = () => {
    clearSimulationWork();
    lastUiUpdateRef.current = 0;
    setState({
      ...defaultSimulationState,
      serialLogs: [
        { timestamp: Date.now(), text: '[SIMULATOR] Scene and microcontrollers reset to factory state.', type: 'info' }
      ]
    });
  };

  const setObstacleDistance = (dist: number) => {
    setState(prev => {
      const obstacleZ = prev.robot.z - (dist * 0.1);
      return {
        ...prev,
        obstacle: {
          x: 0,
          z: obstacleZ,
          distanceToRobot: Math.max(2, Math.round(dist))
        }
      };
    });
  };

  const setSpeedMultiplier = (mult: number) => {
    setState(prev => ({ ...prev, speedMultiplier: mult }));
  };

  const runActions = (actions: SimulationAction[], userLogs?: string[]) => {
    clearSimulationWork();
    const runId = runIdRef.current;

    if (userLogs) userLogs.forEach(l => appendLog(l, 'info'));

    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false
    }));

    appendLog(`[SIMULATOR] Executing ${actions.length} validated hardware action(s)...`, 'info');

    const executeAction = (index: number) => {
      if (runId !== runIdRef.current) return;
      if (index >= actions.length) {
        appendLog('[SIMULATOR] Routine completed successfully.', 'info');
        setState(prev => ({ ...prev, isRunning: false }));
        return;
      }

      const act = actions[index];
      const executeSpeed = Math.max(0.25, state.speedMultiplier);
      const duration = (act.duration || 800) / executeSpeed;

      setState(prev => {
        if (runId !== runIdRef.current) return prev;
        const next = { ...prev };
        switch (act.type) {
          case 'LED_SET': {
            const isHigh = act.state === 'ON' || act.state === true;
            next.leds = {
              ...next.leds,
              '13': { on: isHigh, brightness: isHigh ? 1 : 0 },
              led_01: { on: isHigh, brightness: isHigh ? 1 : 0 }
            };
            break;
          }
          case 'LED_BLINK': {
            const isCurrentlyOn = prev.leds['13']?.on;
            next.leds = {
              ...next.leds,
              '13': { on: !isCurrentlyOn, brightness: !isCurrentlyOn ? 1 : 0 },
              led_01: { on: !isCurrentlyOn, brightness: !isCurrentlyOn ? 1 : 0 }
            };
            break;
          }
          case 'SERVO_SET': {
            next.servos = { ...next.servos, servo_01: { angle: act.angle ?? 90 } };
            break;
          }
          case 'ROBOT_MOVE': {
            const isFwd = act.direction === 'FORWARD';
            next.robot = { ...next.robot, speed: isFwd ? 1 : -1, status: 'MOVING' };
            next.motors = {
              motor_left: { speed: 200, direction: isFwd ? 'FORWARD' : 'BACKWARD' },
              motor_right: { speed: 200, direction: isFwd ? 'FORWARD' : 'BACKWARD' }
            };
            break;
          }
          case 'ROBOT_TURN': {
            const isLeft = act.direction === 'LEFT';
            next.robot = {
              ...next.robot,
              rotationY: next.robot.rotationY + (isLeft ? Math.PI / 2 : -Math.PI / 2),
              status: 'TURNING'
            };
            next.motors = {
              motor_left: { speed: 180, direction: isLeft ? 'BACKWARD' : 'FORWARD' },
              motor_right: { speed: 180, direction: isLeft ? 'FORWARD' : 'BACKWARD' }
            };
            break;
          }
          case 'ROBOT_STOP': {
            next.robot = { ...next.robot, speed: 0, status: 'IDLE' };
            next.motors = {
              motor_left: { speed: 0, direction: 'STOP' },
              motor_right: { speed: 0, direction: 'STOP' }
            };
            break;
          }
          case 'OBSTACLE_DETECT': {
            next.obstacle = { ...next.obstacle, distanceToRobot: act.distance || 18 };
            next.robot = { ...next.robot, status: 'STOPPED_OBSTACLE' };
            break;
          }
          case 'ULTRASONIC_PING': {
            next.obstacle = { ...next.obstacle, distanceToRobot: act.distance || 20 };
            break;
          }
        }
        return next;
      });

      const timer = setTimeout(() => executeAction(index + 1), duration);
      actionTimersRef.current.push(timer);
    };

    executeAction(0);
  };

  // Keep continuous physics in refs/frame-time, but publish to React at a capped UI rate.
  // The Three.js scene can remain smooth while React consumers avoid 60 state updates/sec.
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (time - lastUiUpdateRef.current >= 66) {
        lastUiUpdateRef.current = time;
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
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => () => clearSimulationWork(), []);

  return (
    <SimulationContext.Provider
      value={{
        state,
        selected3DComponent,
        cameraViewMode,
        setSelected3DComponent,
        setCameraViewMode,
        runActions,
        stopSimulation,
        resetSimulation,
        setObstacleDistance,
        setSpeedMultiplier,
        appendLog
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within a SimulationProvider');
  return context;
}
