import * as THREE from 'three';

/**
 * Creates high-detail procedural canvas textures for the 3D lab environment
 */

// 1. Procedural ESD Anti-Static Lab Benchtop Mat Texture
export function createESDMatTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark slate-cyan anti-static silicone mat color
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle micro-texture noise
  ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Millimeter / Centimeter Engineering Grid Lines
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
  ctx.lineWidth = 1;
  const step = 32;
  for (let x = 0; x <= 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Major 100mm coordinates
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.28)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 1024; x += step * 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += step * 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Printed corner calibration scales & lab markings
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.fillText('ROBOLEARN ESD BENCHTOP SYSTEM', 40, 50);
  ctx.font = '12px monospace';
  ctx.fillText('SURFACE RESISTIVITY: 10^7 - 10^9 Ω/SQ  •  CALIBRATED 0.1MM', 40, 72);

  // Precision ruler on bottom edge
  ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
  ctx.fillRect(40, 970, 944, 2);
  for (let i = 0; i <= 944; i += 16) {
    const isMajor = i % 64 === 0;
    ctx.fillRect(40 + i, 970 - (isMajor ? 14 : 7), 2, isMajor ? 14 : 7);
    if (isMajor && i > 0) {
      ctx.font = '10px monospace';
      ctx.fillText(`${i / 16}cm`, 32 + i, 946);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 2. Arduino Uno PCB Silkscreen Texture
export function createArduinoSilkscreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  // Official Italian teal/blue solder mask color
  ctx.fillStyle = '#00878f';
  ctx.fillRect(0, 0, 512, 384);

  // PCB trace highlights (subtle copper under mask)
  ctx.strokeStyle = 'rgba(0, 110, 118, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, 100);
  ctx.lineTo(200, 100);
  ctx.lineTo(260, 160);
  ctx.stroke();

  // White Silkscreen markings
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('ARDUINO', 190, 85);

  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText('UNO', 305, 85);

  ctx.font = '9px monospace';
  ctx.fillText('MADE IN ITALY', 190, 102);

  // Digital Pins Header Silkscreen
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#f1f5f9';
  ctx.fillText('DIGITAL (PWM~)', 180, 24);
  ctx.font = '9px monospace';
  ctx.fillText('13 12 ~11 ~10 ~9 8    7 ~6 ~5 4 ~3 2 TX>1 RX<0', 120, 38);

  // Power & Analog Header Silkscreen
  ctx.fillText('POWER', 120, 360);
  ctx.fillText('ANALOG IN', 320, 360);
  ctx.fillText('IOREF RESET 3.3V 5V GND GND VIN    A0 A1 A2 A3 A4 A5', 90, 374);

  // ATmega328P Chip Markings
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('ATMEGA328P-PU', 200, 220);

  // Gold test pads / vias
  ctx.fillStyle = '#d97706';
  for (let i = 0; i < 18; i++) {
    const vx = 80 + (i * 22);
    const vy = 120 + ((i % 3) * 16);
    ctx.beginPath();
    ctx.arc(vx, vy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Official Infinity Logo
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(150, 80, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(168, 80, 10, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 3. Realistic Solderless Breadboard Canvas Texture
export function createBreadboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Off-white / Cream ABS Plastic body
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 256);

  // Top Red Power Bus Line (+)
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(20, 22, 472, 3);
  ctx.font = 'bold 14px monospace';
  ctx.fillText('+', 8, 26);

  // Top Blue Ground Bus Line (-)
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(20, 48, 472, 3);
  ctx.fillText('-', 8, 52);

  // Bottom Blue Ground Bus Line (-)
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(20, 204, 472, 3);
  ctx.fillText('-', 8, 208);

  // Bottom Red Power Bus Line (+)
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(20, 230, 472, 3);
  ctx.fillText('+', 8, 234);

  // Center divider trench
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(20, 122, 472, 8);

  // Tie point hole matrix & coordinate markings
  ctx.fillStyle = '#475569';
  ctx.font = '8px monospace';

  // Row coordinate numbers: 1 to 30
  for (let col = 0; col < 30; col++) {
    const x = 32 + (col * 15.5);
    if ((col + 1) % 5 === 0 || col === 0) {
      ctx.fillText(`${col + 1}`, x - 4, 70);
      ctx.fillText(`${col + 1}`, x - 4, 185);
    }

    // Upper 5 pin sockets (A, B, C, D, E)
    for (let row = 0; row < 5; row++) {
      const y = 76 + (row * 8.5);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      // Silver metal contact clip inside hole
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x - 0.5, y - 0.5, 1.5, 1.5);
    }

    // Lower 5 pin sockets (F, G, H, I, J)
    for (let row = 0; row < 5; row++) {
      const y = 138 + (row * 8.5);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x - 0.5, y - 0.5, 1.5, 1.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 4. Oscilloscope Waveform Screen Dynamic Canvas Texture
export class OscilloscopeScreen {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 192;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  update(time: number, isLedOn: boolean, distance: number) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Dark phosphorescent green CRT background
    ctx.fillStyle = '#021810';
    ctx.fillRect(0, 0, w, h);

    // Grid reticle
    ctx.strokeStyle = '#053822';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Channel 1: Sonar Echo Waveform (Cyan)
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    const freq = Math.max(1, 40 / (distance || 20));
    for (let x = 0; x < w; x++) {
      const y = 70 + Math.sin((x * 0.08 * freq) + (time * 12)) * 25 * Math.sin(x * 0.02);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Channel 2: Digital PWM Pin 13 Pulse (Glowing Amber/Yellow)
    ctx.strokeStyle = isLedOn ? '#facc15' : '#475569';
    ctx.shadowColor = isLedOn ? '#facc15' : 'transparent';
    ctx.shadowBlur = isLedOn ? 8 : 0;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const period = 64;
      const isHigh = isLedOn || ((x + Math.floor(time * 60)) % period < (period / 2));
      const y = isHigh ? 130 : 160;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // On-screen telemetry text
    ctx.fillStyle = '#4ade80';
    ctx.font = '10px monospace';
    ctx.fillText('CH1: 2.0V/DIV  CH2: 5.0V/DIV', 12, 18);
    ctx.fillText(`DIST: ${distance}cm  PWM: ${isLedOn ? 'HIGH' : 'LOW'}`, 12, h - 8);

    this.texture.needsUpdate = true;
  }
}
