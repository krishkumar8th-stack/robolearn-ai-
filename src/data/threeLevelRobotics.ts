import { Course } from '../types/index.js';

type LessonSpec = {
  id: string;
  title: string;
  summary: string;
  objective: string;
  duration: number;
  theory: string[];
  code: string;
  challenge: string;
  expected: string;
  hint: string;
  components?: string[];
};

const makeLesson = (
  courseId: string,
  level: number,
  spec: LessonSpec
): Course['lessons'][number] => ({
  id: spec.id,
  courseId,
  level,
  title: spec.title,
  summary: spec.summary,
  durationMinutes: spec.duration,
  learningObjective: spec.objective,
  theory: spec.theory,
  diagramDescription: `${spec.title}: inputs → controller/logic → outputs, with the key signal flow and safety checks highlighted.`,
  codeSnippet: spec.code,
  programmingLanguage: 'cpp',
  ...(spec.components ? {
    simulationSetup: {
      components: spec.components,
      defaultCode: spec.code,
      expectedAction: spec.expected
    }
  } : {}),
  quiz: [
    {
      question: `Which statement is most important when applying ${spec.title} in a robot?`,
      options: [
        'Understand the inputs, logic, outputs and test safely',
        'Ignore component limits',
        'Change all subsystems at once',
        'Skip testing and calibration'
      ],
      correctIndex: 0,
      explanation: 'A reliable robotics workflow is understand → build → test → debug, while respecting hardware limits.'
    },
    {
      question: `What should you do after learning ${spec.title}?`,
      options: ['Apply it in a small practical task', 'Only memorize the theory', 'Skip the practical test', 'Remove safety checks'],
      correctIndex: 0,
      explanation: 'A small practical test connects the concept to real robot behavior.'
    }
  ],
  challenge: {
    title: `${spec.title} — Practical Challenge`,
    prompt: spec.challenge,
    starterCode: spec.code,
    expectedResult: spec.expected,
    hint: spec.hint
  }
});

const B = 'robotics-beginner';
const I = 'robotics-intermediate';
const A = 'robotics-advanced';

