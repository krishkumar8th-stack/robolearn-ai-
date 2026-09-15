import { ElectronicComponent, Course, CodingChallenge, RoboticsProject, Achievement } from '../../src/types/index.js';

export const SEED_COMPONENTS: ElectronicComponent[] = [
  {
    id: 'arduino-uno',
    name: 'Arduino Uno R3',
    category: 'microcontrollers',
    difficulty: 'Beginner',
    tagline: 'The gold standard open-source microcontroller board for robotics and makers.',
    description: 'The Arduino Uno R3 is built around the ATmega328P microcontroller, featuring 14 digital I/O pins (6 PWM), 6 analog inputs, a 16 MHz quartz crystal, and USB interface.',
    imageUrl: '/assets/images/arduino_uno.jpg',
    modelType: 'arduino_uno',
    whatIsIt: 'A versatile development board that allows you to write C/C++ code and interact with physical sensors, motors, and circuits.',
    whyUsed: 'It is the most beginner-friendly platform with huge library support, robust 5V operating logic, and indestructible design.',
    howItWorks: 'The ATmega328P processor executes instructions written in C/C++ in a perpetual loop, sampling analog/digital pins and driving output signals via GPIO.',
    internalWorking: 'Contains flash memory (32KB), SRAM (2KB) for runtime variables, EEPROM (1KB), an on-board 5V/3.3V linear regulator, and an ATmega16U2 for USB-to-serial conversion.',
    specifications: [
      { key: 'Microcontroller', value: 'ATmega328P (8-bit AVR)' },
      { key: 'Operating Voltage', value: '5V DC' },
      { key: 'Input Voltage (Recommended)', value: '7V - 12V DC via barrel jack' },
      { key: 'Digital I/O Pins', value: '14 (of which 6 provide PWM output: D3, D5, D6, D9, D10, D11)' },
      { key: 'Analog Input Pins', value: '6 (A0 - A5, 10-bit resolution)' },
      { key: 'DC Current per I/O Pin', value: '20 mA' },
      { key: 'Flash Memory', value: '32 KB (0.5 KB used by bootloader)' },
      { key: 'Clock Speed', value: '16 MHz' }
    ],
    pins: [
      { pinNumber: '5V', name: '5V Power Output', type: 'Power', description: 'Regulated 5V supply from USB or onboard regulator', voltage: '5V' },
      { pinNumber: '3.3V', name: '3.3V Power Output', type: 'Power', description: 'Regulated 3.3V supply (max 50mA)', voltage: '3.3V' },
      { pinNumber: 'GND', name: 'Ground', type: 'Ground', description: 'Common reference ground voltage (0V)', voltage: '0V' },
      { pinNumber: 'VIN', name: 'Voltage Input', type: 'Power', description: 'Raw external DC voltage input (7-12V)', voltage: '7-12V' },
      { pinNumber: 'D0 (RX)', name: 'Serial Receive', type: 'Communication', description: 'UART serial data receive pin (connected to USB chip)', voltage: '5V' },
      { pinNumber: 'D1 (TX)', name: 'Serial Transmit', type: 'Communication', description: 'UART serial data transmit pin (connected to USB chip)', voltage: '5V' },
      { pinNumber: 'D13', name: 'Digital Pin 13 (Built-in LED)', type: 'Digital I/O', description: 'Standard GPIO with onboard yellow LED and resistor', voltage: '5V' },
      { pinNumber: 'D9', name: 'PWM Pin 9', type: 'PWM', description: '8-bit PWM timer output for servo / motor speed control', voltage: '5V' },
      { pinNumber: 'A0', name: 'Analog In 0', type: 'Analog Input', description: '10-bit analog to digital converter channel (0 - 1023)', voltage: '0-5V' }
    ],
    wiringGuide: {
      targetBoard: 'Standalone / USB Host',
      connections: [
        { pinOnComponent: 'USB Port', pinOnBoard: 'PC USB Port', wireColor: 'Blue/Black', notes: 'Powers board and uploads compiled hex code' },
        { pinOnComponent: 'GND', pinOnBoard: 'Breadboard Rail (-)', wireColor: 'Black', notes: 'Connect common ground for all peripherals' },
        { pinOnComponent: '5V', pinOnBoard: 'Breadboard Rail (+)', wireColor: 'Red', notes: 'Provides VCC power rail' }
      ]
    },
    codeExamples: [
      {
        language: 'cpp',
        title: 'Blink Built-in LED',
        code: `void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH); // Turn LED ON\n  delay(1000);            // Wait 1 second\n  digitalWrite(13, LOW);  // Turn LED OFF\n  delay(1000);            // Wait 1 second\n}`,
        explanation: 'Initializes pin 13 as an output, then continuously toggles voltage between 5V (HIGH) and 0V (LOW) with a 1000ms delay.'
      }
    ],
    commonMistakes: [
      'Drawing more than 40mA absolute maximum from a single GPIO pin (burns the microcontroller pin).',
      'Powering heavy inductive loads like motors directly from the 5V pin instead of an external battery.',
      'Connecting pins D0 and D1 while uploading code, which conflicts with USB serial programming.'
    ],
    safetyRules: [
      'Always disconnect power before rewiring circuits.',
      'Never short 5V directly to GND without a resistive load.'
    ],
    realWorldApplications: [
      'Automated home lighting controllers',
      'Autonomous obstacle avoidance robotics',
      'Industrial sensor logging stations'
    ],
    relatedComponentIds: ['led', 'resistor', 'ultrasonic', 'servo', 'l298n']
  },
  {
    id: 'esp32',
    name: 'ESP32 NodeMCU',
    category: 'microcontrollers',
    difficulty: 'Intermediate',
    tagline: 'Dual-core 240MHz Wi-Fi and Bluetooth SoC for modern IoT and connected robotics.',
    description: 'The ESP32 is a powerhouse IoT microcontroller with integrated 2.4 GHz Wi-Fi, Bluetooth BLE, dual-core Xtensa 32-bit LX6 processor, capacitive touch, and ultra-low power co-processor.',
    imageUrl: '/assets/images/esp32.jpg',
    modelType: 'esp32',
    whatIsIt: 'A low-cost, high-performance system-on-a-chip designed for mobile, wearable electronics, and Internet of Things robotics.',
    whyUsed: 'Provides orders of magnitude more speed, RAM, and native wireless connectivity compared to traditional 8-bit boards at similar cost.',
    howItWorks: 'Dual cores allow one CPU core to handle high-speed Wi-Fi/networking tasks while the second core runs sensor acquisition and motor control without lag.',
    internalWorking: 'Silicon contains 520 KB SRAM, 448 KB ROM, hardware cryptographic accelerators (AES, SHA, RSA), DACs, and ADC multiplexers.',
    specifications: [
      { key: 'CPU', value: 'Dual-Core Xtensa 32-bit LX6 @ up to 240 MHz' },
      { key: 'Wireless', value: 'Wi-Fi 802.11 b/g/n & Bluetooth 4.2 / BLE' },
      { key: 'Operating Voltage', value: '3.3V Logic (NOT 5V tolerant!)' },
      { key: 'SRAM', value: '520 KB' },
      { key: 'Flash Memory', value: '4 MB (SPI Flash)' },
      { key: 'GPIO Pins', value: '36 total (with PWM, capacitive touch, ADC, DAC)' }
    ],
    pins: [
      { pinNumber: '3V3', name: '3.3V Regulated Output', type: 'Power', description: 'Outputs regulated 3.3V DC (max 500mA)', voltage: '3.3V' },
      { pinNumber: 'GND', name: 'Ground', type: 'Ground', description: 'System Ground (0V)', voltage: '0V' },
      { pinNumber: 'GPIO 2', name: 'Digital 2 (Onboard LED)', type: 'Digital I/O', description: 'General purpose I/O with blue onboard indicator LED', voltage: '3.3V' },
      { pinNumber: 'GPIO 21', name: 'SDA', type: 'Communication', description: 'I2C Data line for displays and IMU sensors', voltage: '3.3V' },
      { pinNumber: 'GPIO 22', name: 'SCL', type: 'Communication', description: 'I2C Clock line', voltage: '3.3V' }
    ],
    wiringGuide: {
      targetBoard: 'IoT Dev Node',
      connections: [
        { pinOnComponent: 'VIN', pinOnBoard: '5V External / USB', wireColor: 'Red', notes: 'Powers onboard AMS1117 3.3V regulator' },
        { pinOnComponent: 'GND', pinOnBoard: 'Ground', wireColor: 'Black', notes: 'Common ground reference' }
      ]
    },
    codeExamples: [
      {
        language: 'cpp',
        title: 'ESP32 Wi-Fi Telemetry Server',
        code: `#include <WiFi.h>\n\nconst char* ssid = "RoboLearn_Lab";\nconst char* pass = "maker123";\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(ssid, pass);\n  while (WiFi.status() != WL_CONNECTED) {\n    delay(500);\n    Serial.print(".");\n  }\n  Serial.println("\\nConnected! IP: " + WiFi.localIP().toString());\n}\n\nvoid loop() {\n  // Run robotics telemetry loop\n  delay(100);\n}`,
        explanation: 'Connects to a 2.4GHz Wi-Fi router, obtains a dynamic local DHCP IP address, and starts serial telemetry output.'
      }
    ],
    commonMistakes: [
      'Applying 5V signals directly to GPIO pins (ESP32 inputs are strictly 3.3V and can fry without logic level shifters).',
      'Using strapping pins (GPIO 0, 2, 12, 15) without understanding their boot mode influence.'
    ],
    safetyRules: ['Use level-shifter ICs or voltage divider resistors when interfacing with 5V sensor outputs.'],
    realWorldApplications: ['Smart agricultural drones', 'Cloud-connected autonomous rovers', 'Industrial vibration monitors'],
    relatedComponentIds: ['arduino-uno', 'ultrasonic', 'motor_driver']
  },
  {
    id: 'ultrasonic',
    name: 'HC-SR04 Ultrasonic Distance Sensor',
    category: 'sensors',
    difficulty: 'Beginner',
    tagline: 'Precision non-contact sonar sensor measuring distance from 2cm to 400cm.',
    description: 'The HC-SR04 provides 2cm to 400cm non-contact measurement functionality with ranging accuracy up to 3mm. It contains an ultrasonic transmitter, receiver, and control circuit.',
    imageUrl: '/assets/images/sonar.jpg',
    modelType: 'ultrasonic',
    whatIsIt: 'A sonar-based distance measurement sensor that works like bat echolocation.',
    whyUsed: 'Essential for obstacle avoidance in autonomous robots and liquid level monitoring.',
    howItWorks: 'Emits an ultrasonic sound burst at 40 kHz, listens for the reflected echo off objects, and outputs a HIGH pulse proportional to transit time.',
    internalWorking: 'When Trigger receives a 10µs HIGH pulse, the sensor generates eight 40kHz sonic bursts. Echo pin stays HIGH until sound returns. Distance = (Echo_Duration * Speed_of_Sound) / 2.',
    specifications: [
      { key: 'Operating Voltage', value: '5V DC' },
      { key: 'Operating Current', value: '15 mA' },
      { key: 'Ultrasonic Frequency', value: '40 kHz' },
      { key: 'Max Range', value: '400 cm (4 meters)' },
      { key: 'Min Range', value: '2 cm' },
      { key: 'Ranging Angle', value: '15 degrees cone' },
      { key: 'Trigger Input Signal', value: '10 µs TTL pulse' }
    ],
    pins: [
      { pinNumber: '1', name: 'VCC', type: 'Power', description: '+5V Power Supply', voltage: '5V' },
      { pinNumber: '2', name: 'TRIG (Trigger)', type: 'Digital I/O', description: 'Trigger input pulse pin (send 10 microsecond pulse)', voltage: '5V' },
      { pinNumber: '3', name: 'ECHO', type: 'Digital I/O', description: 'Echo output pulse pin (pulse length = time of flight)', voltage: '5V' },
      { pinNumber: '4', name: 'GND', type: 'Ground', description: 'Ground pin (0V)', voltage: '0V' }
    ],
    wiringGuide: {
      targetBoard: 'Arduino Uno',
      connections: [
        { pinOnComponent: 'VCC', pinOnBoard: '5V', wireColor: 'Red', notes: 'Powers sensor electronics' },
        { pinOnComponent: 'TRIG', pinOnBoard: 'Digital Pin 9', wireColor: 'Yellow', notes: 'Trigger signal from microcontroller' },
        { pinOnComponent: 'ECHO', pinOnBoard: 'Digital Pin 10', wireColor: 'Green', notes: 'Echo pulse returned to microcontroller' },
        { pinOnComponent: 'GND', pinOnBoard: 'GND', wireColor: 'Black', notes: 'Common ground' }
      ]
    },
    codeExamples: [
      {
        language: 'cpp',
        title: 'Calculate Distance in Centimeters',
        code: `const int trigPin = 9;\nconst int echoPin = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n}\n\nvoid loop() {\n  digitalWrite(trigPin, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trigPin, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n\n  long duration = pulseIn(echoPin, HIGH);\n  float distanceCm = duration * 0.034 / 2;\n\n  Serial.print("Distance: ");\n  Serial.print(distanceCm);\n  Serial.println(" cm");\n  delay(100);\n}`,
        explanation: 'Sends a 10µs pulse to TRIG, times the round-trip echo pulse duration with pulseIn, and multiplies by speed of sound (0.034 cm/µs) divided by 2.'
      }
    ],
    commonMistakes: [
      'Forgetting to divide duration by 2 (sound travels to the obstacle AND back).',
      'Targeting soft cloth or acute angles that absorb or deflect ultrasonic waves away from the receiver.',
      'Blocking delays that freeze the main robotics navigation loop.'
    ],
    safetyRules: ['Do not exceed 5.5V on VCC.'],
    realWorldApplications: ['Automotive reverse parking radar', 'Autonomous vacuum cleaners', 'Smart trash bin lid openers'],
    relatedComponentIds: ['arduino-uno', 'servo', 'buzzer']
  },
  {
    id: 'servo',
    name: 'SG90 Micro Servo Motor',
    category: 'actuators',
    difficulty: 'Beginner',
    tagline: 'Lightweight 180-degree precision position actuator for robotics steering and grippers.',
    description: 'The Tower Pro SG90 is a high-torque, miniature 9g analog servo motor capable of rotating approximately 180 degrees with high precision based on PWM pulse duration.',
    imageUrl: '/assets/images/servo.jpg',
    modelType: 'servo',
    whatIsIt: 'A geared motor paired with an internal potentiometer and feedback controller that holds an exact angular position.',
    whyUsed: 'Unlike DC motors that spin continuously, servos hold a specified angle (0° - 180°), perfect for steering front wheels, robotic arms, and sensor turrets.',
    howItWorks: 'Receives a 50Hz PWM signal (20ms period). A pulse width of 1.0ms sets 0°, 1.5ms sets 90° (center), and 2.0ms sets 180°.',
    internalWorking: 'Internal DC motor drives a nylon gear train connected to an output shaft and a feedback potentiometer. Error amplifier adjusts motor power until target angle matches measured angle.',
    specifications: [
      { key: 'Operating Voltage', value: '4.8V to 6.0V' },
      { key: 'Stall Torque', value: '1.8 kg·cm (at 4.8V)' },
      { key: 'Operating Speed', value: '0.1 s/60 degree' },
      { key: 'Rotation Range', value: '0° to 180°' },
      { key: 'Weight', value: '9 grams' },
      { key: 'Gear Type', value: 'POM Plastic gear set' }
    ],
    pins: [
      { pinNumber: 'Brown Wire', name: 'GND', type: 'Ground', description: 'Negative power rail (0V)', voltage: '0V' },
      { pinNumber: 'Red Wire', name: 'VCC', type: 'Power', description: 'Positive power supply (+4.8V - 6V)', voltage: '5V' },
      { pinNumber: 'Orange Wire', name: 'PWM Signal', type: 'Control', description: 'PWM control pulse (1ms - 2ms)', voltage: '5V' }
    ],
    wiringGuide: {
      targetBoard: 'Arduino Uno',
      connections: [
        { pinOnComponent: 'Red Wire (VCC)', pinOnBoard: '5V', wireColor: 'Red', notes: 'Powers internal motor' },
        { pinOnComponent: 'Brown Wire (GND)', pinOnBoard: 'GND', wireColor: 'Brown/Black', notes: 'Ground' },
        { pinOnComponent: 'Orange Wire (Signal)', pinOnBoard: 'Digital Pin 9 (PWM)', wireColor: 'Orange', notes: 'PWM control signal' }
      ]
    },
    codeExamples: [
      {
        language: 'cpp',
        title: 'Sweep Servo 0 to 180 Degrees',
        code: `#include <Servo.h>\n\nServo myServo;\n\nvoid setup() {\n  myServo.attach(9);\n}\n\nvoid loop() {\n  for (int pos = 0; pos <= 180; pos += 5) {\n    myServo.write(pos);\n    delay(20);\n  }\n  for (int pos = 180; pos >= 0; pos -= 5) {\n    myServo.write(pos);\n    delay(20);\n  }\n}`,
        explanation: 'Attaches servo to pin 9 and smoothly increments the position from 0° to 180° and sweeps back.'
      }
    ],
    commonMistakes: [
      'Manually forcing the servo horn past its physical mechanical endstops, stripping the internal plastic gears.',
      'Powering multiple servos simultaneously from the Arduino 5V pin, causing microcontroller brown-outs.'
    ],
    safetyRules: ['Use an external 5V 2A power supply with shared ground when driving more than 1 servo.'],
    realWorldApplications: ['Robotic gripper fingers', 'Camera pan-tilt turrets', 'RC airplane rudder control'],
    relatedComponentIds: ['arduino-uno', 'dc-motor', 'ultrasonic']
  },
  {
    id: 'l298n',
    name: 'L298N Dual H-Bridge Motor Driver',
    category: 'robotics',
    difficulty: 'Intermediate',
    tagline: 'High-power dual DC motor and stepper controller for mobile robotics.',
    description: 'The L298N module contains a dual H-bridge driver capable of driving two DC motors bidirectionally with full PWM speed and direction control up to 2 Amps per channel.',
    imageUrl: '/assets/images/l298n.jpg',
    modelType: 'motor_driver',
    whatIsIt: 'A power amplifier circuit that translates low-power microcontroller logic signals into high-current power for DC motors.',
    whyUsed: 'Arduino pins provide only 20mA; DC motors consume 300mA - 2000mA. The L298N isolates and safely delivers power from a battery pack to the motors.',
    howItWorks: 'Uses four power transistors per motor in an H configuration. Toggling diagonal pairs reverses current polarity, spinning the motor clockwise or counterclockwise.',
    internalWorking: 'Contains integrated flyback protection diodes, 78M05 5V linear voltage regulator (activated via jumper), and logic input buffers.',
    specifications: [
      { key: 'Driver IC', value: 'ST L298N Dual Full-Bridge' },
      { key: 'Drive Voltage', value: '5V - 35V DC' },
      { key: 'Peak Drive Current', value: '2A per bridge' },
      { key: 'Logic Voltage', value: '5V' },
      { key: 'Max Power Consumption', value: '25W (heat sink attached)' }
    ],
    pins: [
      { pinNumber: '12V', name: 'Motor Power (VMS)', type: 'Power', description: 'External battery power input (7V - 12V)', voltage: '7-12V' },
      { pinNumber: 'GND', name: 'Power Ground', type: 'Ground', description: 'Common ground connecting battery and Arduino GND', voltage: '0V' },
      { pinNumber: '5V', name: 'Logic Power / 5V Out', type: 'Power', description: '5V output if 12V jumper is in place', voltage: '5V' },
      { pinNumber: 'ENA', name: 'Enable A (Speed Motor 1)', type: 'PWM', description: 'PWM speed control for left motor', voltage: '5V' },
      { pinNumber: 'IN1, IN2', name: 'Direction Inputs A', type: 'Digital I/O', description: 'Logic states: HIGH-LOW=Forward, LOW-HIGH=Reverse', voltage: '5V' },
      { pinNumber: 'IN3, IN4', name: 'Direction Inputs B', type: 'Digital I/O', description: 'Direction control for right motor', voltage: '5V' },
      { pinNumber: 'ENB', name: 'Enable B (Speed Motor 2)', type: 'PWM', description: 'PWM speed control for right motor', voltage: '5V' }
    ],
    wiringGuide: {
      targetBoard: 'Arduino Uno & 2WD Chassis',
      connections: [
        { pinOnComponent: '12V', pinOnBoard: 'Battery (+) 7.4V/11.1V', wireColor: 'Red', notes: 'High current battery supply' },
        { pinOnComponent: 'GND', pinOnBoard: 'Battery (-) & Arduino GND', wireColor: 'Black', notes: 'COMMON GROUND IS CRITICAL' },
        { pinOnComponent: 'IN1', pinOnBoard: 'Digital 4', wireColor: 'Blue', notes: 'Left Motor Forward' },
        { pinOnComponent: 'IN2', pinOnBoard: 'Digital 5', wireColor: 'Blue', notes: 'Left Motor Backward' },
        { pinOnComponent: 'IN3', pinOnBoard: 'Digital 6', wireColor: 'Green', notes: 'Right Motor Forward' },
        { pinOnComponent: 'IN4', pinOnBoard: 'Digital 7', wireColor: 'Green', notes: 'Right Motor Backward' }
      ]
    },
    codeExamples: [
      {
        language: 'cpp',
        title: 'Autonomous Forward & Turn Routine',
        code: `const int in1 = 4, in2 = 5;\nconst int in3 = 6, in4 = 7;\n\nvoid setup() {\n  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);\n  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);\n}\n\nvoid forward() {\n  digitalWrite(in1, HIGH); digitalWrite(in2, LOW);\n  digitalWrite(in3, HIGH); digitalWrite(in4, LOW);\n}\n\nvoid turnLeft() {\n  digitalWrite(in1, LOW);  digitalWrite(in2, HIGH);\n  digitalWrite(in3, HIGH); digitalWrite(in4, LOW);\n}\n\nvoid stopMotors() {\n  digitalWrite(in1, LOW); digitalWrite(in2, LOW);\n  digitalWrite(in3, LOW); digitalWrite(in4, LOW);\n}\n\nvoid loop() {\n  forward();\n  delay(2000);\n  turnLeft();\n  delay(600);\n  stopMotors();\n  delay(1000);\n}`,
        explanation: 'Configures 4 directional digital pins and executes differential drive motions: forward, pivot left, and active brake.'
      }
    ],
    commonMistakes: [
      'Forgetting to connect battery ground to the Arduino ground (floating ground causes erratic behavior).',
      'Attempting to power the L298N motors from the Arduino 5V rail instead of external battery.'
    ],
    safetyRules: ['Use proper gauge wires for high-current motor connections to prevent wire heating.'],
    realWorldApplications: ['Warehouse AGVs (Automated Guided Vehicles)', 'Combat robots', 'Line follower robots'],
    relatedComponentIds: ['arduino-uno', 'dc-motor', 'chassis']
  },
  {
    id: 'led',
    name: '5mm Diffused LED',
    category: 'basic_electronics',
    difficulty: 'Beginner',
    tagline: 'Semiconductor light source used as indicator, display, and optical transmitter.',
    description: 'A Light Emitting Diode is a p-n junction diode that emits light when forward biased. Highly efficient, long-lasting, and ideal for visual feedback in electronic circuits.',
    imageUrl: '/assets/images/led.jpg',
    modelType: 'led',
    whatIsIt: 'A polarized electronic component that emits colored light when electric current flows through it in one direction.',
    whyUsed: 'Provides immediate visual debugging status (power on, sensor triggered, communication active).',
    howItWorks: 'Electrons recombine with electron holes within the semiconductor device, releasing energy in the form of photons (electroluminescence).',
    internalWorking: 'Anode (longer leg) connects to positive potential, cathode (shorter leg, flat rim) to ground. Must be paired with a current-limiting resistor to prevent burning out.',
    specifications: [
      { key: 'Forward Voltage (Red/Yellow)', value: '1.8V - 2.2V' },
      { key: 'Forward Voltage (Blue/White/Green)', value: '3.0V - 3.4V' },
      { key: 'Forward Current (Typical)', value: '15 mA - 20 mA' },
      { key: 'Luminous Intensity', value: '200 - 400 mcd' },
      { key: 'Viewing Angle', value: '60 degrees' }
    ],
    pins: [
      { pinNumber: 'Long Leg', name: 'Anode (+)', type: 'Power', description: 'Connect to positive voltage via current-limiting resistor', voltage: '1.8V-3.3V' },
      { pinNumber: 'Short Leg', name: 'Cathode (-)', type: 'Ground', description: 'Connect to ground (0V)', voltage: '0V' }
    ],
    wiringGuide: {
      targetBoard: 'Arduino Uno Breadboard',
      connections: [
        { pinOnComponent: 'Anode (via 220Ω Resistor)', pinOnBoard: 'Digital Pin 13 / Pin 8', wireColor: 'Red', notes: 'Resistor limits current to safe 15mA' },
        { pinOnComponent: 'Cathode', pinOnBoard: 'GND', wireColor: 'Black', notes: 'Ground return path' }
      ]
    },
    codeExamples: [
      {
        language: 'cpp',
        title: 'PWM LED Brightness Fading',
        code: `int ledPin = 9; // PWM pin\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n  for (int b = 0; b <= 255; b++) {\n    analogWrite(ledPin, b);\n    delay(5);\n  }\n  for (int b = 255; b >= 0; b--) {\n    analogWrite(ledPin, b);\n    delay(5);\n  }\n}`,
        explanation: 'Uses analogWrite (PWM duty cycle 0 to 255) to smoothly fade LED brightness up and down.'
      }
    ],
    commonMistakes: [
      'Connecting directly to 5V without a current-limiting resistor (destroys the LED instantly).',
      'Plugging in backwards (reverse polarity prevents current flow).'
    ],
    safetyRules: ['Always compute resistor value: R = (V_supply - V_forward) / I_desired.'],
    realWorldApplications: ['Status indicators', 'Traffic light systems', 'Fiber optic transmitters'],
    relatedComponentIds: ['resistor', 'arduino-uno', 'buzzer']
  },
  {
    id: 'resistor',
    name: 'Through-Hole Resistor (220Ω / 10kΩ)',
    category: 'basic_electronics',
    difficulty: 'Beginner',
    tagline: 'Fundamental passive component that opposes electric current flow and drops voltage.',
    description: 'Resistors are two-terminal electrical components that implement electrical resistance as a circuit element according to Ohm’s Law: V = I * R.',
    imageUrl: '/assets/images/led.jpg',
    modelType: 'resistor',
    whatIsIt: 'A passive component that restricts the flow of electric current and creates voltage dividers.',
    whyUsed: 'Protects sensitive components like LEDs and microcontrollers from excessive current and establishes stable pull-up/pull-down logic levels.',
    howItWorks: 'Uses carbon film or metal oxide to resist the motion of electrons, dissipating excess energy as negligible heat.',
    internalWorking: 'Color-coded bands indicate resistance value in Ohms and tolerance percentage.',
    specifications: [
      { key: 'Common Values', value: '220Ω (LEDs), 1kΩ, 4.7kΩ (I2C pullup), 10kΩ (buttons)' },
      { key: 'Power Rating', value: '1/4 Watt (0.25W)' },
      { key: 'Tolerance', value: '±5% (Gold band)' },
      { key: 'Operating Temperature', value: '-55°C to +155°C' }
    ],
    pins: [
      { pinNumber: 'Lead 1', name: 'Terminal A', type: 'Digital I/O', description: 'Non-polarized lead', voltage: 'Variable' },
      { pinNumber: 'Lead 2', name: 'Terminal B', type: 'Digital I/O', description: 'Non-polarized lead', voltage: 'Variable' }
    ],
    wiringGuide: {
      targetBoard: 'Series Connection',
      connections: [
        { pinOnComponent: 'Lead 1', pinOnBoard: 'Arduino Digital Pin', wireColor: 'Yellow', notes: 'Incoming logic signal' },
        { pinOnComponent: 'Lead 2', pinOnBoard: 'LED Anode (+)', wireColor: 'Direct lead', notes: 'Current restricted' }
      ]
    },
    codeExamples: [
      {
        language: 'cpp',
        title: 'Using Internal Pull-Up Resistor',
        code: `const int buttonPin = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n  // Uses Arduino internal 20k pull-up resistor!\n  pinMode(buttonPin, INPUT_PULLUP);\n}\n\nvoid loop() {\n  int state = digitalRead(buttonPin);\n  if (state == LOW) {\n    Serial.println("Button Pressed!");\n  }\n  delay(50);\n}`,
        explanation: 'Avoids needing an external resistor by enabling the ATmega328P internal 20kΩ pull-up.'
      }
    ],
    commonMistakes: [
      'Misreading color code bands (e.g. confusing 220Ω with 22kΩ).',
      'Exceeding wattage rating in high-current power circuits causing the resistor to burn.'
    ],
    safetyRules: ['Check power dissipation: P = I^2 * R must stay below 0.25W for standard 1/4W resistors.'],
    realWorldApplications: ['Voltage dividers for analog sensors', 'I2C communication bus termination', 'Audio volume potentiometers'],
    relatedComponentIds: ['led', 'arduino-uno']
  },
  {
    id: 'buzzer',
    name: 'Active / Passive Piezo Buzzer',
    category: 'actuators',
    difficulty: 'Beginner',
    tagline: 'Auditory transducer producing tones, beeps, and alarm frequencies.',
    description: 'Piezo buzzers utilize piezoelectric crystals that flex and generate acoustic pressure waves when driven by electric voltage.',
    imageUrl: '/assets/images/sonar.jpg',
    modelType: 'buzzer',
    whatIsIt: 'An audio output device that produces sharp beeps or musical notes.',
    whyUsed: 'Provides sound feedback for alarms, proximity alerts, and system boot status.',
    howItWorks: 'Alternating electrical signals create mechanical vibration in a piezo-ceramic diaphragm, producing audible sound waves.',
    internalWorking: 'Active buzzers have an internal oscillating circuit (just supply DC voltage). Passive buzzers require an oscillating frequency (e.g., tone(pin, frequency)).',
    specifications: [
      { key: 'Operating Voltage', value: '3.3V - 5V DC' },
      { key: 'Resonant Frequency', value: '2.5 kHz ± 500 Hz' },
      { key: 'Sound Output', value: '≥ 85 dB at 10cm' },
      { key: 'Operating Current', value: '< 30 mA' }
    ],
    pins: [
      { pinNumber: '+', name: 'Positive (+)', type: 'Digital I/O', description: 'Signal or 5V rail', voltage: '5V' },
      { pinNumber: '-', name: 'Negative (-)', type: 'Ground', description: 'Ground (0V)', voltage: '0V' }
    ],
    wiringGuide: {
      targetBoard: 'Arduino Uno',
      connections: [
        { pinOnComponent: '+ Pin', pinOnBoard: 'Digital Pin 8', wireColor: 'Red', notes: 'Tone output pin' },
        { pinOnComponent: '- Pin', pinOnBoard: 'GND', wireColor: 'Black', notes: 'Ground' }
      ]
    },
    codeExamples: [
      {
        language: 'cpp',
        title: 'Obstacle Warning Siren',
        code: `int buzzerPin = 8;\n\nvoid setup() {\n  pinMode(buzzerPin, OUTPUT);\n}\n\nvoid loop() {\n  tone(buzzerPin, 1000); // 1 kHz tone\n  delay(200);\n  noTone(buzzerPin);\n  delay(200);\n}`,
        explanation: 'Generates a 1 kHz square wave tone using the Arduino hardware timer.'
      }
    ],
    commonMistakes: ['Confusing active buzzers with passive buzzers (active buzzers click instead of playing varying tones with tone()).'],
    safetyRules: ['Do not place buzzer directly next to ears during high-frequency tone testing.'],
    realWorldApplications: ['Microwave timer alarms', 'Car reverse distance sensors', 'Smoke detectors'],
    relatedComponentIds: ['arduino-uno', 'ultrasonic']
  },
  {
    id: 'ir-sensor',
    name: 'TCRT5000 Infrared Line Tracking Sensor',
    category: 'sensors',
    difficulty: 'Beginner',
    tagline: 'Infrared reflective sensor for black/white line following and close proximity detection.',
    description: 'Combines an infrared emitting diode and a phototransistor to detect surface reflectance, commonly used in autonomous line tracking robots.',
    imageUrl: '/assets/images/led.jpg',
    modelType: 'ir_sensor',
    whatIsIt: 'An optical reflective sensor module that distinguishes light surfaces from dark surfaces.',
    whyUsed: 'Provides sub-millisecond response for line tracking robots keeping them on course.',
    howItWorks: 'IR LED emits invisible 950nm light. White surfaces reflect light back into the phototransistor (OUTPUT LOW); black tape absorbs light (OUTPUT HIGH).',
    internalWorking: 'Contains an onboard LM393 comparator with an adjustment potentiometer to tune detection threshold.',
    specifications: [
      { key: 'Operating Voltage', value: '3.3V - 5V DC' },
      { key: 'Detection Distance', value: '1mm to 25mm' },
      { key: 'Output Format', value: 'Digital switching output (0 and 1)' },
      { key: 'Comparator IC', value: 'LM393 precision voltage comparator' }
    ],
    pins: [
      { pinNumber: 'VCC', name: 'Power', type: 'Power', description: '3.3V - 5V DC', voltage: '5V' },
      { pinNumber: 'GND', name: 'Ground', type: 'Ground', description: '0V', voltage: '0V' },
      { pinNumber: 'OUT', name: 'Digital Output', type: 'Digital I/O', description: 'High on black, Low on white', voltage: '5V' }
    ],
    wiringGuide: {
      targetBoard: 'Arduino Uno',
      connections: [
        { pinOnComponent: 'VCC', pinOnBoard: '5V', wireColor: 'Red', notes: 'Supply' },
        { pinOnComponent: 'GND', pinOnBoard: 'GND', wireColor: 'Black', notes: 'Ground' },
        { pinOnComponent: 'OUT', pinOnBoard: 'Digital Pin 2', wireColor: 'Yellow', notes: 'Reads 1 on black line' }
      ]
    },
    codeExamples: [
      {
        language: 'cpp',
        title: 'Line Following Reading',
        code: `int lineSensor = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(lineSensor, INPUT);\n}\n\nvoid loop() {\n  int isLine = digitalRead(lineSensor);\n  if (isLine == HIGH) {\n    Serial.println("Black line detected!");\n  } else {\n    Serial.println("White surface");\n  }\n  delay(50);\n}`,
        explanation: 'Samples the digital output pin to identify surface transition in real time.'
      }
    ],
    commonMistakes: ['Sunlight or ambient halogen lamps saturating the IR phototransistor receiver.'],
    safetyRules: ['Do not stare directly into high-powered industrial IR beams.'],
    realWorldApplications: ['Factory automated guided vehicles (AGVs)', 'Barcode scanners', 'Paper feed sensors in printers'],
    relatedComponentIds: ['arduino-uno', 'l298n', 'chassis']
  }
];

