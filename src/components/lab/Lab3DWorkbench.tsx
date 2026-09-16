import React, { useMemo, useState } from 'react';
import { Box, Cpu, Gauge, Layers3, MonitorCog, Radio, RotateCcw, SlidersHorizontal, Terminal, Zap } from 'lucide-react';
import { ThreeSimulatorCanvas } from '../simulator/ThreeSimulatorCanvas';
import { MonacoEditorPanel } from '../editor/MonacoEditorPanel';
import { useSimulation } from '../../contexts/SimulationContext';

const PRESETS = {
  rover: {
    label: 'Autonomous Rover',
    description: 'Obstacle avoidance with ultrasonic sensing and a servo turret.',
    code: `// RoboLearn autonomous rover\n// HC-SR04 + servo + dual motor driver\nconst int trigPin = 11;\nconst int echoPin = 12;\nconst int ledPin = 13;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n  pinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n  long distance = readDistance();\n  Serial.print("Distance: ");\n  Serial.print(distance);\n  Serial.println(" cm");\n\n  if (distance < 20) {\n    digitalWrite(ledPin, HIGH);\n    // stop -> turn -> continue\n  } else {\n    digitalWrite(ledPin, LOW);\n    // drive forward\n  }\n  delay(100);\n}\n\nlong readDistance() {\n  digitalWrite(trigPin, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trigPin, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n  long duration = pulseIn(echoPin, HIGH);\n  return duration * 0.034 / 2;\n}`
  },
  led: {
    label: 'LED Telemetry',
    description: 'Blink an LED and inspect GPIO state in the virtual console.',
    code: `const int ledPin = 13;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(ledPin, HIGH);\n  Serial.println("GPIO 13 HIGH");\n  delay(500);\n  digitalWrite(ledPin, LOW);\n  Serial.println("GPIO 13 LOW");\n  delay(500);\n}`
  },
  servo: {
    label: 'Servo Sweep',
    description: 'Test a 180-degree SG90 servo motion profile.',
    code: `#include <Servo.h>\n\nServo turret;\n\nvoid setup() {\n  Serial.begin(9600);\n  turret.attach(9);\n}\n\nvoid loop() {\n  for (int angle = 0; angle <= 180; angle += 10) {\n    turret.write(angle);\n    Serial.println(angle);\n    delay(80);\n  }\n  for (int angle = 180; angle >= 0; angle -= 10) {\n    turret.write(angle);\n    Serial.println(angle);\n    delay(80);\n  }\n}`
  }
} as const;

type PresetKey = keyof typeof PRESETS;

const panelClass = 'rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80';
const buttonClass = 'flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-xs font-semibold transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:hover:bg-slate-900';