export const THREE_LEVEL_ROBOTICS: Course[] = [
  {
    id: B, level: 1, title: 'BEGINNER', iconName: 'Cpu',
    tagline: 'Build your robotics foundation.',
    description: 'Electronics, Arduino, C/C++, sensors and basic robot motion.',
    lessons: [
      makeLesson(B, 1, {
        id: 'b1-fundamentals', title: 'Robotics Fundamentals',
        summary: 'Learn what a robot is and how sensors, controller, actuators and power work together.',
        objective: 'Identify the main robot subsystems and trace a Sense → Decide → Act loop.',
        duration: 15,
        theory: [
          'A robot combines sensing, computation, actuation and power to perform a task.',
          'Sensors convert physical conditions such as distance or light into electrical data.',
          'A controller runs logic and sends control signals to actuators such as motors and servos.',
          'Good designs define limits, test one subsystem at a time and keep a safe stop behavior.'
        ],
        code: `int distanceCm = 30;
bool obstacle = distanceCm < 20;

void setup() {
  Serial.begin(9600);
}

void loop() {
  if (obstacle) Serial.println("STOP");
  else Serial.println("FORWARD");
  delay(500);
}`,
        challenge: 'Draw a block diagram for an obstacle-avoiding rover and explain what information flows from the sensor to the motors.',
        expected: 'A correct sensor → controller → motor-driver → motor block diagram.',
        hint: 'Start with sensor input, then decision logic, then actuator output.',
        components: ['arduino-uno', 'ultrasonic', 'l298n']
      }),
      makeLesson(B, 1, {
        id: 'b2-circuits', title: 'Electronics & Circuits',
        summary: 'Understand voltage, current, resistance, Ohm’s law, breadboards and safe power wiring.',
        objective: 'Calculate simple circuit values and wire a low-voltage LED circuit correctly.',
        duration: 25,
        theory: [
          'Voltage is electrical potential difference; current is charge flow; resistance limits current.',
          'Ohm’s law is V = I × R and electrical power is P = V × I.',
          'An LED normally needs a current-limiting resistor; never connect it directly to a supply.',
          'A shared ground gives connected modules a common voltage reference.'
        ],
        code: `float supply = 5.0;
float ledDrop = 2.0;
float current = 0.015;
float resistor = (supply - ledDrop) / current;

void setup() {
  Serial.begin(9600);
  Serial.println(resistor);
}
void loop() {}`,
        challenge: 'Choose a resistor for a 2V LED on a 5V supply at about 15mA and describe the breadboard connections.',
        expected: 'A calculated resistor near 200Ω and a series LED-resistor circuit with common ground.',
        hint: 'Use R = (Vsupply − VLED) / I.',
        components: ['arduino-uno', 'led', 'resistor', 'breadboard']
      }),
      makeLesson(B, 1, {
        id: 'b3-arduino', title: 'Arduino Fundamentals',
        summary: 'Use the Arduino workflow: pins, setup(), loop(), digital I/O, analog input and PWM.',
        objective: 'Write a basic Arduino program and explain how GPIO reads and writes signals.',
        duration: 25,
        theory: [
          'setup() runs once for initialization; loop() repeats continuously.',
          'pinMode() configures a pin, digitalRead() reads a digital state and digitalWrite() controls an output.',
          'analogRead() measures an analog input while analogWrite() on PWM-capable pins controls duty cycle.',
          'Serial output is useful for observing values during development.'
        ],
        code: `const int led = 13;
const int sensor = A0;

void setup() {
  pinMode(led, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int value = analogRead(sensor);
  digitalWrite(led, value > 500 ? HIGH : LOW);
  Serial.println(value);
  delay(100);
}`,
        challenge: 'Modify the program so an LED turns on when the analog sensor reading crosses a chosen threshold.',
        expected: 'The LED responds consistently to the sensor threshold.',
        hint: 'Read A0, compare the value with a threshold, then use digitalWrite().',
        components: ['arduino-uno', 'led', 'resistor']
      }),
      makeLesson(B, 1, {
        id: 'b4-cpp', title: 'C/C++ Programming Logic',
        summary: 'Build reusable robot logic with variables, conditions, loops, functions and arrays.',
        objective: 'Create small functions that make robotics code easier to read, test and reuse.',
        duration: 35,
        theory: [
          'Variables store sensor readings, states and configuration values.',
          'if/else and comparison operators turn measurements into decisions.',
          'Loops repeat actions; functions package behavior into reusable units.',
          'Arrays are useful for storing repeated sensor samples or calibration values.'
        ],
        code: `int threshold = 20;

void moveForward() {
  Serial.println("FORWARD");
}

void stopRobot() {
  Serial.println("STOP");
}

void loop() {
  int distance = 18;
  if (distance < threshold) stopRobot();
  else moveForward();
}`,
        challenge: 'Create moveForward(), stopRobot(), and decideMotion(distance) functions for a simple rover.',
        expected: 'Reusable functions with a clear distance-based decision.',
        hint: 'Keep the decision in one function and let movement functions handle outputs.'
      }),
      makeLesson(B, 1, {
        id: 'b5-sensors', title: 'Basic Sensors',
        summary: 'Read ultrasonic, IR, LDR and temperature sensors and turn measurements into useful decisions.',
        objective: 'Explain sensor inputs and convert a reading into a reliable robot decision.',
        duration: 30,
        theory: [
          'Sensors have measurement ranges, accuracy limits and electrical interface requirements.',
          'Ultrasonic sensors estimate distance from echo time; IR sensors detect reflected light; LDRs vary resistance with light.',
          'Raw readings can be noisy, so thresholds and simple averaging can improve decisions.',
          'Always verify voltage compatibility before connecting a sensor to a controller.'
        ],
        code: `const int trigPin = 9;
const int echoPin = 10;

long readDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  return pulseIn(echoPin, HIGH) * 0.034 / 2;
}`,
        challenge: 'Read an HC-SR04 distance and turn an alert LED on below 20cm.',
        expected: 'A distance-based alert that responds correctly to the threshold.',
        hint: 'Trigger the sensor, measure echo time, convert to centimeters, then compare.',
        components: ['arduino-uno', 'ultrasonic', 'led', 'resistor']
      }),
      makeLesson(B, 1, {
        id: 'b6-motors', title: 'Motors & Basic Movement',
        summary: 'Learn DC motor drivers, PWM speed control, direction and servo positioning.',
        objective: 'Explain why a motor driver is needed and implement forward, reverse and stop behavior.',
        duration: 30,
        theory: [
          'GPIO pins provide control signals; motors require more current and should use a suitable driver.',
          'An H-bridge changes motor polarity to reverse direction.',
          'PWM changes average motor power and practical speed.',
          'Servos use a target position and need an appropriate power source and common ground.'
        ],
        code: `const int in1 = 4, in2 = 5, en = 6;

void forward(int speed) {
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  analogWrite(en, speed);
}

void stopMotor() {
  digitalWrite(in1, LOW);
  digitalWrite(in2, LOW);
  analogWrite(en, 0);
}`,
        challenge: 'Write reusable functions for forward, reverse and stop, with a speed parameter from 0–255.',
        expected: 'Motor direction and PWM speed can be controlled without powering the motor from a GPIO pin.',
        hint: 'Use an H-bridge direction pair plus a PWM enable pin.',
        components: ['arduino-uno', 'l298n', 'chassis']
      }),
      makeLesson(B, 1, {
        id: 'b7-obstacle', title: 'Beginner Robot Project',
        summary: 'Combine Arduino, ultrasonic sensing and motor control into an obstacle-avoiding rover.',
        objective: 'Build a complete Sense → Decide → Act loop for a safe beginner rover.',
        duration: 45,
        theory: [
          'The robot repeatedly measures its environment and chooses a motion state.',
          'When an obstacle is close, stopping before changing direction reduces mechanical stress.',
          'A simple threshold controller is easy to understand and debug before adding advanced navigation.',
          'Test at low speed and verify the emergency stop behavior before full movement.'
        ],
        code: `int distanceCm = 35;

void loop() {
  if (distanceCm < 20) {
    robotStop();
    delay(200);
    robotTurnLeft();
    delay(600);
  } else {
    robotForward();
  }
}`,
        challenge: 'Build a simulated rover that moves forward, stops below 20cm, turns, and resumes motion.',
        expected: 'The rover moves forward in clear space and changes direction when an obstacle is near.',
        hint: 'Implement sensor reading first, then stop, turn and forward behaviors.',
        components: ['arduino-uno', 'ultrasonic', 'l298n', 'chassis', 'servo']
      })
    ]
  },
  {
    id: I, level: 2, title: 'INTERMEDIATE', iconName: 'Cog',
    tagline: 'Build responsive and connected robots.',
    description: 'Sensor fusion, motion control, communication, PID and embedded systems.',
    lessons: [
      makeLesson(I, 2, {
        id: 'i1-advanced-code', title: 'Advanced Arduino Programming',
        summary: 'Replace blocking delays with modular, non-blocking and debuggable embedded code.',
        objective: 'Schedule multiple robot tasks with millis() while keeping the main loop responsive.',
        duration: 35,
        theory: [
          'delay() blocks the loop and can prevent timely sensor or safety responses.',
          'millis() lets tasks run when their interval expires without stopping other work.',
          'Functions and small modules make robot behavior easier to test.',
          'Serial logs should be useful and rate-limited rather than flooding the controller.'
        ],
        code: `unsigned long lastRead = 0;

void loop() {
  if (millis() - lastRead >= 100) {
    lastRead = millis();
    readSensor();
  }
  updateMotors();
}`,
        challenge: 'Read a sensor every 100ms and update an LED every 500ms without using delay().',
        expected: 'Both tasks run on schedule while the main loop remains responsive.',
        hint: 'Give each task its own last-run timestamp.'
      }),
      makeLesson(I, 2, {
        id: 'i2-sensor-fusion', title: 'Sensor Fusion & Perception',
        summary: 'Combine multiple sensor readings and reject unreliable measurements.',
        objective: 'Use simple averaging and confidence checks to make more stable navigation decisions.',
        duration: 40,
        theory: [
          'Different sensors fail in different ways, so combining independent evidence can improve robustness.',
          'A moving average reduces short-term measurement noise.',
          'Sensor values should be checked for invalid or out-of-range readings.',
          'Fusion logic should have a safe fallback when sensors disagree or fail.'
        ],
        code: `float fusedDistance(float ultrasonic, float ir) {
  if (ultrasonic <= 0) return ir;
  if (ir <= 0) return ultrasonic;
  return (ultrasonic + ir) / 2.0;
}`,
        challenge: 'Combine two distance readings and fall back to the valid sensor if one reading is invalid.',
        expected: 'A fused value with sensible invalid-reading handling.',
        hint: 'Validate each input before averaging it.'
      }),
      makeLesson(I, 2, {
        id: 'i3-motion', title: 'Motors & Motion Control',
        summary: 'Calibrate two-wheel differential drive and control speed, direction and turns.',
        objective: 'Translate desired rover motion into left and right motor commands.',
        duration: 40,
        theory: [
          'Differential drive turns by changing the relative speeds of left and right wheels.',
          'Unequal motors can make a robot drift even when commanded equally.',
          'Calibration offsets can compensate for repeatable motor differences.',
          'Acceleration limits reduce wheel slip and mechanical shock.'
        ],
        code: `int base = 170;
int correction = 12;

void driveStraight() {
  leftMotor(base - correction);
  rightMotor(base);
}

void pivotLeft() {
  leftMotor(-150);
  rightMotor(150);
}`,
        challenge: 'Create forward, reverse, pivot-left, pivot-right and stop functions with calibrated speed values.',
        expected: 'Predictable basic rover movement using independent left/right motor control.',
        hint: 'Treat each wheel as an independently controlled actuator.'
      }),
      makeLesson(I, 2, {
        id: 'i4-line-following', title: 'Line Following',
        summary: 'Turn sensor error into steering commands for a two-wheel line-following robot.',
        objective: 'Calculate line position error and convert it into differential motor speed.',
        duration: 45,
        theory: [
          'A line follower estimates where the line is relative to the robot center.',
          'Error = desired position − measured position.',
          'The steering correction can be added to one motor and subtracted from the other.',
          'Filtering and speed limits help prevent oscillation and loss of the line.'
        ],
        code: `int error = targetX - lineCenterX;
int correction = constrain(error * 2, -80, 80);

leftSpeed = 160 - correction;
rightSpeed = 160 + correction;`,
        challenge: 'Given a detected line center, calculate motor corrections that steer the robot back toward the target.',
        expected: 'Steering direction changes correctly when the line is left or right of center.',
        hint: 'Positive and negative error should produce opposite wheel corrections.'
      }),
      makeLesson(I, 2, {
        id: 'i5-communication', title: 'Bluetooth & Wi-Fi',
        summary: 'Design a small wireless command protocol for robot control and telemetry.',
        objective: 'Validate wireless commands and ensure communication failures leave the robot safe.',
        duration: 40,
        theory: [
          'A command protocol should be compact, predictable and easy to validate.',
          'Commands such as F, B, L, R and S can represent basic motion.',
          'Invalid commands should not trigger unpredictable actuator behavior.',
          'A communication timeout can be used as a safety condition that stops the robot.'
        ],
        code: `void handleCommand(char command) {
  if (command == 'F') forward();
  else if (command == 'B') backward();
  else if (command == 'L') left();
  else if (command == 'R') right();
  else if (command == 'S') stopMotors();
  else stopMotors();
}`,
        challenge: 'Create a safe command handler for F/B/L/R/S and stop the robot when no valid command arrives in time.',
        expected: 'Valid commands produce the intended motion and invalid/expired commands stop the robot.',
        hint: 'Make STOP the default fallback.'
      }),
      makeLesson(I, 2, {
        id: 'i6-pid', title: 'PID Control',
        summary: 'Understand proportional, integral and derivative feedback for smoother control.',
        objective: 'Calculate a PID correction from target, measured value and elapsed time.',
        duration: 50,
        theory: [
          'PID uses current error, accumulated error and rate of error change.',
          'Kp reacts to present error, Ki removes persistent bias and Kd reacts to changing error.',
          'Integral wind-up can make a controller overshoot, so limits are useful.',
          'Tuning should be gradual and measured rather than changing all gains randomly.'
        ],
        code: `float error = target - measured;
integral += error * dt;
float derivative = (error - previousError) / dt;
float output = kp * error + ki * integral + kd * derivative;
previousError = error;`,
        challenge: 'Build a simple PID calculation that keeps a line position or motor speed near a target.',
        expected: 'A bounded feedback correction that responds to present, accumulated and changing error.',
        hint: 'Start with Kp, then add small Ki and Kd terms.'
      }),
      makeLesson(I, 2, {
        id: 'i7-embedded', title: 'Embedded Systems Project',
        summary: 'Integrate sensors, timing, motion control and wireless telemetry into one rover system.',
        objective: 'Design an embedded control loop with clear states, timing and safety fallbacks.',
        duration: 60,
        theory: [
          'Integrated robots need explicit interfaces between sensing, decision, control and communication.',
          'A state machine keeps behavior predictable as features grow.',
          'Safety checks should run independently of optional telemetry or user-interface code.',
          'Integration should proceed from bench tests to low-speed motion and then full autonomous tests.'
        ],
        code: `enum State { DRIVE, AVOID, STOPPED };
State state = DRIVE;

void loop() {
  updateSensors();
  updateState();
  updateMotors();
  sendTelemetry();
  safetyCheck();
}`,
        challenge: 'Design a connected autonomous rover with DRIVE, AVOID and STOPPED states and periodic telemetry.',
        expected: 'A structured embedded architecture with safe state transitions.',
        hint: 'Separate sensing, state update, motor control and telemetry.'
      })
    ]
  },
  {
    id: A, level: 3, title: 'ADVANCED', iconName: 'Trophy',
    tagline: 'Engineer autonomous intelligent robots.',
    description: 'Embedded systems, computer vision, AI, navigation, ROS concepts and capstone engineering.',
    lessons: [
      makeLesson(A, 3, {
        id: 'a1-embedded', title: 'Advanced Embedded Systems',
        summary: 'Use interrupts, state machines, timing and robust interfaces for responsive robot software.',
        objective: 'Design a responsive control architecture that separates time-critical events from normal tasks.',
        duration: 50,
        theory: [
          'Interrupts can react quickly to external events but should perform minimal work.',
          'State machines make autonomous behavior explicit and testable.',
          'Timers and non-blocking scheduling keep sensing, control and communication responsive.',
          'Interfaces should define units, ranges, update rates and failure behavior.'
        ],
        code: `volatile bool eventFlag = false;

void sensorInterrupt() {
  eventFlag = true;
}

void loop() {
  if (eventFlag) {
    eventFlag = false;
    handleSensorEvent();
  }
  runControlLoop();
}`,
        challenge: 'Design a state machine with IDLE, DRIVE, AVOID and FAULT states and define every transition.',
        expected: 'Explicit states, triggers and safe behavior for faults.',
        hint: 'Write the transition conditions before writing actuator code.'
      }),
      makeLesson(A, 3, {
        id: 'a2-computer-vision', title: 'Computer Vision',
        summary: 'Understand pixels, camera frames, regions of interest and visual measurements for robots.',
        objective: 'Extract a simple visual feature and turn its position into a control error.',
        duration: 50,
        theory: [
          'A camera frame is a grid of pixels; resolution affects detail and processing cost.',
          'A region of interest can reduce computation by focusing on useful image areas.',
          'Lighting, camera placement and exposure can strongly affect visual measurements.',
          'Vision output should include confidence or validity checks before controlling motion.'
        ],
        code: `// Pseudocode
frame = camera.read();
roi = crop(frame, centerRegion);
lineCenterX = detectLine(roi);
error = targetX - lineCenterX;`,
        challenge: 'Define a region of interest for a line or colored object and calculate its horizontal position.',
        expected: 'A visual feature position and a usable control error.',
        hint: 'Keep the camera coordinate system consistent with robot left/right.'
      }),
      makeLesson(A, 3, {
        id: 'a3-object-detection', title: 'Object Detection & Robot AI',
        summary: 'Use object labels and confidence values as inputs to safe robot decisions.',
        objective: 'Design a confidence-aware AI perception rule with a deterministic safety fallback.',
        duration: 55,
        theory: [
          'Object detectors return labels, bounding boxes and confidence scores.',
          'A confidence threshold reduces reactions to uncertain detections.',
          'AI perception should not bypass deterministic speed and safety limits.',
          'If the model fails or becomes uncertain, the robot should use a defined safe behavior.'
        ],
        code: `if (label == "person" && confidence > 0.75) {
  stopRobot();
} else if (confidence < 0.40) {
  slowDown();
}`,
        challenge: 'Create a rule that stops the robot for a high-confidence person detection and slows down for uncertain perception.',
        expected: 'Confidence-aware decisions with a safe fallback.',
        hint: 'Treat low confidence as uncertainty, not as permission to continue at full speed.'
      }),
      makeLesson(A, 3, {
        id: 'a4-navigation', title: 'Navigation & Path Planning',
        summary: 'Understand localization, mapping and path planning for autonomous mobile robots.',
        objective: 'Compare a planned route with obstacles and select a safe next waypoint.',
        duration: 60,
        theory: [
          'Localization estimates where the robot is; mapping represents the environment.',
          'A planner searches for a route from a start position to a goal.',
          'Grid or graph representations allow algorithms to reason about free and occupied space.',
          'A real robot needs obstacle inflation, localization uncertainty and a recovery behavior.'
        ],
        code: `struct Node { int x; int y; };

Node nextWaypoint(Node current, Node goal) {
  // Choose a collision-free neighbor closer to goal.
  return goal;
}`,
        challenge: 'Plan a route through a small grid while treating obstacle cells as blocked and keeping a safety margin.',
        expected: 'A collision-free sequence of waypoints from start to goal.',
        hint: 'Mark blocked cells first, then search only through free neighbors.'
      }),
      makeLesson(A, 3, {
        id: 'a5-ros', title: 'ROS & Robot Architecture',
        summary: 'Learn the concepts of nodes, topics, messages and modular robot software.',
        objective: 'Design a ROS-style architecture that separates sensors, planning and control.',
        duration: 45,
        theory: [
          'A node is a software component responsible for a focused task.',
          'Topics provide asynchronous communication between publishers and subscribers.',
          'Messages define structured data exchanged between components.',
          'Modular architecture makes individual robot subsystems easier to replace and test.'
        ],
        code: `// ROS-style pseudocode
sensor_node.publish("/scan", scanData);
planner_node.subscribe("/scan");
planner_node.publish("/cmd_vel", velocity);
controller_node.subscribe("/cmd_vel");`,
        challenge: 'Draw a ROS-style graph for a rover containing sensor, localization, planner and motor-control nodes.',
        expected: 'A modular node/topic architecture with clear data flow.',
        hint: 'One responsibility per node is a useful starting point.'
      }),
      makeLesson(A, 3, {
        id: 'a6-autonomy', title: 'Autonomous Robotics',
        summary: 'Close the sense-decide-act loop using perception, planning, control and safety.',
        objective: 'Combine multiple subsystems into a robust autonomous behavior with recovery states.',
        duration: 65,
        theory: [
          'Autonomy is a feedback loop: sense the environment, decide what to do, act, then verify.',
          'Planning can choose a behavior while the controller handles the immediate actuator commands.',
          'Recovery states are needed when perception, localization or motion becomes unreliable.',
          'Safety constraints should cap speed, enforce stopping distances and provide a manual stop path.'
        ],
        code: `void autonomousLoop() {
  perception.update();
  planner.update(perception);
  controller.follow(planner.command);
  telemetry.publish();
  safety.check();
}`,
        challenge: 'Design an autonomous rover loop that detects an obstacle, replans, changes direction and returns to its route.',
        expected: 'A complete feedback architecture with sensing, planning, control and safety.',
        hint: 'Define what happens when each subsystem reports invalid data.'
      }),
      makeLesson(A, 3, {
        id: 'a7-capstone', title: 'Advanced Robotics Capstone',
        summary: 'Engineer and document a complete autonomous robot from requirements through testing.',
        objective: 'Create a system plan, integration checklist, test metrics and final autonomous mission.',
        duration: 90,
        theory: [
          'Engineering starts with measurable requirements and constraints, not with components chosen at random.',
          'Power, compute, sensors, actuators and communication must be designed as one system.',
          'Testing should progress from unit tests to subsystem tests, integration tests and realistic missions.',
          'Documentation should include wiring, software architecture, calibration values, test results, limitations and future improvements.'
        ],
        code: `void loop() {
  sense();
  plan();
  control();
  telemetry();
  safetyCheck();
}`,
        challenge: 'Design a complete autonomous rover mission: define requirements, architecture, hardware, software states, tests and success metrics.',
        expected: 'A documented autonomous robotics project with measurable acceptance criteria.',
        hint: 'Define success numerically where possible: stopping distance, route completion, response time or detection confidence.'
      })
    ]
  }
];

export const ROBOTICS_LEVEL_RULES = {
  BEGINNER: { xp: 0, pass: 70, modules: 7 },
  INTERMEDIATE: { xp: 3000, pass: 70, modules: 7 },
  ADVANCED: { xp: 8000, pass: 75, modules: 7 }
} as const;

export const ROBOTICS_XP = {
  lesson: 50, module: 100, quiz: 50, challenge: 100, miniProject: 200, finalTest: 300,
  firstAttempt: 25, perfectQuiz: 50, sevenDayStreak: 100, thirtyDayStreak: 500
} as const;