export const SEED_COURSES: Course[] = [
  {
    id: 'level-1-programming',
    level: 1,
    title: 'Level 1: Programming Fundamentals',
    tagline: 'Master the universal logic of code: variables, flow, loops, and functions.',
    description: 'Learn computational thinking and core C/C++ concepts tailored specifically for embedded electronics and robotics.',
    imageUrl: '/assets/images/breadboard.jpg',
    iconName: 'Code',
    lessons: [
      {
        id: 'l1-variables',
        courseId: 'level-1-programming',
        level: 1,
        title: 'Variables & Data Types in Robotics',
        summary: 'Understand memory slots, integers, floats, booleans, and how sensors store numbers.',
        durationMinutes: 15,
        learningObjective: 'Declare, initialize, and manipulate integer, floating point, and boolean variables in C/C++.',
        theory: [
          'In robotics, everything starts with data. A distance sensor returns an integer (centimeters), a temperature sensor outputs a float (degrees Celsius), and an obstacle detector gives a boolean (true/false).',
          'C/C++ is a statically typed language: every variable must have an explicit type declared before use.',
          'Common types in embedded systems: int (16-bit, -32768 to 32767), unsigned int, float (decimal precision), and bool (true/false).'
        ],
        diagramDescription: 'Memory slots labeled with variable names holding binary numeric values.',
        codeSnippet: `int distanceCm = 25;\nfloat batteryVoltage = 7.42;\nbool obstacleAhead = false;\n\nvoid setup() {\n  Serial.begin(9600);\n  if (distanceCm < 30) {\n    obstacleAhead = true;\n  }\n}`,
        programmingLanguage: 'cpp',
        simulationSetup: {
          components: ['arduino-uno'],
          defaultCode: `int ledState = 1;\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, ledState);\n  delay(500);\n  ledState = !ledState;\n}`,
          expectedAction: 'LED blinks using variable state'
        },
        quiz: [
          {
            question: 'Which C++ data type is most appropriate for storing a distance measurement of 15.75 centimeters?',
            options: ['int', 'float', 'bool', 'char'],
            correctIndex: 1,
            explanation: 'float stores floating-point decimal numbers with high precision.'
          },
          {
            question: 'What is the boolean value of an obstacle detected flag when an object is present?',
            options: ['0', 'true (or 1)', 'NULL', '-1'],
            correctIndex: 1,
            explanation: 'In C/C++, a true condition or 1 indicates active state.'
          }
        ],
        challenge: {
          title: 'Store and Toggle Variable',
          prompt: 'Declare an integer variable delayTime set to 300, and use it inside delay() to blink the LED.',
          starterCode: `// Modify this program using a variable for delay\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  int delayTime = 300;\n  digitalWrite(13, HIGH);\n  delay(delayTime);\n  digitalWrite(13, LOW);\n  delay(delayTime);\n}`,
          expectedResult: 'LED blinks every 300 milliseconds',
          hint: 'Replace the hardcoded delay number with your delayTime variable.'
        }
      },
      {
        id: 'l1-conditions',
        courseId: 'level-1-programming',
        level: 1,
        title: 'Conditional Decisions: If, Else & Logic',
        summary: 'Give your robot a brain to make real-time decisions based on sensor values.',
        durationMinutes: 20,
        learningObjective: 'Implement if-else branching logic and relational operators (<, >, ==, !=) to control actuators.',
        theory: [
          'Robots react dynamically by testing conditions. If distance is less than 20cm, stop the robot; else, drive forward.',
          'Relational operators compare values: < (less than), > (greater than), <=, >=, == (equal to), != (not equal to).',
          'Logical operators combine statements: && (AND), || (OR), ! (NOT).'
        ],
        diagramDescription: 'Flowchart with diamond decision node branching to Forward or Turn Left based on sensor threshold.',
        codeSnippet: `if (distance < 15) {\n  stopMotors();\n  turnLeft();\n} else {\n  moveForward();\n}`,
        programmingLanguage: 'cpp',
        quiz: [
          {
            question: 'Which operator checks if two values are equal in C/C++?',
            options: ['=', '==', '===', 'equals'],
            correctIndex: 1,
            explanation: '= is assignment, whereas == is equality comparison.'
          }
        ],
        challenge: {
          title: 'Safe Distance Braking',
          prompt: 'Write an if-condition: if distance < 20, turn LED on to indicate alert, otherwise turn it off.',
          starterCode: `int distance = 14;\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  if (distance < 20) {\n    digitalWrite(13, HIGH);\n  } else {\n    digitalWrite(13, LOW);\n  }\n}`,
          expectedResult: 'LED turns ON when distance < 20',
          hint: 'Check if (distance < 20).'
        }
      }
    ]
  },
  {
    id: 'level-3-arduino',
    level: 3,
    title: 'Level 3: Arduino Microcontroller Essentials',
    tagline: 'Connect code to physical reality with Digital I/O, PWM, and Serial telemetry.',
    description: 'Master the foundational functions of Arduino: pinMode, digitalWrite, digitalRead, analogRead, analogWrite, and millis.',
    imageUrl: '/assets/images/arduino_uno.jpg',
    iconName: 'Cpu',
    lessons: [
      {
        id: 'l3-digital-io',
        courseId: 'level-3-arduino',
        level: 3,
        title: 'Mastering Digital I/O & LEDs',
        summary: 'Learn pinMode(), digitalWrite(), and the voltage transitions of GPIO pins.',
        durationMinutes: 15,
        learningObjective: 'Configure pins as INPUT or OUTPUT and toggle 5V logic states safely.',
        theory: [
          'Arduino digital pins can function in two modes: OUTPUT (driving current out at 5V or sinking it to 0V) or INPUT (reading incoming voltage without loading the circuit).',
          'pinMode(pin, mode) configures the internal direction register in the ATmega chip.',
          'digitalWrite(pin, HIGH) connects the pin to internal +5V. digitalWrite(pin, LOW) connects it to GND (0V).'
        ],
        diagramDescription: 'Microcontroller pin output stage showing push-pull MOSFET switches connecting to 5V or GND.',
        codeSnippet: `void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`,
        programmingLanguage: 'cpp',
        simulationSetup: {
          components: ['arduino-uno', 'led', 'resistor'],
          defaultCode: `void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`,
          expectedAction: 'LED on pin 13 toggles every 1 second'
        },
        quiz: [
          {
            question: 'What voltage does digitalWrite(pin, HIGH) provide on an Arduino Uno?',
            options: ['3.3V', '5.0V', '12.0V', '1.8V'],
            correctIndex: 1,
            explanation: 'Arduino Uno uses 5V TTL logic level on digital I/O.'
          }
        ],
        challenge: {
          title: 'SOS Morse Code Flasher',
          prompt: 'Create an SOS sequence: 3 fast blinks (200ms), 3 long blinks (600ms), and 3 fast blinks.',
          starterCode: `void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid blink(int duration) {\n  digitalWrite(13, HIGH);\n  delay(duration);\n  digitalWrite(13, LOW);\n  delay(200);\n}\n\nvoid loop() {\n  // 3 short\n  for (int i=0; i<3; i++) blink(200);\n  // 3 long\n  for (int i=0; i<3; i++) blink(600);\n  // 3 short\n  for (int i=0; i<3; i++) blink(200);\n  delay(2000);\n}`,
          expectedResult: 'Blinks SOS pattern',
          hint: 'Use the helper function blink() with different delay durations.'
        }
      }
    ]
  },
  {
    id: 'level-4-sensors',
    level: 4,
    title: 'Level 4: Sensors & Echolocation',
    tagline: 'Equip your machine with ultrasonic sonar, infrared, and analog perception.',
    description: 'Understand the physics of ultrasound, time-of-flight math, and noise filtering for robotic perception.',
    imageUrl: '/assets/images/sonar.jpg',
    iconName: 'Radio',
    lessons: [
      {
        id: 'l4-ultrasonic-math',
        courseId: 'level-4-sensors',
        level: 4,
        title: 'Ultrasonic Distance Calculation & Physics',
        summary: 'Calculate distance from sound transit time using speed of sound in air.',
        durationMinutes: 20,
        learningObjective: 'Send microsecond pulses and calculate physical distance in centimeters using pulseIn.',
        theory: [
          'Sound travels through air at approximately 343 meters per second at 20°C, which equals 0.0343 cm per microsecond.',
          'Because the ultrasonic wave must travel to the obstacle AND bounce back to the sensor, the round-trip distance is 2x.',
          'Formula: Distance = (Transit_Time_Microseconds * 0.0343) / 2.'
        ],
        diagramDescription: 'Sonar cone expanding from transmitter transducer, reflecting off wall, and returning to receiver.',
        codeSnippet: `long duration;\nfloat distance;\n\ndigitalWrite(trigPin, LOW);\ndelayMicroseconds(2);\ndigitalWrite(trigPin, HIGH);\ndelayMicroseconds(10);\ndigitalWrite(trigPin, LOW);\n\nduration = pulseIn(echoPin, HIGH);\ndistance = duration * 0.034 / 2;`,
        programmingLanguage: 'cpp',
        quiz: [
          {
            question: 'If pulseIn returns 1000 microseconds, what is the approximate distance to the obstacle?',
            options: ['17 cm', '34 cm', '8.5 cm', '50 cm'],
            correctIndex: 0,
            explanation: 'Distance = (1000 * 0.034) / 2 = 17 centimeters.'
          }
        ],
        challenge: {
          title: 'Obstacle Warning Beep',
          prompt: 'Trigger an alert when distance drops below 15 centimeters.',
          starterCode: `const int trigPin = 9;\nconst int echoPin = 10;\nconst int alertLed = 13;\n\nvoid setup() {\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n  pinMode(alertLed, OUTPUT);\n}\n\nvoid loop() {\n  // Trigger pulse\n  digitalWrite(trigPin, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n  long d = pulseIn(echoPin, HIGH) * 0.034 / 2;\n  if (d < 15) {\n    digitalWrite(alertLed, HIGH);\n  } else {\n    digitalWrite(alertLed, LOW);\n  }\n  delay(100);\n}`,
          expectedResult: 'LED lights up when distance < 15cm',
          hint: 'Compare distance with 15.'
        }
      }
    ]
  },
  {
    id: 'level-9-autonomous-robotics',
    level: 9,
    title: 'Level 9: Autonomous Mobile Robotics',
    tagline: 'Combine chassis, motor drivers, servos, and sensors into a self-navigating rover.',
    description: 'Build fully autonomous obstacle-avoidance robots with real-time reactive steering state machines.',
    imageUrl: '/assets/images/rover.jpg',
    iconName: 'Navigation',
    lessons: [
      {
        id: 'l9-obstacle-avoidance',
        courseId: 'level-9-autonomous-robotics',
        level: 9,
        title: 'Obstacle Avoidance Reactive Algorithm',
        summary: 'Implement look-ahead scanning with servo and differential steering to navigate obstacles.',
        durationMinutes: 30,
        learningObjective: 'Program a mobile robot to drive forward, detect walls, scan left and right, and steer into clear paths.',
        theory: [
          'Reactive robotics follows the Sense-Plan-Act paradigm.',
          'Step 1 (Sense): Measure distance ahead using the ultrasonic sensor mounted on the front chassis.',
          'Step 2 (Plan): If distance < 20cm, stop motors, scan left (servo 150°) and right (servo 30°), choose the path with greater clearance.',
          'Step 3 (Act): Rotate chassis toward the open direction and resume forward cruise.'
        ],
        diagramDescription: 'Robot top view showing forward cone, obstacle detection event, and differential wheel spin for 90-degree pivot.',
        codeSnippet: `void checkAndEvade() {\n  float frontDist = readSonar();\n  if (frontDist < 20.0) {\n    stopRobot();\n    delay(200);\n    reverseRobot();\n    delay(400);\n    stopRobot();\n    turnLeft(90);\n  } else {\n    moveForward();\n  }\n}`,
        programmingLanguage: 'cpp',
        simulationSetup: {
          components: ['arduino-uno', 'ultrasonic', 'servo', 'l298n', 'chassis'],
          defaultCode: `void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  // Drive forward until obstacle within 20cm, then turn left\n  robotForward();\n  if (getSonarDistance() < 20) {\n    robotStop();\n    delay(200);\n    robotTurnLeft();\n    delay(800);\n  }\n  delay(50);\n}`,
          expectedAction: 'Robot moves forward and pivots left when obstacle is near'
        },
        quiz: [
          {
            question: 'To execute a sharp left pivot turn on a 2WD differential robot, what should the wheels do?',
            options: [
              'Both wheels spin forward at full speed',
              'Left wheel reverses while right wheel spins forward',
              'Turn off both wheels',
              'Right wheel stops while left wheel reverses'
            ],
            correctIndex: 1,
            explanation: 'Spinning left wheel backward and right wheel forward produces a zero-radius spin turn to the left.'
          }
        ],
        challenge: {
          title: '3-Direction Look-Ahead Scanner',
          prompt: 'Program the obstacle avoidance robot to stop when an obstacle is within 25cm, reverse slightly, and turn right.',
          starterCode: `void setup() {\n  initRobot();\n}\n\nvoid loop() {\n  int distance = readDistance();\n  if (distance < 25) {\n    robotStop();\n    delay(300);\n    robotTurnRight();\n    delay(700);\n  } else {\n    robotForward();\n  }\n  delay(60);\n}`,
          expectedResult: 'Robot halts and turns right upon meeting obstacle',
          hint: 'Use robotTurnRight() inside the obstacle detected branch.'
        }
      }
    ]
  }
];

