import React, { useState } from 'react';
import {
  Code,
  Cpu,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Play,
  ArrowRight,
  Terminal
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { MonacoEditorPanel } from '../components/editor/MonacoEditorPanel';

const LANGUAGES_DATA = [
  {
    id: 'cpp',
    name: 'C++ & Arduino',
    tag: 'Primary Robotics Language',
    desc: 'The industry standard for high-performance embedded systems, Arduino microcontrollers, and real-time robotic kinematic loops.',
    topics: [
      {
        title: 'Microcontroller Lifecycle (Setup & Loop)',
        code: `void setup() {\n  // Runs once on power-on or reset\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  // Runs continuously in an infinite loop\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`
      },
      {
        title: 'Bitwise Register Operations (Direct Port Manipulation)',
        code: `// Fast toggling without digitalWrite overhead\nvoid setup() {\n  DDRB |= (1 << DDB5); // Set Pin 13 (PB5) as OUTPUT\n}\n\nvoid loop() {\n  PORTB ^= (1 << PORTB5); // Fast toggle pin 13\n  delay(200);\n}`
      },
      {
        title: 'Interrupt Service Routines (ISRs) for Encoders',
        code: `const byte interruptPin = 2;\nvolatile int encoderTicks = 0;\n\nvoid setup() {\n  pinMode(interruptPin, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(interruptPin), countTick, RISING);\n}\n\nvoid countTick() {\n  encoderTicks++;\n}\n\nvoid loop() {\n  // Main autonomous loop continues without missing wheel ticks\n}`
      }
    ]
  },
  {
    id: 'python',
    name: 'Python & MicroPython',
    tag: 'Rapid Prototyping & ESP32',
    desc: 'Expressive and readable language designed for ESP32, Raspberry Pi Pico, and high-level autonomous robot planning.',
    topics: [
      {
        title: 'MicroPython GPIO & LED Pulse',
        code: `from machine import Pin\nimport time\n\nled = Pin(2, Pin.OUT)\n\nwhile True:\n    led.value(1) # Turn LED ON\n    time.sleep_ms(500)\n    led.value(0) # Turn LED OFF\n    time.sleep_ms(500)`
      },
      {
        title: 'MicroPython PWM Servo Control',
        code: `from machine import Pin, PWM\nimport time\n\nservo = PWM(Pin(15), freq=50)\n\ndef set_angle(angle):\n    duty = int(40 + (angle / 180.0) * 75)\n    servo.duty(duty)\n\nfor deg in [0, 90, 180, 90]:\n    set_angle(deg)\n    time.sleep(1)`
      }
    ]
  },
  {
    id: 'c',
    name: 'Pure C Language',
    tag: 'Hardware Bare-Metal',
    desc: 'Foundational language providing pointer arithmetic, memory management, and zero runtime overhead for low-power MCUs.',
    topics: [
      {
        title: 'Pointers & Memory Addresses',
        code: `#include <stdio.h>\n\nint main() {\n  int sensorReading = 1023;\n  int *ptr = &sensorReading;\n  \n  printf("Value: %d\\n", *ptr);\n  printf("RAM Address: %p\\n", (void*)ptr);\n  return 0;\n}`
      }
    ]
  }
];

export const ProgrammingPage: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState('cpp');
  const current = LANGUAGES_DATA.find(l => l.id === selectedLang) || LANGUAGES_DATA[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Code className="w-4 h-4" /> Embedded Firmware Languages
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Robotics Programming Mastery
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Learn C, C++, and Python tailored specifically for microcontrollers, sensor sampling, and motor actuation.
        </p>
      </div>

      {/* Language Selector Pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-6">
        {LANGUAGES_DATA.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setSelectedLang(lang.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedLang === lang.id
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Language Details */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded bg-slate-800 text-cyan-400 text-xs font-mono font-bold">
            {current.tag}
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{current.name}</h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
          {current.desc}
        </p>
      </div>

      {/* Code Snippets List */}
      <div className="space-y-6">
        {current.topics.map((t, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" /> {t.title}
              </h3>
              <button
                onClick={() => navigator.clipboard.writeText(t.code)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
              {t.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
