import * as THREE from 'three';
import {
  createESDMatTexture,
  createArduinoSilkscreenTexture,
  createBreadboardTexture,
  OscilloscopeScreen
} from './realisticTextures';

export interface RealisticLabObjects {
  scopeScreen: OscilloscopeScreen;
  ledMesh: THREE.Mesh;
  ledLight: THREE.PointLight;
  servoHorn: THREE.Group;
  roverGroup: THREE.Group;
  leftWheel: THREE.Group;
  rightWheel: THREE.Group;
  headlightSpot: THREE.SpotLight;
  sonarWave: THREE.Mesh;
  txLedMesh: THREE.Mesh;
  rxLedMesh: THREE.Mesh;
}

/**
 * Builds the hyper-realistic 3D lab environment and returns interactive mesh handles
 */
export function buildRealisticLab(scene: THREE.Scene): RealisticLabObjects {
  // 1. Hyper-Realistic Workbench Mat & Wood Table
  const tableBase = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.6, 20),
    new THREE.MeshStandardMaterial({
      color: 0x1c1917, // Dark walnut solid workbench edge
      roughness: 0.7,
      metalness: 0.1
    })
  );
  tableBase.position.y = -0.3;
  tableBase.receiveShadow = true;
  scene.add(tableBase);

  // ESD Anti-Static Silicone Mat with Printed Rulers & Calibrations
  const esdTexture = createESDMatTexture();
  const matGeo = new THREE.BoxGeometry(19, 0.08, 17);
  const matMaterial = new THREE.MeshStandardMaterial({
    map: esdTexture,
    roughness: 0.5,
    metalness: 0.15
  });
  const esdMat = new THREE.Mesh(matGeo, matMaterial);
  esdMat.position.y = 0.04;
  esdMat.receiveShadow = true;
  scene.add(esdMat);

  // 2. Realistic Digital Storage Oscilloscope (DSO) in the background
  const scopeGroup = new THREE.Group();
  scopeGroup.name = 'oscilloscope';
  scopeGroup.position.set(-5.5, 1.4, -4.5);
  scopeGroup.rotation.y = Math.PI / 6;

  // Scope Main Enclosure (Light laboratory grey)
  const scopeBody = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2.6, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
  );
  scopeBody.castShadow = true;
  scopeGroup.add(scopeBody);

  // Front Bezel Frame (Dark charcoal)
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 2.4, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
  );
  bezel.position.set(0, 0, 1.15);
  scopeGroup.add(bezel);

  // Active Waveform LCD Screen
  const scopeScreen = new OscilloscopeScreen();
  const screenMat = new THREE.MeshBasicMaterial({ map: scopeScreen.texture });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), screenMat);
  screenMesh.position.set(-0.6, 0.05, 1.26);
  scopeGroup.add(screenMesh);

  // Screen inner bezel
  const screenBorder = new THREE.Mesh(
    new THREE.BoxGeometry(2.48, 1.88, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
  );
  screenBorder.position.set(-0.6, 0.05, 1.24);
  scopeGroup.add(screenBorder);

  // Control Knobs & BNC Jacks
  const knobMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
  const bncMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });

  // Big rotary knobs (Volts/Div, Time/Div)
  for (let i = 0; i < 3; i++) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 16), knobMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(1.1, 0.5 - (i * 0.45), 1.28);
    scopeGroup.add(knob);
  }

  // Dual BNC Channel Connectors
  for (let c = 0; c < 2; c++) {
    const bnc = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16), bncMat);
    bnc.rotation.x = Math.PI / 2;
    bnc.position.set(0.9 + (c * 0.5), -0.7, 1.3);
    scopeGroup.add(bnc);
  }

  // Coaxial Probe Cable looping from scope towards circuit
  const probeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.9, -0.7, 1.35),
    new THREE.Vector3(0.2, -0.4, 2.5),
    new THREE.Vector3(-1.0, -0.8, 3.8),
    new THREE.Vector3(-2.1, -1.1, 4.4)
  ]);
  const probeCable = new THREE.Mesh(
    new THREE.TubeGeometry(probeCurve, 32, 0.025, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 })
  );
  probeCable.castShadow = true;
  scopeGroup.add(probeCable);

  scene.add(scopeGroup);

  // 3. Realistic Triple-Output DC Bench Power Supply
  const psuGroup = new THREE.Group();
  psuGroup.name = 'power-supply';
  psuGroup.position.set(-0.5, 1.2, -5.2);

  const psuBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 2.2, 2.4),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.2 })
  );
  psuBody.castShadow = true;
  psuGroup.add(psuBody);

  // Digital LED Readout Windows (Red 7-Segment for Voltage, Green for Current)
  const vDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.5, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xef4444 }) // Glowing Red
  );
  vDisplay.position.set(-0.7, 0.4, 1.22);
  psuGroup.add(vDisplay);

  const aDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.5, 0.05),
    new THREE.MeshBasicMaterial({ color: 0x22c55e }) // Glowing Green
  );
  aDisplay.position.set(0.7, 0.4, 1.22);
  psuGroup.add(aDisplay);

  // Red and Black 4mm Banana Binding Posts
  const bananaRed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.25, 16),
    new THREE.MeshStandardMaterial({ color: 0xdc2626 })
  );
  bananaRed.rotation.x = Math.PI / 2;
  bananaRed.position.set(-0.8, -0.45, 1.3);
  psuGroup.add(bananaRed);

  const bananaBlack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.25, 16),
    new THREE.MeshStandardMaterial({ color: 0x0f172a })
  );
  bananaBlack.rotation.x = Math.PI / 2;
  bananaBlack.position.set(0, -0.45, 1.3);
  psuGroup.add(bananaBlack);

  const bananaGreen = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.25, 16),
    new THREE.MeshStandardMaterial({ color: 0x16a34a })
  );
  bananaGreen.rotation.x = Math.PI / 2;
  bananaGreen.position.set(0.8, -0.45, 1.3);
  psuGroup.add(bananaGreen);

  scene.add(psuGroup);

  // 4. Digital Multimeter (DMM) on desk
  const dmmGroup = new THREE.Group();
  dmmGroup.name = 'multimeter';
  dmmGroup.position.set(-5.6, 0.18, 1.5);
  dmmGroup.rotation.y = Math.PI / 5;

  // Yellow Rugged Holster
  const dmmBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.28, 2.4),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 }) // Fluke yellow
  );
  dmmBody.castShadow = true;
  dmmGroup.add(dmmBody);

  // Grey LCD Panel
  const dmmLcd = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.05, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2 })
  );
  dmmLcd.position.set(0, 0.15, -0.6);
  dmmGroup.add(dmmLcd);

  // Central Rotary Selector
  const dmmDial = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.1, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
  );
  dmmDial.position.set(0, 0.18, 0.2);
  dmmGroup.add(dmmDial);

  scene.add(dmmGroup);

  // 5. Authentic Arduino Uno R3 with Procedural Silk-Screen Texture
  const arduinoGroup = new THREE.Group();
  arduinoGroup.name = 'arduino-uno';
  arduinoGroup.position.set(-2.2, 0.12, 0.4);

  // PCB Board with Silkscreen Texture
  const arduinoSilkscreen = createArduinoSilkscreenTexture();
  const pcbTopMat = new THREE.MeshStandardMaterial({
    map: arduinoSilkscreen,
    roughness: 0.3,
    metalness: 0.2
  });
  const pcbEdgeMat = new THREE.MeshStandardMaterial({ color: 0x006e76, roughness: 0.5 });
  const pcbMats = [pcbEdgeMat, pcbEdgeMat, pcbTopMat, pcbEdgeMat, pcbEdgeMat, pcbEdgeMat];

  const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.09, 1.9), pcbMats);
  pcb.castShadow = true;
  pcb.receiveShadow = true;
  arduinoGroup.add(pcb);

  // Silver USB-B Port
  const usb = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.45, 0.55),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.95 })
  );
  usb.position.set(-1.05, 0.26, -0.45);
  usb.castShadow = true;
  arduinoGroup.add(usb);

  // DC Barrel Jack (Black)
  const barrelJack = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.42, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
  );
  barrelJack.position.set(-1.05, 0.24, 0.55);
  barrelJack.castShadow = true;
  arduinoGroup.add(barrelJack);

  // ATmega328P DIP IC with individual silver legs
  const dipBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.16, 0.38),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  dipBody.position.set(0.3, 0.12, 0.2);
  dipBody.castShadow = true;
  arduinoGroup.add(dipBody);

  // 16.000 MHz Silver Crystal Oscillator Can
  const crystal = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.12, 0.18),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 })
  );
  crystal.position.set(-0.4, 0.1, -0.15);
  arduinoGroup.add(crystal);

  // Red Tactile Reset Switch
  const resetBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
  );
  resetBtn.position.set(-1.0, 0.12, -0.85);
  arduinoGroup.add(resetBtn);

  // Female Header Pin Socket Rails
  const headerMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 });
  const topHeader = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 0.14), headerMat);
  topHeader.position.set(0.25, 0.18, -0.82);
  topHeader.castShadow = true;
  arduinoGroup.add(topHeader);

  const bottomHeader = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 0.14), headerMat);
  bottomHeader.position.set(0.25, 0.18, 0.82);
  bottomHeader.castShadow = true;
  arduinoGroup.add(bottomHeader);

  // SMD LEDs: TX, RX, and L (Pin 13)
  const smdLedGeo = new THREE.BoxGeometry(0.06, 0.04, 0.06);
  const txMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const txLed = new THREE.Mesh(smdLedGeo, txMat);
  txLed.position.set(-0.25, 0.08, -0.45);
  arduinoGroup.add(txLed);

  const rxMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const rxLed = new THREE.Mesh(smdLedGeo, rxMat);
  rxLed.position.set(-0.25, 0.08, -0.32);
  arduinoGroup.add(rxLed);

  scene.add(arduinoGroup);

  // 6. Realistic Solderless Breadboard with Red & Blue Rails
  const breadboardGroup = new THREE.Group();
  breadboardGroup.name = 'breadboard';
  breadboardGroup.position.set(-2.2, 0.12, 3.2);

  const bbTex = createBreadboardTexture();
  const bbTopMat = new THREE.MeshStandardMaterial({ map: bbTex, roughness: 0.6 });
  const bbSideMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
  const bbMats = [bbSideMat, bbSideMat, bbTopMat, bbSideMat, bbSideMat, bbSideMat];

  const bbMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 1.8), bbMats);
  bbMesh.castShadow = true;
  bbMesh.receiveShadow = true;
  breadboardGroup.add(bbMesh);

  // 5mm Diffused Red LED with translucent dome
  const ledGroup = new THREE.Group();
  ledGroup.name = 'led';
  ledGroup.position.set(-0.6, 0.22, 0);

  const ledDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.1,
      transparent: true,
      opacity: 0.95
    })
  );
  ledDome.position.y = 0.2;
  ledGroup.add(ledDome);

  const ledCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.22, 16),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.2,
      transparent: true,
      opacity: 0.95
    })
  );
  ledCyl.position.y = 0.1;
  ledGroup.add(ledCyl);

  // PointLight casting red glow when LED is illuminated
  const ledLight = new THREE.PointLight(0xff2222, 0, 4, 1.8);
  ledLight.position.set(0, 0.35, 0);
  ledGroup.add(ledLight);
  breadboardGroup.add(ledGroup);

  // Resistor with color code bands (Red, Red, Brown, Gold = 220 Ohm)
  const resGroup = new THREE.Group();
  resGroup.name = 'resistor';
  resGroup.position.set(0.4, 0.24, 0);

  const resBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.35, 12),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
  );
  resBody.rotation.z = Math.PI / 2;
  resGroup.add(resBody);

  // Color bands
  for (const bx of [-0.1, -0.04, 0.02]) {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.047, 0.047, 0.03, 12),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    );
    band.rotation.z = Math.PI / 2;
    band.position.x = bx;
    resGroup.add(band);
  }
  breadboardGroup.add(resGroup);

  scene.add(breadboardGroup);

  // 7. Flexible Curved 3D Jumper Wires
  const createCurvedJumper = (start: THREE.Vector3, end: THREE.Vector3, colorHex: number, sag: number = 0.7) => {
    const mid = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(0, sag, 0));
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.022, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
    const wire = new THREE.Mesh(tubeGeo, tubeMat);
    wire.castShadow = true;

    // Terminal black plastic boots at both ends
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const boot1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), bootMat);
    boot1.position.copy(start);
    const boot2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), bootMat);
    boot2.position.copy(end);

    const wireGroup = new THREE.Group();
    wireGroup.add(wire);
    wireGroup.add(boot1);
    wireGroup.add(boot2);
    return wireGroup;
  };

  // Wire 1: Pin 13 to LED Anode (Red)
  scene.add(createCurvedJumper(
    new THREE.Vector3(-1.95, 0.35, -0.42), // Arduino D13
    new THREE.Vector3(-2.8, 0.35, 3.2),   // Breadboard LED Anode
    0xef4444,
    0.85
  ));

  // Wire 2: Arduino GND to Breadboard Ground Rail (Black)
  scene.add(createCurvedJumper(
    new THREE.Vector3(-1.95, 0.35, 1.22),  // Arduino GND
    new THREE.Vector3(-1.8, 0.35, 3.2),   // Breadboard Rail
    0x1e293b,
    0.7
  ));

  // Wire 3: 5V Rail to Breadboard (Orange)
  scene.add(createCurvedJumper(
    new THREE.Vector3(-1.95, 0.35, 0.95),  // Arduino 5V
    new THREE.Vector3(-2.2, 0.35, 2.4),   // Breadboard 5V
    0xf97316,
    0.6
  ));

  // 8. Hyper-Realistic Autonomous Robot Chassis
  const roverGroup = new THREE.Group();
  roverGroup.name = 'robot-chassis';
  roverGroup.position.set(2.4, 0.22, 0);

  // Lower Smoked Acrylic Plate
  const acrylicMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.15,
    metalness: 0.3,
    transparent: true,
    opacity: 0.88
  });
  const lowerDeck = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 3.2), acrylicMat);
  lowerDeck.castShadow = true;
  roverGroup.add(lowerDeck);

  // Upper Deck Plate with brass standoffs
  const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.07, 2.6), acrylicMat);
  upperDeck.position.y = 0.8;
  upperDeck.castShadow = true;
  roverGroup.add(upperDeck);

  // 4 Hexagonal Brass Standoff Pillars with silver screws
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
  for (const sx of [-0.95, 0.95]) {
    for (const sz of [-1.1, 1.1]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.8, 6), brassMat);
      pillar.position.set(sx, 0.4, sz);
      roverGroup.add(pillar);
    }
  }

  // Yellow TT DC Gear Motors with silver motor cans
  const motorGearMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
  const motorCanMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.2 });

  const buildTTMotor = () => {
    const mg = new THREE.Group();
    const gearbox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.7), motorGearMat);
    mg.add(gearbox);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.45, 16), motorCanMat);
    can.rotation.x = Math.PI / 2;
    can.position.set(0, 0, 0.45);
    mg.add(can);
    return mg;
  };

  const leftMotor = buildTTMotor();
  leftMotor.position.set(-0.9, 0.05, 0.4);
  roverGroup.add(leftMotor);

  const rightMotor = buildTTMotor();
  rightMotor.position.set(0.9, 0.05, 0.4);
  roverGroup.add(rightMotor);

  // Treaded Rubber Wheels with 5-Spoke Alloy Hubs
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
  const alloyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });

  const buildWheel = () => {
    const wg = new THREE.Group();
    // Tire body
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.28, 32), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wg.add(tire);

    // Tread grooved ribs
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const tread = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.06), tireMat);
      tread.position.set(0, Math.cos(angle) * 0.48, Math.sin(angle) * 0.48);
      tread.rotation.x = -angle;
      wg.add(tread);
    }

    // Silver 5-spoke hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.29, 20), alloyMat);
    hub.rotation.z = Math.PI / 2;
    wg.add(hub);

    // Center hex lock nut
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.32, 6), brassMat);
    nut.rotation.z = Math.PI / 2;
    wg.add(nut);
    return wg;
  };

  const leftWheel = buildWheel();
  leftWheel.position.set(-1.35, 0.2, 0.4);
  roverGroup.add(leftWheel);

  const rightWheel = buildWheel();
  rightWheel.position.set(1.35, 0.2, 0.4);
  roverGroup.add(rightWheel);

  // Front Heavy Steel Ball Caster
  const caster = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95, roughness: 0.1 })
  );
  caster.position.set(0, -0.04, -1.25);
  caster.castShadow = true;
  roverGroup.add(caster);

  // Front High-Intensity LED Headlights (White Beams)
  const headlightGroup = new THREE.Group();
  for (const hx of [-0.65, 0.65]) {
    const bulb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    bulb.rotation.x = Math.PI / 2;
    bulb.position.set(hx, 0.15, -1.6);
    headlightGroup.add(bulb);
  }
  roverGroup.add(headlightGroup);

  // Forward SpotLight simulating rover headlights
  const headlightSpot = new THREE.SpotLight(0xffffff, 2.5, 12, Math.PI / 5, 0.4, 1.2);
  headlightSpot.position.set(0, 0.3, -1.6);
  headlightSpot.target.position.set(0, 0, -8);
  roverGroup.add(headlightSpot);
  roverGroup.add(headlightSpot.target);

  // SG90 Micro Servo Turret on upper deck
  const servoGroup = new THREE.Group();
  servoGroup.name = 'servo';
  servoGroup.position.set(0, 0.95, -0.9);

  const servoCase = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.35, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x2563eb, transparent: true, opacity: 0.9, roughness: 0.2 })
  );
  servoGroup.add(servoCase);

  // Rotating Horn
  const servoHorn = new THREE.Group();
  servoHorn.position.set(0, 0.25, 0);

  const hornArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.05, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
  );
  servoHorn.add(hornArm);

  // HC-SR04 Ultrasonic Sonar Module mounted on servo
  const sonarGroup = new THREE.Group();
  sonarGroup.name = 'ultrasonic';
  sonarGroup.position.set(0, 0.15, 0);

  const sonarPcb = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.45, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
  );
  sonarGroup.add(sonarPcb);

  // Dual Silver Transducer Cylinders (Transmitter & Receiver)
  const transducerMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.2 });
  const meshFrontMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.6 });

  for (const bx of [-0.3, 0.3]) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.25, 20), transducerMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(bx, 0, -0.15);
    sonarGroup.add(barrel);

    // Front acoustic grille mesh
    const meshDisk = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), meshFrontMat);
    meshDisk.position.set(bx, 0, -0.28);
    meshDisk.rotation.y = Math.PI;
    sonarGroup.add(meshDisk);
  }

  // Visual Echolocation Radar Soundwave Cone
  const sonarWave = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 3.2, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
      side: THREE.DoubleSide
    })
  );
  sonarWave.rotation.x = -Math.PI / 2;
  sonarWave.position.set(0, 0, -1.8);
  sonarGroup.add(sonarWave);

  servoHorn.add(sonarGroup);
  servoGroup.add(servoHorn);
  roverGroup.add(servoGroup);

  scene.add(roverGroup);

  return {
    scopeScreen,
    ledMesh: ledDome,
    ledLight,
    servoHorn,
    roverGroup,
    leftWheel,
    rightWheel,
    headlightSpot,
    sonarWave,
    txLedMesh: txLed,
    rxLedMesh: rxLed
  };
}