export const SEED_CHALLENGES: CodingChallenge[] = [
  {
    id: 'ch-1-led-on',
    title: 'Turn on the LED',
    difficulty: 'Beginner',
    category: 'Digital GPIO',
    xpReward: 100,
    imageUrl: '/assets/images/led.jpg',
    problem: 'Write an Arduino C++ program to turn ON the LED connected to digital pin 13 and keep it powered.',
    objective: 'Configure pin 13 as an OUTPUT and write a HIGH voltage signal to it.',
    requiredComponents: ['arduino-uno', 'led', 'resistor'],
    constraints: ['Must use pinMode() in setup', 'Must use digitalWrite() in loop or setup'],
    starterCode: `void setup() {\n  // Set pin 13 as OUTPUT\n  \n}\n\nvoid loop() {\n  // Turn the LED ON\n  \n}`,
    programmingLanguage: 'cpp',
    hints: [
      'Call pinMode(13, OUTPUT) inside setup().',
      'Call digitalWrite(13, HIGH) inside loop() to supply 5V.'
    ],
    testCases: [
      { expectedAction: 'LED_SET pin=13 state=ON', description: 'Pin 13 output voltage is 5V (HIGH)' }
    ],
    solutionExplanation: 'pinMode(13, OUTPUT) configures the hardware pin driver, and digitalWrite(13, HIGH) applies +5V to the LED anode.'
  },
  {
    id: 'ch-2-led-blink',
    title: 'Blink an LED Every Second',
    difficulty: 'Intermediate',
    category: 'Timing & Loops',
    xpReward: 150,
    imageUrl: '/assets/images/arduino_uno.jpg',
    problem: 'Write a program that toggles pin 13 ON for 1000 milliseconds, then OFF for 1000 milliseconds in an infinite cycle.',
    objective: 'Use delay(1000) to introduce exact 1-second pauses between state changes.',
    requiredComponents: ['arduino-uno', 'led', 'resistor'],
    constraints: ['Cycle duration must equal 2000ms (1s HIGH, 1s LOW)'],
    starterCode: `void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  // Make LED blink 1 sec ON, 1 sec OFF\n  \n}`,
    programmingLanguage: 'cpp',
    hints: [
      'Write HIGH, wait 1000ms, write LOW, wait 1000ms.'
    ],
    testCases: [
      { expectedAction: 'LED_BLINK pin=13 interval=1000', description: 'LED state alternates every 1000ms' }
    ],
    solutionExplanation: 'loop() runs repeatedly; alternating digitalWrite HIGH and LOW with delay(1000) produces a 0.5 Hz blinking square wave.'
  },
  {
    id: 'ch-3-obstacle-avoidance',
    title: 'Autonomous Obstacle Avoidance Robot',
    difficulty: 'Advanced',
    category: 'Autonomous Robotics',
    xpReward: 300,
    imageUrl: '/assets/images/rover.jpg',
    problem: 'Create an autonomous robotics control loop that moves the robot chassis forward until an obstacle is detected within 20cm, at which point the robot halts, reverses for 300ms, and turns left 90 degrees.',
    objective: 'Implement continuous distance polling and conditional state transition for mobile obstacle evasion.',
    requiredComponents: ['arduino-uno', 'ultrasonic', 'l298n', 'chassis', 'servo'],
    constraints: ['Must detect obstacles within 20cm threshold', 'Must halt motors before changing direction'],
    starterCode: `// RoboLearn AI: Autonomous Obstacle Avoidance\nvoid setup() {\n  initSensors();\n}\n\nvoid loop() {\n  int dist = getDistanceCm();\n  if (dist < 20) {\n    // Obstacle detected! Stop and evade\n    robotStop();\n    delay(200);\n    robotTurnLeft();\n    delay(800);\n  } else {\n    robotForward();\n  }\n  delay(50);\n}`,
    programmingLanguage: 'cpp',
    hints: [
      'Check if (dist < 20) to trigger evasion maneuver.',
      'Stop the robot before executing turnLeft() to reduce motor strain.'
    ],
    testCases: [
      { expectedAction: 'ROBOT_MOVE direction=FORWARD', description: 'Robot drives forward in clear space' },
      { input: 'obstacle_at_15cm', expectedAction: 'ROBOT_TURN direction=LEFT angle=90', description: 'Robot avoids obstacle by turning left' }
    ],
    solutionExplanation: 'When sonar returns a distance below 20cm, robotStop() cuts motor power, followed by a differential turnLeft() to clear the obstacle path.'
  }
];

