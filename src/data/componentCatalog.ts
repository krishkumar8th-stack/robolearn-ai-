import type { ElectronicComponent } from '../types/index.js';
import { createComponentLearningGuide } from './componentLearning.js';

export type ComponentSourceStatus = 'catalog' | 'verified';

export interface CatalogEntry {
  id: string;
  name: string;
  category: ElectronicComponent['category'];
  difficulty: ElectronicComponent['difficulty'];
}

// Curated 50-component learning library for drones, autonomous robots,
// rovers and beginner robotics projects.
const CURATED_COMPONENTS: CatalogEntry[] = [
  { id: 'curated-arduino-uno-r3', name: 'Arduino Uno R3', category: 'microcontrollers', difficulty: 'Beginner' },
  { id: 'curated-esp32-devkit-v1', name: 'ESP32 DevKit V1', category: 'microcontrollers', difficulty: 'Beginner' },
  { id: 'curated-stm32-blue-pill', name: 'STM32 Blue Pill', category: 'microcontrollers', difficulty: 'Intermediate' },
  { id: 'curated-rpi-pico-w', name: 'Raspberry Pi Pico W', category: 'microcontrollers', difficulty: 'Intermediate' },
  { id: 'curated-rpi-5-8gb', name: 'Raspberry Pi 5 8GB', category: 'computing_boards', difficulty: 'Intermediate' },
  { id: 'curated-jetson-orin-nano', name: 'NVIDIA Jetson Orin Nano 8GB', category: 'computing_boards', difficulty: 'Advanced' },
  { id: 'curated-hc-sr04', name: 'HC-SR04 Ultrasonic Sensor', category: 'sensors', difficulty: 'Beginner' },
  { id: 'curated-vl53l0x', name: 'VL53L0X ToF Sensor', category: 'sensors', difficulty: 'Beginner' },
  { id: 'curated-tcrt5000', name: 'TCRT5000 IR Sensor', category: 'sensors', difficulty: 'Beginner' },
  { id: 'curated-mpu6050', name: 'MPU6050', category: 'sensors', difficulty: 'Intermediate' },
  { id: 'curated-mpu9250', name: 'MPU9250', category: 'sensors', difficulty: 'Advanced' },
  { id: 'curated-icm20948', name: 'ICM-20948', category: 'sensors', difficulty: 'Advanced' },
  { id: 'curated-bno085', name: 'BNO085 IMU', category: 'sensors', difficulty: 'Advanced' },
  { id: 'curated-bme280', name: 'BME280', category: 'sensors', difficulty: 'Intermediate' },
  { id: 'curated-bmp280', name: 'BMP280', category: 'sensors', difficulty: 'Beginner' },
  { id: 'curated-ms5611', name: 'MS5611 Barometric Sensor', category: 'sensors', difficulty: 'Advanced' },
  { id: 'curated-hmc5883l', name: 'HMC5883L', category: 'sensors', difficulty: 'Intermediate' },
  { id: 'curated-as5600', name: 'AS5600 Magnetic Encoder', category: 'sensors', difficulty: 'Intermediate' },
  { id: 'curated-bno055', name: 'BNO055 Absolute Orientation', category: 'sensors', difficulty: 'Advanced' },
  { id: 'curated-ina219', name: 'INA219 Current Sensor', category: 'sensors', difficulty: 'Intermediate' },
  { id: 'curated-acs712-20a', name: 'ACS712 20A Current Sensor', category: 'sensors', difficulty: 'Intermediate' },
  { id: 'curated-sg90', name: 'SG90 Micro Servo', category: 'actuators', difficulty: 'Beginner' },
  { id: 'curated-mg996r', name: 'MG996R High Torque Servo', category: 'actuators', difficulty: 'Beginner' },
  { id: 'curated-dynamixel-xl320', name: 'Dynamixel XL-320', category: 'actuators', difficulty: 'Advanced' },
  { id: 'curated-nema17', name: 'NEMA 17 Stepper Motor', category: 'actuators', difficulty: 'Intermediate' },
  { id: 'curated-tt-motor', name: 'TT DC Gear Motor', category: 'actuators', difficulty: 'Beginner' },
  { id: 'curated-bo-motor', name: 'BO Gear Motor', category: 'actuators', difficulty: 'Beginner' },
  { id: 'curated-n20-motor', name: 'N20 Micro Gear Motor', category: 'actuators', difficulty: 'Beginner' },
  { id: 'curated-bldc-2212', name: 'Brushless DC Motor 2212', category: 'actuators', difficulty: 'Intermediate' },
  { id: 'curated-bldc-2205', name: 'Brushless DC Motor 2205', category: 'actuators', difficulty: 'Intermediate' },
  { id: 'curated-bldc-2306', name: 'Brushless DC Motor 2306', category: 'actuators', difficulty: 'Intermediate' },
  { id: 'curated-esc-30a', name: 'ESC 30A Brushless Motor Controller', category: 'actuators', difficulty: 'Intermediate' },
  { id: 'curated-bldc-2812', name: 'Brushless DC Motor 2812', category: 'actuators', difficulty: 'Intermediate' },
  { id: 'curated-l298n', name: 'L298N Motor Driver Module', category: 'power', difficulty: 'Beginner' },
  { id: 'curated-tb6612', name: 'TB6612FNG Motor Driver', category: 'power', difficulty: 'Intermediate' },
  { id: 'curated-bts7960', name: 'BTS7960 Motor Driver', category: 'power', difficulty: 'Intermediate' },
  { id: 'curated-vnh2sp30', name: 'VNH2SP30 Motor Driver', category: 'power', difficulty: 'Intermediate' },
  { id: 'curated-pca9685', name: 'PCA9685 16-Channel PWM Driver', category: 'power', difficulty: 'Intermediate' },
  { id: 'curated-a4988', name: 'A4988 Stepper Driver', category: 'power', difficulty: 'Intermediate' },
  { id: 'curated-tmc2209', name: 'TMC2209 Stepper Driver', category: 'power', difficulty: 'Advanced' },
  { id: 'curated-cytron-mdd10a', name: 'Cytron MDD10A', category: 'power', difficulty: 'Intermediate' },
  { id: 'curated-tp4056', name: 'TP4056 Li-Ion Charger Module', category: 'power', difficulty: 'Intermediate' },
  { id: 'curated-3s-lipo', name: '3S LiPo Battery Pack', category: 'power', difficulty: 'Intermediate' },
  { id: 'curated-hc05', name: 'HC-05 Bluetooth Module', category: 'communication', difficulty: 'Beginner' },
  { id: 'curated-nrf24l01', name: 'nRF24L01+', category: 'communication', difficulty: 'Intermediate' },
  { id: 'curated-lora-sx1278', name: 'LoRa SX1278 Ra-02', category: 'communication', difficulty: 'Intermediate' },
  { id: 'curated-neo6m', name: 'NEO-6M GPS Module', category: 'communication', difficulty: 'Intermediate' },
  { id: 'curated-mcp2515', name: 'MCP2515 CAN Module', category: 'communication', difficulty: 'Advanced' },
  { id: 'curated-max485', name: 'MAX485 RS485 Module', category: 'communication', difficulty: 'Intermediate' },
  { id: 'curated-w5500', name: 'W5500 Ethernet Module', category: 'communication', difficulty: 'Intermediate' }
];

