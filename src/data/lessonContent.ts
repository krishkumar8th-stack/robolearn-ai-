export type LessonLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface LessonModelData {
  modelName: string;
  format: 'glTF' | 'GLB';
  thumbnail: string;
  annotations: Array<{ id: string; label: string; description: string }>;
}

export interface RoboticsLesson {
  lessonId: string;
  title: string;
  level: LessonLevel;
  module: string;
  estimatedMinutes: number;
  prerequisiteLesson: string | null;
  content: {
    intro: string;
    steps: string[];
    realWorldExample: string;
    commonMistakes: string[];
    troubleshooting: string[];
  };
  codeSnippet: string | null;
  model: LessonModelData;
  quizId: string;
  xpReward: number;
}

/**
 * Production lesson template + starter curriculum.
 * 3D web recommendation: GLB is the preferred delivery format because it is
 * a single binary asset with compact loading and broad WebGL/WebGPU ecosystem
 * support; glTF is the editable/structured interchange format.
 */
export const ROBOTICS_LESSONS: RoboticsLesson[] = [
  {
    lessonId: 'b1-arduino-introduction',
    title: 'Introduction to Arduino Uno',
    level: 'BEGINNER',
    module: 'Robotics Fundamentals',
    estimatedMinutes: 25,
    prerequisiteLesson: null,
    content: {
      intro: 'Arduino Uno is a beginner-friendly microcontroller board used to read sensors and control outputs such as LEDs, buzzers and motors. It is an excellent first controller because the pins, USB connection and programming workflow are easy to understand.',
      steps: [
        'Identify the main board areas: ATmega328P microcontroller, USB port, DC barrel jack, digital pins 0–13, analog inputs A0–A5, power pins, reset button and onboard LED on pin 13.',
        'Connect the Uno to a computer using a USB cable. The USB connection provides power and also creates a serial programming connection.',
        'Install/open Arduino IDE, select Arduino Uno as the board and select the correct USB port.',
        'Understand the two required Arduino functions: setup() runs once after reset, while loop() runs repeatedly.',
        'Set a GPIO pin as OUTPUT with pinMode(), then use digitalWrite() to set it HIGH or LOW.',
        'Upload the sketch and observe the onboard LED. If upload succeeds, you have completed the basic software-to-hardware loop.',
        'Before connecting external hardware, check its voltage/current requirements and connect a common GND when two modules communicate.'
      ],
      realWorldExample: 'A small rover can use an Arduino as its controller: ultrasonic sensors provide distance data, the Arduino makes a simple decision, and a motor driver receives control signals.',
      commonMistakes: [
        'Selecting the wrong board or serial port in Arduino IDE.',
        'Confusing digital pins with analog inputs.',
        'Trying to power a motor directly from an Arduino GPIO pin.',
        'Forgetting that pin 13 has an onboard LED and resistor, so external LED experiments should normally use a separate resistor.'
      ],
      troubleshooting: [
        'If upload fails, check USB cable, board selection and port selection.',
        'If the LED does not blink, verify pin 13 is configured as OUTPUT and the sketch actually uploaded.',
        'If an external circuit behaves strangely, verify GND and supply voltage before changing code.'
      ]
    },
    codeSnippet: `const int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(500);\n  digitalWrite(LED_PIN, LOW);\n  delay(500);\n}`,
    model: {
      modelName: 'Arduino Uno R3',
      format: 'GLB',
      thumbnail: 'Clean studio render of an Arduino Uno R3 on a neutral background, top-down three-quarter view, pins and USB port clearly visible.',
      annotations: [
        { id: 'mcu', label: 'ATmega328P', description: 'Main microcontroller that executes the uploaded program.' },
        { id: 'digital', label: 'Digital pins 0–13', description: 'Digital input/output pins; PWM is available on selected pins.' },
        { id: 'analog', label: 'Analog inputs A0–A5', description: 'Inputs commonly used to measure analog sensor voltages.' },
        { id: 'usb', label: 'USB port', description: 'Programming, serial communication and USB power connection.' },
        { id: 'power', label: 'Power section', description: 'VIN, 5V, 3.3V and GND connections.' },
        { id: 'reset', label: 'Reset button', description: 'Restarts the microcontroller program.' }
      ]
    },
    quizId: 'quiz-b1-arduino-introduction',
    xpReward: 50
  },
  {
    lessonId: 'b2-led-breadboard',
    title: 'LEDs, Resistors & Breadboard Basics',
    level: 'BEGINNER',
    module: 'Electronics & Circuits',
    estimatedMinutes: 30,
    prerequisiteLesson: 'b1-arduino-introduction',
    content: {
      intro: 'An LED is a simple output component, while a resistor limits current. A breadboard lets you prototype a circuit without soldering, making it ideal for first robotics experiments.',
      steps: ['Learn LED polarity: anode is positive and cathode is negative.', 'Use a series resistor to limit LED current.', 'Understand connected breadboard rows and power rails.', 'Connect Arduino GND to the ground rail and the GPIO output through a resistor to the LED.', 'Upload a blink sketch and change the timing.'],
      realWorldExample: 'Status LEDs on robots indicate power, sensor state, communication state or an emergency condition.',
      commonMistakes: ['Reversing LED polarity.', 'Skipping the current-limiting resistor.', 'Assuming every breadboard rail is continuous end-to-end.'],
      troubleshooting: ['Check LED orientation and resistor placement.', 'Use a multimeter to verify 5V/GND and continuity.', 'Move the LED to a known-good breadboard row if needed.']
    },
    codeSnippet: `const int LED = 8;\nvoid setup(){ pinMode(LED, OUTPUT); }\nvoid loop(){\n  digitalWrite(LED, HIGH); delay(300);\n  digitalWrite(LED, LOW); delay(300);\n}`,
    model: { modelName: 'Arduino Uno + Mini Breadboard LED Circuit', format: 'GLB', thumbnail: 'Three-quarter view of Arduino Uno connected to a small solderless breadboard with red LED and resistor.', annotations: [{ id: 'led-anode', label: 'LED anode', description: 'Positive LED terminal.' }, { id: 'led-cathode', label: 'LED cathode', description: 'Negative LED terminal.' }, { id: 'resistor', label: 'Current-limiting resistor', description: 'Limits LED current.' }, { id: 'rails', label: 'Power rails', description: 'Common supply and ground rails.' }] },
    quizId: 'quiz-b2-led-breadboard',
    xpReward: 50
  },
  {
    lessonId: 'b3-ultrasonic-sensor',
    title: 'Ultrasonic Distance Sensor',
    level: 'BEGINNER',
    module: 'Basic Sensors',
    estimatedMinutes: 30,
    prerequisiteLesson: 'b2-led-breadboard',
    content: {
      intro: 'The HC-SR04 estimates distance by sending an ultrasonic pulse and measuring its echo time. This teaches the fundamental robotics loop: sense the environment, calculate a value, then make a decision.',
      steps: ['Connect VCC to 5V and GND to GND.', 'Connect TRIG and ECHO to two digital pins.', 'Send a short trigger pulse.', 'Measure echo duration with pulseIn().', 'Convert time to distance using the speed-of-sound relationship.', 'Add a timeout so a missing echo does not block the robot indefinitely.'],
      realWorldExample: 'Obstacle-avoiding rovers use distance sensors to detect walls and objects before commanding a turn.',
      commonMistakes: ['Using the wrong pin mapping.', 'Forgetting common ground.', 'Treating a timeout as a valid zero-distance reading.'],
      troubleshooting: ['Check the sensor supply and wiring.', 'Keep the sensor facing a reasonably large target during testing.', 'Print raw echo duration over Serial to diagnose unexpected readings.']
    },
    codeSnippet: `const int TRIG=9, ECHO=10;\nvoid setup(){ Serial.begin(9600); pinMode(TRIG,OUTPUT); pinMode(ECHO,INPUT); }\nvoid loop(){\n  digitalWrite(TRIG,LOW); delayMicroseconds(2);\n  digitalWrite(TRIG,HIGH); delayMicroseconds(10); digitalWrite(TRIG,LOW);\n  unsigned long us=pulseIn(ECHO,HIGH,30000);\n  if(us==0){ Serial.println("No echo"); }\n  else { Serial.print(us/58.0); Serial.println(" cm"); }\n  delay(100);\n}`,
    model: { modelName: 'HC-SR04 Ultrasonic Sensor', format: 'GLB', thumbnail: 'Detailed front three-quarter render of HC-SR04 with two ultrasonic transducers and four-pin header.', annotations: [{ id: 'trig', label: 'TRIG', description: 'Trigger input.' }, { id: 'echo', label: 'ECHO', description: 'Echo pulse output.' }, { id: 'vcc', label: 'VCC', description: 'Positive supply.' }, { id: 'gnd', label: 'GND', description: 'Ground connection.' }, { id: 'transducers', label: 'Ultrasonic transducers', description: 'Transmit and receive the ultrasonic pulse.' }] },
    quizId: 'quiz-b3-ultrasonic',
    xpReward: 50
  },
  {
    lessonId: 'i1-dc-motor-driver',
    title: 'DC Motors & H-Bridge Motor Drivers',
    level: 'INTERMEDIATE',
    module: 'Motors & Motion Control',
    estimatedMinutes: 40,
    prerequisiteLesson: 'b3-ultrasonic-sensor',
    content: {
      intro: 'Motors need much more current than a microcontroller GPIO should supply. An H-bridge motor driver provides the power switching stage that lets a controller command direction and speed safely.',
      steps: ['Separate logic/control wiring from the motor power path.', 'Connect the motor to the driver output terminals.', 'Use two direction inputs to select polarity and direction.', 'Use PWM on an enable/input pin to control average motor power.', 'Test at low speed before increasing PWM.', 'Add a stop state for communication loss or invalid sensor conditions.'],
      realWorldExample: 'Two independently controlled DC motors form the drive system of a differential-drive rover.',
      commonMistakes: ['Powering the motor directly from GPIO.', 'Forgetting common ground between controller and driver.', 'Using an unsuitable motor supply or driver current rating.'],
      troubleshooting: ['If the motor only hums, check supply current capability and driver wiring.', 'If direction is reversed, swap motor leads or invert the direction logic.', 'If control is unstable, test the driver with the motor disconnected and inspect the power path.']
    },
    codeSnippet: `const int IN1=4, IN2=5, EN=6;\nvoid setup(){ pinMode(IN1,OUTPUT); pinMode(IN2,OUTPUT); pinMode(EN,OUTPUT); }\nvoid loop(){\n  digitalWrite(IN1,HIGH); digitalWrite(IN2,LOW); analogWrite(EN,160);\n  delay(1500);\n  analogWrite(EN,0); delay(500);\n  digitalWrite(IN1,LOW); digitalWrite(IN2,HIGH); analogWrite(EN,160);\n  delay(1500);\n  analogWrite(EN,0); delay(1000);\n}`,
      model: { modelName: 'TB6612FNG Dual Motor Driver', format: 'GLB', thumbnail: 'Detailed PCB render showing motor driver IC, A01/A02/B01/B02 outputs and logic/power headers.', annotations: [{ id: 'aout', label: 'Motor A outputs', description: 'Connect to motor A terminals.' }, { id: 'bout', label: 'Motor B outputs', description: 'Connect to motor B terminals.' }, { id: 'vm', label: 'Motor supply', description: 'Higher-current motor power input.' }, { id: 'vcc', label: 'Logic supply', description: 'Controller-side logic supply.' }, { id: 'gnd', label: 'GND', description: 'Shared electrical reference.' }] },
      quizId: 'quiz-i1-motor-driver',
      xpReward: 75
    }
  },
  {
    lessonId: 'i2-i2c-communication',
    title: 'I2C Communication Between Robot Modules',
    level: 'INTERMEDIATE',
    module: 'Communication Protocols',
    estimatedMinutes: 35,
    prerequisiteLesson: 'i1-dc-motor-driver',
    content: {
      intro: 'I2C lets a controller communicate with multiple peripherals over two signal lines: SDA and SCL. It is widely used for IMUs, displays, environmental sensors and other robot modules.',
      steps: ['Connect SDA to SDA and SCL to SCL.', 'Connect the modules to a common ground and appropriate supply.', 'Understand that each peripheral has an address.', 'Use an I2C scanner to discover responding addresses.', 'Read sensor registers according to the device datasheet.', 'Keep bus wiring short and account for pull-up resistors.'],
      realWorldExample: 'A robot can use an IMU and a display on the same I2C bus while the main controller handles motion control.',
      commonMistakes: ['Using the wrong SDA/SCL pins for the board.', 'Two devices using the same address without address configuration.', 'Ignoring voltage-level compatibility.'],
      troubleshooting: ['Run an I2C scanner first.', 'Check SDA/SCL continuity and common ground.', 'Disconnect modules one at a time to find a bus fault.']
    },
    codeSnippet: `#include <Wire.h>\nvoid setup(){\n  Serial.begin(115200);\n  Wire.begin();\n}\nvoid loop(){\n  for(byte address=1; address<127; address++){\n    Wire.beginTransmission(address);\n    if(Wire.endTransmission()==0){ Serial.println(address, HEX); }\n  }\n  delay(3000);\n}`,
    model: { modelName: 'I2C Sensor Module + Arduino Uno', format: 'GLB', thumbnail: 'Exploded three-quarter view showing Arduino Uno connected to a compact I2C sensor board, with SDA/SCL highlighted.', annotations: [{ id: 'sda', label: 'SDA', description: 'I2C data line.' }, { id: 'scl', label: 'SCL', description: 'I2C clock line.' }, { id: 'addr', label: 'Address', description: 'Logical device address used on the bus.' }, { id: 'gnd', label: 'GND', description: 'Shared reference.' }] },
    quizId: 'quiz-i2-i2c',
    xpReward: 75
  },
  {
    lessonId: 'a1-autonomous-control-loop',
    title: 'Autonomous Robot Sense–Plan–Act Loop',
    level: 'ADVANCED',
    module: 'Robotics Automation',
    estimatedMinutes: 50,
    prerequisiteLesson: 'i2-i2c-communication',
    content: {
      intro: 'Autonomous robotics combines perception, decision-making and control into a feedback loop. A robust robot repeatedly senses its state, plans an action, applies control and checks safety constraints.',
      steps: ['Define the robot state: pose, velocity, battery and sensor confidence.', 'Collect and timestamp sensor observations.', 'Filter or validate noisy measurements.', 'Choose a target behavior or waypoint.', 'Compute a control command using the current error.', 'Apply actuator limits and safety checks before moving.', 'Log telemetry so failures can be reproduced and diagnosed.', 'Repeat the loop at a predictable rate.'],
      realWorldExample: 'An autonomous rover can detect an obstacle with lidar/camera data, update its local map, choose a safe direction and command wheel velocities while monitoring battery and emergency-stop state.',
      commonMistakes: ['Letting AI output directly command unlimited motor power.', 'Ignoring stale sensor timestamps.', 'Blocking the control loop with long operations.', 'Having no deterministic fallback when perception fails.'],
      troubleshooting: ['Log sensor timestamps and loop frequency.', 'Run perception and control independently before integrating them.', 'Clamp actuator commands and test the safety state first.', 'Replay recorded sensor data to debug planning without risking hardware.']
    },
    codeSnippet: `struct RobotState { float distanceCm; bool emergencyStop; };\n\nvoid controlStep(const RobotState& s){\n  if(s.emergencyStop || s.distanceCm < 25.0){\n    stopMotors();\n    return;\n  }\n  forward(140);\n}\n\nvoid loop(){\n  RobotState state = readState();\n  controlStep(state);\n  delay(20); // prototype only; production systems should use non-blocking timing\n}`,
    model: { modelName: 'Autonomous Rover System Architecture', format: 'GLB', thumbnail: 'High-detail autonomous rover in a clean lab scene with camera, distance sensor, IMU, motor wheels and compute board visible.', annotations: [{ id: 'perception', label: 'Perception', description: 'Camera, range and inertial sensors provide observations.' }, { id: 'compute', label: 'Compute', description: 'Runs state estimation, planning and control.' }, { id: 'actuation', label: 'Actuation', description: 'Motor drivers and motors execute control commands.' }, { id: 'safety', label: 'Safety layer', description: 'Emergency stop, limits and fallback behavior.' }, { id: 'telemetry', label: 'Telemetry', description: 'Logs system state for monitoring and debugging.' }] },
      quizId: 'quiz-a1-autonomy-loop',
      xpReward: 100
    }
  },
  {
    lessonId: 'a2-drone-flight-controller-basics',
    title: 'Drone Flight Controller Fundamentals',
    level: 'ADVANCED',
    module: 'Drones & Autonomous Systems',
    estimatedMinutes: 55,
    prerequisiteLesson: 'a1-autonomous-control-loop',
    content: {
      intro: 'A flight controller continuously estimates a drone’s attitude and applies corrections to motor outputs. This lesson focuses on the software and control concepts rather than flight operation.',
      steps: ['Identify the flight-controller inputs: IMU and other supported sensors.', 'Understand roll, pitch and yaw as attitude axes.', 'Estimate attitude from inertial measurements using an appropriate estimator.', 'Compare desired attitude with measured attitude to obtain control error.', 'Use a PID-style controller to generate correction commands.', 'Mix control commands into individual motor outputs according to the frame geometry.', 'Enforce arming, failsafe and output limits before enabling actuation.', 'Validate the control stack in simulation before real hardware testing.'],
      realWorldExample: 'Quadrotor autopilots use IMU data and control loops to maintain a commanded attitude despite disturbances.',
      commonMistakes: ['Testing an unverified controller on a live aircraft.', 'Ignoring sensor calibration and coordinate-frame conventions.', 'Applying unrestricted output commands.', 'Confusing simulation success with flight readiness.'],
      troubleshooting: ['Validate axis signs and units in simulation.', 'Plot desired vs measured attitude.', 'Tune one control loop at a time.', 'Use a hardware-in-the-loop or simulator workflow before propeller-on testing.']
    },
    codeSnippet: `float kp=1.2, ki=0.05, kd=0.02;\nfloat integral=0, previousError=0;\nfloat pid(float target, float measured, float dt){\n  float error=target-measured;\n  integral += error*dt;\n  float derivative=(error-previousError)/dt;\n  previousError=error;\n  return kp*error + ki*integral + kd*derivative;\n}`,
    model: { modelName: 'Quadrotor Flight Controller Assembly', format: 'GLB', thumbnail: 'Technical three-quarter render of a quadrotor with flight controller, IMU, four motors and propellers, shown safely on a workbench.', annotations: [{ id: 'fc', label: 'Flight controller', description: 'Runs estimation, control and safety logic.' }, { id: 'imu', label: 'IMU', description: 'Measures angular rate and acceleration.' }, { id: 'motors', label: 'Motors', description: 'Actuators that generate thrust.' }, { id: 'power', label: 'Power system', description: 'Battery and regulation/ESC path.' }, { id: 'frame', label: 'Frame', description: 'Mechanical structure and coordinate reference.' }] },
    quizId: 'quiz-a2-drone-controller',
    xpReward: 100
  }
];

export const MODEL_SOURCE_GUIDE = [
  { name: 'Sketchfab', use: 'Search for robotics components and verify the individual model license before bundling it.' },
  { name: 'GrabCAD Community', use: 'Useful for engineering CAD models; check download and redistribution terms.' },
  { name: 'Thingiverse', use: 'Good for maker-oriented printable parts; verify each creator license.' },
  { name: 'NASA 3D Resources', use: 'Useful for aerospace/space hardware references; verify the asset-specific usage terms.' },
  { name: 'Official manufacturer CAD libraries', use: 'Prefer these when available for exact component geometry and pin/connector accuracy.' }
];

export const LESSON_JSON_SCHEMA_EXAMPLE = ROBOTICS_LESSONS[0];