export const SEED_PROJECTS: RoboticsProject[] = [
  {
    id: 'proj-smart-led',
    title: 'Smart Ambient Lighting Controller',
    tagline: 'Create an automatic room light indicator that responds to ambient light levels.',
    difficulty: 'Beginner',
    category: 'Home Automation',
    estimatedHours: 1,
    xpReward: 200,
    imageUrl: '/assets/images/led.jpg',
    prerequisites: ['Level 1: Variables', 'Level 3: Digital I/O'],
    componentsRequired: ['arduino-uno', 'led', 'resistor'],
    circuitOverview: 'Connect LED anode to Pin 13 through a 220Ω resistor, cathode to Arduino GND rail.',
    theory: 'The Arduino reads environmental status and modulates the LED output via digital logic and PWM dimming.',
    steps: [
      { stepNumber: 1, title: 'Mount the LED & Resistor', description: 'Insert the 220Ω resistor into the breadboard in series with the LED anode.' },
      { stepNumber: 2, title: 'Wire to Arduino Uno', description: 'Connect the resistor to Pin 13 and cathode to GND.' },
      { stepNumber: 3, title: 'Upload & Test the Code', description: 'Run the smart pulsing sketch to observe the LED light up.' }
    ],
    completeCode: `const int ledPin = 13;\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(ledPin, HIGH);\n  delay(1000);\n  digitalWrite(ledPin, LOW);\n  delay(1000);\n}`,
    programmingLanguage: 'cpp',
    simulationConfig: {
      components: ['arduino-uno', 'led', 'resistor']
    }
  },
  {
    id: 'proj-obstacle-robot',
    title: 'Autonomous Obstacle Avoiding Rover',
    tagline: 'Build a self-navigating two-wheel drive robotic vehicle with ultrasonic sonar eyes.',
    difficulty: 'Advanced',
    category: 'Mobile Robotics',
    estimatedHours: 4,
    xpReward: 500,
    imageUrl: '/assets/images/rover.jpg',
    prerequisites: ['Level 3: Arduino Essentials', 'Level 4: Sensors', 'Level 9: Autonomous Robotics'],
    componentsRequired: ['arduino-uno', 'ultrasonic', 'servo', 'l298n', 'chassis'],
    circuitOverview: 'Arduino Uno drives L298N H-bridge inputs on pins 4, 5, 6, 7. HC-SR04 Trigger is on pin 9, Echo on pin 10. Servo is on pin 8.',
    theory: 'Differential drive steering allows the robot to turn on its center axis by spinning the left and right wheels in opposite directions. The ultrasonic sensor pings continuously.',
    steps: [
      { stepNumber: 1, title: 'Chassis Assembly', description: 'Mount the DC gearmotors, rubber tires, and front caster wheel onto the acrylic chassis plate.' },
      { stepNumber: 2, title: 'Wire L298N Motor Driver', description: 'Connect motor terminals to Out1/Out2 and Out3/Out4. Wire battery pack to 12V and GND. Connect common ground to Arduino.' },
      { stepNumber: 3, title: 'Mount Sonar & Servo Turret', description: 'Attach the HC-SR04 ultrasonic sensor to the micro servo horn at the front bumper.' },
      { stepNumber: 4, title: 'Deploy Autonomous Code', description: 'Upload navigation code and watch the robot explore while avoiding obstacles!' }
    ],
    completeCode: `// Autonomous Obstacle Avoiding Rover\n#include <Servo.h>\n\nServo scanServo;\nconst int trigPin = 9, echoPin = 10;\nconst int in1 = 4, in2 = 5, in3 = 6, in4 = 7;\n\nvoid setup() {\n  scanServo.attach(8);\n  scanServo.write(90); // Center sonar\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);\n  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);\n}\n\nfloat getDistance() {\n  digitalWrite(trigPin, LOW); delayMicroseconds(2);\n  digitalWrite(trigPin, HIGH); delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n  long duration = pulseIn(echoPin, HIGH);\n  return duration * 0.034 / 2;\n}\n\nvoid forward() {\n  digitalWrite(in1, HIGH); digitalWrite(in2, LOW);\n  digitalWrite(in3, HIGH); digitalWrite(in4, LOW);\n}\n\nvoid stopMotors() {\n  digitalWrite(in1, LOW); digitalWrite(in2, LOW);\n  digitalWrite(in3, LOW); digitalWrite(in4, LOW);\n}\n\nvoid turnLeft() {\n  digitalWrite(in1, LOW); digitalWrite(in2, HIGH);\n  digitalWrite(in3, HIGH); digitalWrite(in4, LOW);\n}\n\nvoid loop() {\n  float d = getDistance();\n  if (d > 0 && d < 25.0) {\n    stopMotors();\n    delay(200);\n    turnLeft();\n    delay(600);\n    stopMotors();\n    delay(200);\n  } else {\n    forward();\n  }\n  delay(60);\n}`,
    programmingLanguage: 'cpp',
    simulationConfig: {
      components: ['arduino-uno', 'ultrasonic', 'servo', 'l298n', 'chassis'],
      initialObstacleDistance: 35
    }
  }
];

export const SEED_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-program', title: 'First Circuit Alive', description: 'Wrote and ran your first embedded program.', category: 'coding', badgeIcon: 'Zap', xpValue: 50 },
  { id: 'sonar-pioneer', title: 'Sonar Pioneer', description: 'Simulated distance measurement using the HC-SR04 ultrasonic sensor.', category: 'learning', badgeIcon: 'Radio', xpValue: 100 },
  { id: 'robotics-master', title: 'Robotics Master', description: 'Built an autonomous obstacle avoiding robot in the 3D lab.', category: 'robotics', badgeIcon: 'Award', xpValue: 500 },
  { id: 'streak-7', title: 'Week of Innovation', description: 'Maintained a 7-day learning streak.', category: 'streak', badgeIcon: 'Flame', xpValue: 200 }
];