export const COMPONENT_CATALOG: CatalogEntry[] = CURATED_COMPONENTS;

function defaultCodeFor(category: ElectronicComponent['category']) {
  if (category === 'microcontrollers' || category === 'computing_boards') {
    return `// Beginner robotics control loop\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  // Read a sensor, decide what to do, then control an output.\n  delay(100);\n}`;
  }
  if (category === 'sensors') {
    return `// Sensor learning skeleton\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  int reading = 0; // replace with the real sensor reading\n  Serial.println(reading);\n  delay(100);\n}`;
  }
  if (category === 'actuators') {
    return `// Actuator learning skeleton\nconst int controlPin = 9;\n\nvoid setup() {\n  pinMode(controlPin, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(controlPin, 80);\n  delay(500);\n  analogWrite(controlPin, 0);\n  delay(500);\n}`;
  }
  if (category === 'communication') {
    return `// Communication learning skeleton\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  Serial.println("Hello Robot");\n  delay(1000);\n}`;
  }
  return `// Start by identifying power, input/control and output connections.\n// Check the exact datasheet before wiring the real component.`;
}

export function catalogEntryToComponent(entry: CatalogEntry): ElectronicComponent {
  const guide = createComponentLearningGuide(entry.name, entry.category);
  const code = defaultCodeFor(entry.category);
  const safety = [
    'Check the exact voltage, current, polarity and pinout before connecting power.',
    'Use the correct driver, regulator or charger for the component instead of relying on a GPIO pin.',
    'Disconnect power before changing physical wiring.'
  ];

  return {
    ...entry,
    modelType: 'generic',
    tagline: `${entry.name} — a focused robotics learning component.`,
    description: `${guide.simpleExplanation} This entry is designed as a beginner-friendly reference; exact electrical limits must be verified for the specific part or board variant.`,
    whatIsIt: guide.simpleExplanation,
    whyUsed: guide.whereUsed.join(', ') + '.',
    howItWorks: guide.howItWorksStepByStep.join(' '),
    internalWorking: guide.inputsOutputs,
    learningGuide: guide,
    specifications: [
      { key: 'Learning level', value: entry.difficulty },
      { key: 'Reference status', value: 'Curated robotics learning entry — verify exact variant' },
      { key: 'Category', value: entry.category }
    ],
    pins: [],
    wiringGuide: { targetBoard: 'Use the manufacturer datasheet for exact pinout and power requirements.', connections: [] },
    codeExamples: [{ language: 'cpp', title: 'Beginner robotics starter', code, explanation: 'A safe learning skeleton. Replace the placeholder input/output with the exact interface described by the component datasheet.' }],
    codeExampleCpp: code,
    codeExamplePython: `# Beginner robotics learning skeleton\nprint('Start by reading the component documentation and its inputs/outputs.')`,
    commonMistakes: [
      'Assuming every board or module with a similar name has the same pinout.',
      'Connecting a motor or other high-current load directly to a microcontroller GPIO.',
      'Skipping the small test step and trying the full robot immediately.'
    ],
    safetyRules: safety,
    safetyGuidelines: safety,
    realWorldApplications: guide.whereUsed,
    relatedComponentIds: []
  };
}
