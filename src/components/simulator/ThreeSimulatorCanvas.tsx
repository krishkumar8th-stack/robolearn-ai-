import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  RotateCcw,
  Play,
  Square,
  Eye,
  Maximize2,
  Sliders,
  Terminal,
  Cpu,
  Radio,
  Sparkles,
  Layers,
  ZoomIn
} from 'lucide-react';

interface ThreeSimulatorCanvasProps {
  onSelectComponent?: (id: string) => void;
  heightClass?: string;
  showToolbar?: boolean;
}

export const ThreeSimulatorCanvas: React.FC<ThreeSimulatorCanvasProps> = ({
  onSelectComponent,
  heightClass = 'h-[540px]',
  showToolbar = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    state,
    selected3DComponent,
    setSelected3DComponent,
    cameraViewMode,
    setCameraViewMode,
    runActions,
    stopSimulation,
    resetSimulation,
    setObstacleDistance,
    setSpeedMultiplier
  } = useSimulation();

  const [showInspector, setShowInspector] = useState(false);
  const [selectedPinInfo, setSelectedPinInfo] = useState<{ pin: string; desc: string; voltage: string } | null>(null);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // References for mutable 3D objects updated per frame
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Interactive 3D component meshes
  const ledMeshRef = useRef<THREE.Mesh | null>(null);
  const ledLightRef = useRef<THREE.PointLight | null>(null);
  const servoHornRef = useRef<THREE.Group | null>(null);
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const leftWheelRef = useRef<THREE.Mesh | null>(null);
  const rightWheelRef = useRef<THREE.Mesh | null>(null);
  const obstacleMeshRef = useRef<THREE.Mesh | null>(null);
  const sonarWaveRef = useRef<THREE.Mesh | null>(null);
  const wifiWaveRef = useRef<THREE.Group | null>(null);

  // Raycaster for mouse interaction
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Orbit controls state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraSpherical = useRef({ radius: 10, theta: Math.PI / 4, phi: Math.PI / 3.5 });
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.04);

    // 2. Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    containerRef.current.replaceChildren(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xdde6ed, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(6, 12, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-8, 5, -6);
    scene.add(rimLight);

    // 5. Workbench Ground & Grid
    const benchGeo = new THREE.BoxGeometry(18, 0.4, 18);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.y = -0.2;
    bench.receiveShadow = true;
    scene.add(bench);

    const grid = new THREE.GridHelper(16, 32, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // 6. Build 3D Arduino Uno Model
    const arduinoGroup = new THREE.Group();
    arduinoGroup.name = 'arduino-uno';
    arduinoGroup.position.set(-2.2, 0.05, 0.5);

    // PCB
    const pcbGeo = new THREE.BoxGeometry(2.4, 0.08, 1.8);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x00878f, roughness: 0.3, metalness: 0.1 });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    arduinoGroup.add(pcb);

    // USB Port (metal)
    const usbGeo = new THREE.BoxGeometry(0.5, 0.35, 0.45);
    const usbMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.2, metalness: 0.9 });
    const usb = new THREE.Mesh(usbGeo, usbMat);
    usb.position.set(-1.0, 0.2, -0.5);
    usb.castShadow = true;
    arduinoGroup.add(usb);

    // Barrel Jack (black)
    const jackGeo = new THREE.BoxGeometry(0.5, 0.35, 0.35);
    const jackMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });
    const jack = new THREE.Mesh(jackGeo, jackMat);
    jack.position.set(-1.0, 0.2, 0.5);
    jack.castShadow = true;
    arduinoGroup.add(jack);

    // ATmega328P DIP IC
    const icGeo = new THREE.BoxGeometry(1.0, 0.12, 0.3);
    const icMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const ic = new THREE.Mesh(icGeo, icMat);
    ic.position.set(0.2, 0.1, 0.2);
    arduinoGroup.add(ic);

    // Digital Pin Header (Top)
    const pinHeaderGeo = new THREE.BoxGeometry(1.6, 0.22, 0.12);
    const headerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const topHeader = new THREE.Mesh(pinHeaderGeo, headerMat);
    topHeader.position.set(0.2, 0.15, -0.75);
    arduinoGroup.add(topHeader);

    // Power/Analog Header (Bottom)
    const bottomHeader = new THREE.Mesh(pinHeaderGeo, headerMat);
    bottomHeader.position.set(0.2, 0.15, 0.75);
    arduinoGroup.add(bottomHeader);

    // Pin 13 Built-in LED on PCB
    const p13LedGeo = new THREE.BoxGeometry(0.08, 0.06, 0.08);
    const p13LedMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0x000000,
      emissiveIntensity: 0
    });
    const p13Led = new THREE.Mesh(p13LedGeo, p13LedMat);
    p13Led.position.set(-0.2, 0.08, -0.6);
    arduinoGroup.add(p13Led);

    scene.add(arduinoGroup);

    // 7. Breadboard with LED & Resistor
    const breadboardGroup = new THREE.Group();
    breadboardGroup.name = 'breadboard';
    breadboardGroup.position.set(-2.2, 0.05, 2.5);

    const bbBaseGeo = new THREE.BoxGeometry(2.6, 0.18, 1.4);
    const bbBaseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const bbBase = new THREE.Mesh(bbBaseGeo, bbBaseMat);
    bbBase.castShadow = true;
    bbBase.receiveShadow = true;
    breadboardGroup.add(bbBase);

    // Diffused 5mm LED
    const ledDomeGeo = new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const ledCylGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.2,
      transparent: true,
      opacity: 0.95
    });
    const ledDome = new THREE.Mesh(ledDomeGeo, ledMat);
    ledDome.position.set(0, 0.25, 0);
    const ledCyl = new THREE.Mesh(ledCylGeo, ledMat);
    ledCyl.position.set(0, 0.16, 0);

    const fullLedGroup = new THREE.Group();
    fullLedGroup.name = 'led';
    fullLedGroup.add(ledDome);
    fullLedGroup.add(ledCyl);
    fullLedGroup.position.set(-0.5, 0.1, 0);
    breadboardGroup.add(fullLedGroup);
    ledMeshRef.current = ledDome;

    // Glowing PointLight on LED
    const ledLight = new THREE.PointLight(0xff2222, 0, 3, 2);
    ledLight.position.set(-0.5, 0.4, 0);
    breadboardGroup.add(ledLight);
    ledLightRef.current = ledLight;

    // Resistor
    const resistorGroup = new THREE.Group();
    resistorGroup.name = 'resistor';
    const resBodyGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8);
    resBodyGeo.rotateZ(Math.PI / 2);
    const resBodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const resBody = new THREE.Mesh(resBodyGeo, resBodyMat);
    resistorGroup.add(resBody);
    resistorGroup.position.set(0.3, 0.18, 0);
    breadboardGroup.add(resistorGroup);

    scene.add(breadboardGroup);

    // 8. Curved Jumper Wires (Arduino to Breadboard)
    const createWire = (start: THREE.Vector3, end: THREE.Vector3, colorHex: number) => {
      const mid = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 0.7, 0));
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
      const wire = new THREE.Mesh(tubeGeo, tubeMat);
      wire.castShadow = true;
      return wire;
    };

    const wire1 = createWire(
      new THREE.Vector3(-2.0, 0.2, -0.25), // Arduino Pin 13
      new THREE.Vector3(-2.7, 0.2, 2.5),  // Breadboard LED Anode
      0xef4444 // Red wire
    );
    const wire2 = createWire(
      new THREE.Vector3(-2.0, 0.2, 1.25),  // Arduino GND
      new THREE.Vector3(-1.9, 0.2, 2.5),  // Breadboard Resistor Lead
      0x1e293b // Black wire
    );
    scene.add(wire1);
    scene.add(wire2);

    // 9. ESP32 NodeMCU 3D Model
    const esp32Group = new THREE.Group();
    esp32Group.name = 'esp32';
    esp32Group.position.set(-2.2, 0.05, -2.0);

    const espPcbGeo = new THREE.BoxGeometry(1.6, 0.06, 2.4);
    const espPcbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const espPcb = new THREE.Mesh(espPcbGeo, espPcbMat);
    esp32Group.add(espPcb);

    // Metal shield
    const shieldGeo = new THREE.BoxGeometry(1.1, 0.12, 1.2);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 0.08, -0.3);
    esp32Group.add(shield);

    // Wi-Fi wave pulses
    const wifiGroup = new THREE.Group();
    for (let r = 0.5; r <= 1.2; r += 0.35) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.04, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 0.15, -1.0);
      wifiGroup.add(ring);
    }
    esp32Group.add(wifiGroup);
    wifiWaveRef.current = wifiGroup;

    scene.add(esp32Group);

    // 10. Autonomous Mobile Robot Chassis (2WD / 4WD Rover with Sonar Eyes)
    const rover = new THREE.Group();
    rover.name = 'robot-chassis';
    rover.position.set(state.robot.x + 1.8, 0.15, state.robot.z);
    robotGroupRef.current = rover;

    // Acrylic Chassis plate
    const chassisGeo = new THREE.BoxGeometry(2.0, 0.08, 2.6);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    });
    const chassisPlate = new THREE.Mesh(chassisGeo, chassisMat);
    chassisPlate.castShadow = true;
    rover.add(chassisPlate);

    // Upper deck plate
    const upperPlate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 2.0), chassisMat);
    upperPlate.position.set(0, 0.6, 0);
    upperPlate.castShadow = true;
    rover.add(upperPlate);

    // 4 Standoff pillars
    for (const sx of [-0.8, 0.8]) {
      for (const sz of [-0.8, 0.8]) {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8),
          new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 })
        );
        pillar.position.set(sx, 0.3, sz);
        rover.add(pillar);
      }
    }

    // DC Gear Motors (Yellow)
    const motorGeo = new THREE.BoxGeometry(0.3, 0.25, 0.6);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
    const leftMotor = new THREE.Mesh(motorGeo, motorMat);
    leftMotor.position.set(-0.8, 0.05, 0.3);
    rover.add(leftMotor);

    const rightMotor = new THREE.Mesh(motorGeo, motorMat);
    rightMotor.position.set(0.8, 0.05, 0.3);
    rover.add(rightMotor);

    // Rubber Wheels with Silver Rim
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 24);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });

    const createWheel = () => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.castShadow = true;
      wGroup.add(tire);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.23, 16), rimMat);
      hub.rotation.z = Math.PI / 2;
      wGroup.add(hub);
      return wGroup;
    };

    const lWheel = createWheel();
    lWheel.position.set(-1.15, 0.18, 0.3);
    rover.add(lWheel);
    leftWheelRef.current = lWheel as any;

    const rWheel = createWheel();
    rWheel.position.set(1.15, 0.18, 0.3);
    rover.add(rWheel);
    rightWheelRef.current = rWheel as any;

    // Front Caster Wheel
    const caster = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 })
    );
    caster.position.set(0, -0.05, -1.0);
    caster.castShadow = true;
    rover.add(caster);

    // Front Micro Servo on front deck
    const servoGroup = new THREE.Group();
    servoGroup.name = 'servo';
    servoGroup.position.set(0, 0.72, -0.8);

    const servoBodyGeo = new THREE.BoxGeometry(0.35, 0.3, 0.3);
    const servoBodyMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, transparent: true, opacity: 0.9 });
    const servoBody = new THREE.Mesh(servoBodyGeo, servoBodyMat);
    servoGroup.add(servoBody);

    // Servo rotating horn holding the HC-SR04 ultrasonic sensor
    const hornGroup = new THREE.Group();
    hornGroup.position.set(0, 0.2, 0);
    servoHornRef.current = hornGroup;

    // HC-SR04 Ultrasonic Sensor attached to servo
    const sonarGroup = new THREE.Group();
    sonarGroup.name = 'ultrasonic';
    sonarGroup.position.set(0, 0.1, 0);

    const sonarPcbGeo = new THREE.BoxGeometry(0.8, 0.35, 0.05);
    const sonarPcbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const sonarPcb = new THREE.Mesh(sonarPcbGeo, sonarPcbMat);
    sonarGroup.add(sonarPcb);

    // Left and Right ultrasonic metal barrels (Transmitter & Receiver)
    const barrelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16);
    barrelGeo.rotateX(Math.PI / 2);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 });

    const leftBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    leftBarrel.position.set(-0.25, 0, -0.1);
    sonarGroup.add(leftBarrel);

    const rightBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    rightBarrel.position.set(0.25, 0, -0.1);
    sonarGroup.add(rightBarrel);

    // Dynamic Sonar radar pulse cone
    const sonarConeGeo = new THREE.ConeGeometry(0.9, 1.8, 16, 1, true);
    sonarConeGeo.rotateX(-Math.PI / 2);
    const sonarConeMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
      side: THREE.DoubleSide
    });
    const sonarCone = new THREE.Mesh(sonarConeGeo, sonarConeMat);
    sonarCone.position.set(0, 0, -1.0);
    sonarGroup.add(sonarCone);
    sonarWaveRef.current = sonarCone;

    hornGroup.add(sonarGroup);
    servoGroup.add(hornGroup);
    rover.add(servoGroup);

    scene.add(rover);

    // 11. Interactive Obstacle Block in 3D scene
    const obstacleGroup = new THREE.Group();
    obstacleGroup.name = 'obstacle';
    obstacleGroup.position.set(1.8 + state.obstacle.x, 0.45, state.obstacle.z);

    const obsGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const obsMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.6,
      metalness: 0.1
    });
    const obsMesh = new THREE.Mesh(obsGeo, obsMat);
    obsMesh.castShadow = true;
    obsMesh.receiveShadow = true;
    obstacleGroup.add(obsMesh);

    // Obstacle caution label
    const border = new THREE.Mesh(
      new THREE.BoxGeometry(0.94, 0.1, 0.94),
      new THREE.MeshStandardMaterial({ color: 0x111827 })
    );
    obstacleGroup.add(border);

    scene.add(obstacleGroup);
    obstacleMeshRef.current = obstacleGroup as any;

    // 12. Click & Mouse Interaction Handlers
    const onPointerDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;

        cameraSpherical.current.theta -= deltaX * 0.008;
        cameraSpherical.current.phi = Math.max(
          0.1,
          Math.min(Math.PI / 2 - 0.05, cameraSpherical.current.phi - deltaY * 0.008)
        );

        updateCameraPosition();
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSpherical.current.radius = Math.max(
        3.5,
        Math.min(22, cameraSpherical.current.radius + e.deltaY * 0.01)
      );
      updateCameraPosition();
    };

    const onClick = () => {
      if (!cameraRef.current || !sceneRef.current) return;
      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && !['arduino-uno', 'esp32', 'led', 'resistor', 'servo', 'ultrasonic', 'robot-chassis', 'breadboard', 'obstacle'].includes(topObj.name)) {
          topObj = topObj.parent;
        }

        if (topObj && topObj.name) {
          setSelected3DComponent(topObj.name);
          setShowInspector(true);
          if (onSelectComponent) onSelectComponent(topObj.name);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // 13. Animation Loop
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate Wi-Fi wave pulse
      if (wifiWaveRef.current) {
        wifiWaveRef.current.children.forEach((child, idx) => {
          const mesh = child as THREE.Mesh;
          const scale = 1 + (Math.sin(elapsedTime * 3 + idx) * 0.15);
          mesh.scale.set(scale, scale, 1);
        });
      }

      // Animate Sonar pulse
      if (sonarWaveRef.current) {
        const pingScale = 1 + (Math.sin(elapsedTime * 6) * 0.2);
        sonarWaveRef.current.scale.set(pingScale, pingScale, 1);
      }

      renderer.render(scene, camera);
    };
    animate();

    // 14. Responsive Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries[0] || !cameraRef.current || !rendererRef.current) return;
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, []);

  // Update Camera position based on spherical coordinates
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSpherical.current;
    cameraRef.current.position.x = targetLookAt.current.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = targetLookAt.current.y + radius * Math.cos(phi);
    cameraRef.current.position.z = targetLookAt.current.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(targetLookAt.current);
  };

  // Switch camera views
  useEffect(() => {
    if (!cameraRef.current) return;
    switch (cameraViewMode) {
      case 'top':
        cameraSpherical.current = { radius: 11, theta: 0, phi: 0.05 };
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'rover':
        cameraSpherical.current = { radius: 5.5, theta: Math.PI / 6, phi: Math.PI / 3.2 };
        targetLookAt.current.set(1.8 + state.robot.x, 0.4, state.robot.z);
        break;
      case 'circuit':
        cameraSpherical.current = { radius: 4.8, theta: -Math.PI / 4, phi: Math.PI / 3.6 };
        targetLookAt.current.set(-2.2, 0.1, 1.2);
        break;
      case 'default':
      default:
        cameraSpherical.current = { radius: 10, theta: Math.PI / 4, phi: Math.PI / 3.5 };
        targetLookAt.current.set(0, 0, 0);
        break;
    }
    updateCameraPosition();
  }, [cameraViewMode]);

  // Synchronize Simulation State into 3D objects
  useEffect(() => {
    // 1. LED State
    const isLedOn = Boolean(state.leds['13']?.on || state.leds['led_01']?.on);
    if (ledMeshRef.current) {
      const mat = ledMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(isLedOn ? 0xff2222 : 0x000000);
      mat.emissiveIntensity = isLedOn ? 1.5 : 0;
    }
    if (ledLightRef.current) {
      ledLightRef.current.intensity = isLedOn ? 2.5 : 0;
    }

    // 2. Servo Angle
    const angleDeg = state.servos['servo_01']?.angle ?? 90;
    if (servoHornRef.current) {
      // Map 0 - 180 to -90 to +90 degrees in radians
      const rad = THREE.MathUtils.degToRad(angleDeg - 90);
      servoHornRef.current.rotation.y = rad;
    }

    // 3. Robot Position and Orientation
    if (robotGroupRef.current) {
      robotGroupRef.current.position.x = 1.8 + state.robot.x;
      robotGroupRef.current.position.z = state.robot.z;
      robotGroupRef.current.rotation.y = state.robot.rotationY;

      // Wheel spin animation if moving
      if (state.robot.status === 'MOVING') {
        const wheelAngle = (state.robot.z * 4) % (Math.PI * 2);
        if (leftWheelRef.current) leftWheelRef.current.rotation.x = wheelAngle;
        if (rightWheelRef.current) rightWheelRef.current.rotation.x = wheelAngle;
      }
    }

    // 4. Obstacle Position
    if (obstacleMeshRef.current) {
      obstacleMeshRef.current.position.set(1.8 + state.obstacle.x, 0.45, state.obstacle.z);
    }
  }, [state]);

  const getComponentInfo = (id: string | null) => {
    switch (id) {
      case 'arduino-uno':
        return {
          title: 'Arduino Uno R3',
          subtitle: 'ATmega328P 16MHz Microcontroller',
          pins: [
            { pin: 'D13', desc: 'Digital I/O + Built-in Amber LED', voltage: '5V' },
            { pin: 'D9', desc: 'PWM Output (Connected to Servo)', voltage: '5V' },
            { pin: '5V', desc: 'Regulated Main Power Rail', voltage: '5.0V' },
            { pin: 'GND', desc: 'Ground Reference', voltage: '0V' }
          ]
        };
      case 'esp32':
        return {
          title: 'ESP32 NodeMCU',
          subtitle: 'Dual-Core 240MHz Wi-Fi & BLE SoC',
          pins: [
            { pin: 'GPIO 2', desc: 'Onboard Blue Status LED', voltage: '3.3V' },
            { pin: '3V3', desc: '3.3V Regulated Output', voltage: '3.3V' },
            { pin: 'GND', desc: 'System Ground', voltage: '0V' }
          ]
        };
      case 'ultrasonic':
        return {
          title: 'HC-SR04 Ultrasonic Sonar',
          subtitle: '2cm - 400cm Non-Contact Distance Sensor',
          pins: [
            { pin: 'VCC', desc: 'Power Supply', voltage: '5V' },
            { pin: 'TRIG', desc: 'Trigger 10µs sound pulse', voltage: '5V' },
            { pin: 'ECHO', desc: 'Pulse length = distance time', voltage: '5V' },
            { pin: 'GND', desc: 'Ground', voltage: '0V' }
          ]
        };
      case 'servo':
        return {
          title: 'SG90 Micro Servo',
          subtitle: '0° - 180° Angular Actuator',
          pins: [
            { pin: 'Orange', desc: 'PWM Control Signal (1-2ms)', voltage: '5V' },
            { pin: 'Red', desc: 'VCC Power (+4.8V to 6V)', voltage: '5V' },
            { pin: 'Brown', desc: 'GND', voltage: '0V' }
          ]
        };
      case 'robot-chassis':
        return {
          title: 'Autonomous Mobile Rover',
          subtitle: '2WD Differential Drive Chassis with Sonar Eyes',
          pins: [
            { pin: 'IN1, IN2', desc: 'Left DC Motor Direction Driver', voltage: '5V' },
            { pin: 'IN3, IN4', desc: 'Right DC Motor Direction Driver', voltage: '5V' },
            { pin: 'VMS', desc: 'Battery Pack Motor Power', voltage: '7.4V' }
          ]
        };
      case 'led':
        return {
          title: '5mm Diffused Red LED',
          subtitle: 'Indicator Diode (Forward Voltage: 2.0V)',
          pins: [
            { pin: 'Anode (+)', desc: 'Long lead through 220Ω resistor', voltage: '2.0V' },
            { pin: 'Cathode (-)', desc: 'Short lead to Ground', voltage: '0V' }
          ]
        };
      default:
        return {
          title: 'Virtual Workbench',
          subtitle: 'Click any component to inspect pinouts',
          pins: []
        };
    }
  };

  const compInfo = getComponentInfo(selected3DComponent);

  return (
    <div className={`relative w-full ${heightClass} bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl`}>
      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing select-none" />

      {/* Top Floating Controls */}
      {showToolbar && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl shadow-lg">
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-cyan-400 bg-cyan-950/50 rounded-lg border border-cyan-800/40">
              <span className={`w-2 h-2 rounded-full ${state.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {state.isRunning ? 'RUNNING' : 'STANDBY'}
            </span>

            <button
              onClick={() => runActions([
                { type: 'ROBOT_MOVE', direction: 'FORWARD', duration: 1500 },
                { type: 'OBSTACLE_DETECT', distance: 18 },
                { type: 'ROBOT_STOP' },
                { type: 'ROBOT_TURN', direction: 'LEFT', angle: 90 },
                { type: 'ROBOT_MOVE', direction: 'FORWARD', duration: 1200 }
              ])}
              disabled={state.isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm"
              title="Run Demonstration Obstacle Avoidance Loop"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Demo Run
            </button>

            <button
              onClick={stopSimulation}
              disabled={!state.isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Stop
            </button>

            <button
              onClick={resetSimulation}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
              title="Reset Scene"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Camera View Switcher */}
          <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl shadow-lg text-xs">
            <button
              onClick={() => setCameraViewMode('default')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${cameraViewMode === 'default' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Lab
            </button>
            <button
              onClick={() => setCameraViewMode('rover')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${cameraViewMode === 'rover' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Rover Cam
            </button>
            <button
              onClick={() => setCameraViewMode('circuit')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${cameraViewMode === 'circuit' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Arduino
            </button>
            <button
              onClick={() => setCameraViewMode('top')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${cameraViewMode === 'top' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Top-Down
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Obstacle Distance Slider */}
      <div className="absolute bottom-4 left-4 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl z-20 w-64 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" /> Sonar Target Distance
          </span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {state.obstacle.distanceToRobot} cm
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="80"
          value={state.obstacle.distanceToRobot}
          onChange={(e) => setObstacleDistance(parseInt(e.target.value, 10))}
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>5 cm (Collision)</span>
          <span>Threshold: 20cm</span>
          <span>80 cm (Clear)</span>
        </div>
      </div>

      {/* Floating Serial Monitor / Status Bar */}
      <div className="absolute bottom-4 right-4 pointer-events-auto flex items-center gap-2 z-20">
        <button
          onClick={() => setShowLogsDrawer(!showLogsDrawer)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-lg transition ${
            showLogsDrawer ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900/80 text-slate-200 border-slate-700/60 hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Serial Monitor ({state.serialLogs.length})
        </button>

        <button
          onClick={() => setShowInspector(!showInspector)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-lg transition ${
            showInspector ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900/80 text-slate-200 border-slate-700/60 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Pin Inspector
        </button>
      </div>

      {/* Serial Monitor Drawer */}
      {showLogsDrawer && (
        <div className="absolute top-16 right-4 w-96 max-h-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl p-3 z-30 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" /> Serial Telemetry Monitor (9600 Baud)
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">● ACTIVE</span>
          </div>
          <div className="overflow-y-auto space-y-1 text-slate-300 pr-1 flex-1 max-h-52 select-text">
            {state.serialLogs.map((log, i) => (
              <div
                key={i}
                className={`py-0.5 leading-relaxed text-[11px] ${
                  log.type === 'error' ? 'text-rose-400' : log.text.includes('[SONAR]') ? 'text-cyan-300' : 'text-slate-300'
                }`}
              >
                <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString().slice(3)}]</span> {log.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pinout & Hardware Inspector Popup */}
      {showInspector && selected3DComponent && (
        <div className="absolute top-16 left-4 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl p-4 z-30">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-3">
            <div>
              <h4 className="font-bold text-slate-100 text-sm">{compInfo.title}</h4>
              <p className="text-xs text-cyan-400">{compInfo.subtitle}</p>
            </div>
            <button
              onClick={() => setShowInspector(false)}
              className="text-slate-400 hover:text-white text-sm p-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hardware Pinouts & States</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {compInfo.pins.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPinInfo(p)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200">{p.pin}</span>
                    <p className="text-[11px] text-slate-400">{p.desc}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800/40 rounded text-[10px] font-mono font-bold">
                    {p.voltage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {selectedPinInfo && (
            <div className="mt-3 p-2 bg-cyan-950/40 border border-cyan-800/40 rounded-lg text-xs">
              <span className="font-bold text-cyan-300">Selected Pin: {selectedPinInfo.pin}</span>
              <p className="text-slate-300 text-[11px] mt-0.5">{selectedPinInfo.desc}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
