import React, { useState } from 'react';
import { ThreeSimulatorCanvas } from '../components/simulator/ThreeSimulatorCanvas';
import { MonacoEditorPanel } from '../components/editor/MonacoEditorPanel';
import { useSimulation } from '../contexts/SimulationContext';
import {
  Box,
  Code,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';

const PRESET_CODE_SNIPPETS: { [key: string]: { title: string; code: string; desc: string } } = {
  rover_avoidance: {
    title: 'Obstacle Avoider',
    desc: 'HC-SR04 + servo + L298N. Try changing the 20 cm threshold or turn time.',
    code: `#include <Servo.h>

const int trig = 11;
const int echo = 12;
const int led = 13;

Servo head;

void setup() {
  Serial.begin(9600);
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
  pinMode(led, OUTPUT);

  head.attach(9);
  head.write(90);
}

void loop() {
  long cm = readDistance();
  Serial.print("D: ");
  Serial.println(cm);

  if (cm > 0 && cm < 20) {
    digitalWrite(led, HIGH);
    stopRobot();
    delay(350);
    turnLeft();
    delay(650);
    stopRobot();
    digitalWrite(led, LOW);
  } else {
    forward();
    delay(250);
  }
}

long readDistance() {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  long t = pulseIn(echo, HIGH, 30000);
  return t ? (t * 0.0343) / 2 : 0;
}

void forward() {
  Serial.println("FWD");
}

void stopRobot() {
  Serial.println("STOP");
}

void turnLeft() {
  Serial.println("LEFT");
}`
  },

  led_blink: {
    title: 'LED Blink',
    desc: 'A small GPIO test on pin 13.',
    code: `const int led = 13;

void setup() {
  pinMode(led, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(led, HIGH);
  Serial.println("ON");
  delay(500);

  digitalWrite(led, LOW);
  Serial.println("OFF");
  delay(500);
}`
  },

  servo_sweep: {
    title: 'Servo Sweep',
    desc: 'Move the SG90 through three positions.',
    code: `#include <Servo.h>

Servo servo;

void setup() {
  Serial.begin(9600);
  servo.attach(9);
}

void loop() {
  servo.write(30);
  Serial.println("30");
  delay(700);

  servo.write(90);
  Serial.println("90");
  delay(700);

  servo.write(150);
  Serial.println("150");
  delay(700);
}`
  }
};

export const Lab3DPage: React.FC = () => {
  const [selectedSnippetKey, setSelectedSnippetKey] = useState('rover_avoidance');
  const [activeCode, setActiveCode] = useState(PRESET_CODE_SNIPPETS.rover_avoidance.code);

  const { state, setSpeedMultiplier, selected3DComponent, setSelected3DComponent } = useSimulation();

  const handleSelectSnippet = (key: string) => {
    setSelectedSnippetKey(key);
    setActiveCode(PRESET_CODE_SNIPPETS[key].code);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                3D Virtual Robotics & Electronics Lab
              </h1>
              <p className="text-xs text-slate-400">
                Interactive Three.js hardware simulation workbench. Write code, test circuits, and watch robots move in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Speed & Control toolbar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold hidden md:inline">Simulation Speed:</span>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2.5 py-1 rounded font-mono font-bold transition ${
                  state.speedMultiplier === spd ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code Preset Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Presets:
        </span>
        {Object.entries(PRESET_CODE_SNIPPETS).map(([key, snippet]) => (
          <button
            key={key}
            onClick={() => handleSelectSnippet(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
              selectedSnippetKey === key
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {snippet.title}
          </button>
        ))}
      </div>

      {/* Main Grid: 3D Canvas + Monaco Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Canvas */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative">
            <ThreeSimulatorCanvas heightClass="h-[520px]" showToolbar={true} />
          </div>

          {/* Hardware Quick Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Microcontroller</span>
              <p className="text-xs font-bold text-cyan-400 mt-0.5">Arduino Uno R3</p>
              <span className="text-[10px] text-slate-500">16 MHz ATmega328P</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">LED Status</span>
              <p className="text-xs font-bold text-white mt-0.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${state.leds['13']?.on ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`} />
                {state.leds['13']?.on ? 'Pin 13: ON' : 'Pin 13: OFF'}
              </p>
              <span className="text-[10px] text-slate-500">5mm Red Diffused</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Servo Position</span>
              <p className="text-xs font-bold text-indigo-400 mt-0.5 font-mono">
                {state.servos['servo_01']?.angle ?? 90}°
              </p>
              <span className="text-[10px] text-slate-500">SG90 Micro Servo</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Rover State</span>
              <p className="text-xs font-bold text-emerald-400 mt-0.5">
                {state.robot.status}
              </p>
              <span className="text-[10px] text-slate-500">Obstacle: {state.obstacle.distanceToRobot}cm</span>
            </div>
          </div>
        </div>

        {/* Right: Monaco Code Editor */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2 text-xs text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">{PRESET_CODE_SNIPPETS[selectedSnippetKey]?.title}:</span>{' '}
              {PRESET_CODE_SNIPPETS[selectedSnippetKey]?.desc} Click <strong>"Run in 3D Lab"</strong> to execute firmware commands on virtual hardware!
            </div>
          </div>

          <MonacoEditorPanel
            key={selectedSnippetKey}
            initialCode={activeCode}
            language="cpp"
            targetBoard="Arduino Uno"
            height="500px"
          />
        </div>
      </div>
    </div>
  );
};