export const Lab3DWorkbench: React.FC = () => {
  const [preset, setPreset] = useState<PresetKey>('rover');
  const [code, setCode] = useState(PRESETS.rover.code);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const { state, setCameraViewMode, setObstacleDistance, setSpeedMultiplier, resetSimulation, stopSimulation } = useSimulation();

  const selectedPreset = useMemo(() => PRESETS[preset], [preset]);
  const statusLabel = state.isRunning ? 'RUNNING' : state.robot.status;

  const selectPreset = (key: PresetKey) => {
    setPreset(key);
    setCode(PRESETS[key].code);
  };

  return (
    <section className="min-h-screen bg-slate-50 px-3 py-4 text-slate-900 transition-colors dark:bg-[#070b14] dark:text-slate-100 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-2.5 text-cyan-600 dark:border-cyan-900/70 dark:bg-cyan-950/40 dark:text-cyan-300">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">3D Robotics Workbench</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Build → code → simulate → inspect virtual hardware.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold dark:border-slate-800 dark:bg-slate-950">
              <span className={`h-2 w-2 rounded-full ${state.isRunning ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`} />
              {statusLabel}
            </span>
            <button onClick={stopSimulation} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900">Stop</button>
            <button onClick={resetSimulation} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
          </div>
        </header>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(PRESETS) as PresetKey[]).map(key => (
            <button key={key} onClick={() => selectPreset(key)} className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${preset === key ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900'}`}>
              {PRESETS[key].label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[230px_minmax(0,1fr)_420px]">
          <aside className={`${panelClass} p-3`} aria-label="Lab controls">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400"><SlidersHorizontal className="h-4 w-4" /> Hardware & controls</div>
            <div className="space-y-1">
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/70"><div className="flex items-center gap-2 text-xs font-bold"><Cpu className="h-4 w-4 text-cyan-500" /> Arduino Uno R3</div><p className="mt-1 text-[10px] text-slate-500">ATmega328P · 16 MHz</p></div>
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/70"><div className="flex items-center gap-2 text-xs font-bold"><Radio className="h-4 w-4 text-indigo-500" /> HC-SR04 Sonar</div><p className="mt-1 text-[10px] text-slate-500">Distance: {state.obstacle.distanceToRobot} cm</p></div>
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/70"><div className="flex items-center gap-2 text-xs font-bold"><Zap className="h-4 w-4 text-amber-500" /> GPIO 13 LED</div><p className="mt-1 text-[10px] text-slate-500">{state.leds['13']?.on ? 'HIGH / ON' : 'LOW / OFF'}</p></div>
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/70"><div className="flex items-center gap-2 text-xs font-bold"><Gauge className="h-4 w-4 text-emerald-500" /> Servo</div><p className="mt-1 text-[10px] text-slate-500">{state.servos.servo_01?.angle ?? 90}° position</p></div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-500">Camera</label>
              {([['default', 'Overview'], ['top', 'Top view'], ['rover', 'Rover focus'], ['circuit', 'Circuit focus']] as const).map(([value, label]) => (
                <button key={value} onClick={() => setCameraViewMode(value)} className={`${buttonClass} ${state ? '' : ''}`}><MonitorCog className="h-3.5 w-3.5 text-cyan-500" />{label}</button>
              ))}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              <label htmlFor="obstacle-distance" className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500"><span>Obstacle</span><span className="font-mono text-slate-700 dark:text-slate-300">{state.obstacle.distanceToRobot} cm</span></label>
              <input id="obstacle-distance" type="range" min="5" max="100" value={state.obstacle.distanceToRobot} onChange={e => setObstacleDistance(Number(e.target.value))} className="w-full accent-cyan-500" />
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500"><span>Speed</span><div className="flex gap-1">{[0.5, 1, 2].map(speed => <button key={speed} onClick={() => setSpeedMultiplier(speed)} className={`rounded-lg px-2 py-1 font-mono font-bold ${state.speedMultiplier === speed ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-900'}`}>{speed}×</button>)}</div></div>
            </div>
          </aside>

          <main className={`${panelClass} min-w-0 overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
              <div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-cyan-500" /><span className="text-xs font-black">3D viewport</span></div>
              <span className="font-mono text-[10px] text-slate-500">LIVE · {state.speedMultiplier}×</span>
            </div>
            <div className="p-2 sm:p-3">
              <ThreeSimulatorCanvas heightClass="h-[430px] sm:h-[520px] lg:h-[560px] xl:h-[620px]" showToolbar />
            </div>
            <div className="grid grid-cols-2 gap-px border-t border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-4">
              {[['LED', state.leds['13']?.on ? 'ON' : 'OFF'], ['SERVO', `${state.servos.servo_01?.angle ?? 90}°`], ['ROVER', state.robot.status], ['SONAR', `${state.obstacle.distanceToRobot} cm`]].map(([label, value]) => <div key={label} className="bg-white px-3 py-2 dark:bg-slate-950"><p className="text-[9px] font-black text-slate-500">{label}</p><p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{value}</p></div>)}
            </div>
          </main>

          <aside className={`${panelClass} min-w-0 overflow-hidden`} aria-label="Code editor">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 dark:border-slate-800"><div className="flex items-center gap-2"><Terminal className="h-4 w-4 text-cyan-500" /><span className="text-xs font-black">Firmware editor</span></div><span className="font-mono text-[10px] text-slate-500">C++ / Arduino</span></div>
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"><p className="text-[11px] font-bold">{selectedPreset.label}</p><p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{selectedPreset.description}</p></div>
            <div className="p-2">
              <MonacoEditorPanel key={preset} initialCode={code} language="cpp" targetBoard="Arduino Uno" height="520px" />
            </div>
          </aside>
        </div>

        <section className={`${panelClass} mt-4 overflow-hidden`}>
          <button onClick={() => setConsoleOpen(open => !open)} className="flex min-h-11 w-full items-center justify-between px-3 text-left" aria-expanded={consoleOpen}>
            <span className="flex items-center gap-2 text-xs font-black"><Terminal className="h-4 w-4 text-cyan-500" /> Serial console & events</span>
            <span className="text-[10px] font-bold text-slate-500">{consoleOpen ? 'Collapse' : `${state.serialLogs.length} events`}</span>
          </button>
          {consoleOpen && <div className="max-h-48 overflow-auto border-t border-slate-200 bg-slate-950 px-3 py-2 font-mono text-[10px] dark:border-slate-800">{state.serialLogs.slice(-40).map((log, index) => <div key={`${log.timestamp}-${index}`} className={`py-1 ${log.type === 'error' ? 'text-rose-400' : log.type === 'info' ? 'text-cyan-300' : 'text-slate-300'}`}><span className="mr-2 text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>{log.text}</div>)}</div>}
        </section>
      </div>
    </section>
  );
};
