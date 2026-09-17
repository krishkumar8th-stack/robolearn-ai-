import { Course } from '../types/index.js';

const q = (topic: string, level: Course['level']) => [
  { question: `What is the primary purpose of ${topic}?`, options: ['Connect sensing, computation and action in a robot', 'Format a web page', 'Compress a video', 'Edit an image'], correctIndex: 0, explanation: `${topic} is a robotics concept used to connect hardware and software.` },
  { question: `Which approach is most important when working with ${topic}?`, options: ['Test safely and verify assumptions', 'Ignore component limits', 'Skip testing', 'Change everything at once'], correctIndex: 0, explanation: 'Robotics systems should be tested incrementally and within safe operating limits.' },
  { question: `Which skill is strengthened by ${topic}?`, options: ['Engineering problem solving', 'Photo retouching', 'Web typography', 'Video editing'], correctIndex: 0, explanation: 'Robotics learning combines hardware, software and systematic problem solving.' },
  { question: `What should a learner do after studying ${topic}?`, options: ['Apply it in a small practical task', 'Memorize without testing', 'Skip the next activity', 'Remove safety checks'], correctIndex: 0, explanation: 'Practical application reinforces robotics concepts.' },
  { question: `A reliable robotics workflow for ${topic} is:`, options: ['Understand → build → test → debug', 'Guess → deploy → ignore errors', 'Copy → skip testing → deploy', 'Build everything before testing'], correctIndex: 0, explanation: 'An iterative build-test-debug workflow is appropriate for robotics.' }
];

const lesson = (courseId: string, level: number, id: string, title: string, objective: string, summary: string, code = '// Build and test this concept step by step.') => ({
  id, courseId, level, title, summary, durationMinutes: 25, learningObjective: objective,
  theory: [summary, 'Study the hardware/software relationship and identify the inputs, outputs and safety constraints.', 'Apply the concept in a small robotics task before moving forward.'],
  diagramDescription: `${title} robotics block diagram showing inputs, controller, outputs and feedback.`, codeSnippet: code, programmingLanguage: 'cpp',
  quiz: q(title, level),
  challenge: { title: `${title} Challenge`, prompt: `Apply ${title} to a small robotics build or simulation. Explain your design choices and verify the expected result.`, starterCode: code, expectedResult: 'A tested robotics implementation with safe behavior.', hint: 'Break the problem into inputs, logic, outputs and tests.' }
});

export const THREE_LEVEL_ROBOTICS: Course[] = [
  { id: 'robotics-beginner', level: 1, title: 'BEGINNER', tagline: 'Build your robotics foundation.', description: 'Electronics, Arduino, C/C++, sensors and basic robot motion.', iconName: 'Cpu', lessons: [
    lesson('robotics-beginner', 1, 'b1-fundamentals', 'Robotics Fundamentals', 'Understand robots, sensors, actuators and controllers.', 'Identify the main parts of a robot and how they work together.'),
    lesson('robotics-beginner', 1, 'b2-circuits', 'Electronics & Circuits', 'Understand voltage, current, resistance, power and breadboards.', 'Use Ohm’s law, LEDs, resistors, common ground and safe low-voltage wiring.'),
    lesson('robotics-beginner', 1, 'b3-arduino', 'Arduino Fundamentals', 'Use GPIO, analog input, PWM and the Arduino workflow.', 'Write and upload basic Arduino programs and interact with hardware.'),
    lesson('robotics-beginner', 1, 'b4-cpp', 'C/C++ Programming Logic', 'Use variables, conditions, loops, functions and arrays.', 'Build reusable program logic for robotics control.'),
    lesson('robotics-beginner', 1, 'b5-sensors', 'Basic Sensors', 'Read ultrasonic, IR, LDR and temperature sensors.', 'Convert sensor readings into useful robot decisions.'),
    lesson('robotics-beginner', 1, 'b6-motors', 'Motors & Basic Movement', 'Control DC motors, servos, PWM and motor drivers.', 'Build forward, reverse, turn and stop behaviors.'),
    lesson('robotics-beginner', 1, 'b7-obstacle', 'Beginner Robot Project', 'Combine Arduino, sensors and motors.', 'Build an obstacle-avoiding rover as the beginner capstone.')
  ]},
  { id: 'robotics-intermediate', level: 2, title: 'INTERMEDIATE', tagline: 'Build responsive and connected robots.', description: 'Sensor fusion, motion control, communication, PID and embedded systems.', iconName: 'Cog', lessons: [
    lesson('robotics-intermediate', 2, 'i1-advanced-code', 'Advanced Arduino Programming', 'Write modular, non-blocking robotics software.', 'Use millis(), reusable functions, debugging and clean program structure.'),
    lesson('robotics-intermediate', 2, 'i2-sensor-fusion', 'Sensor Fusion & Perception', 'Combine readings from multiple sensors.', 'Filter noisy readings and make more reliable decisions.'),
    lesson('robotics-intermediate', 2, 'i3-motion', 'Motors & Motion Control', 'Control speed, direction and differential drive.', 'Calibrate two-wheel drive and implement accurate motion.'),
    lesson('robotics-intermediate', 2, 'i4-line-following', 'Line Following', 'Turn sensor error into steering commands.', 'Build a line-following robot and tune its control behavior.'),
    lesson('robotics-intermediate', 2, 'i5-communication', 'Bluetooth & Wi-Fi', 'Send commands and telemetry between robot and client.', 'Build a safe wireless command protocol.'),
    lesson('robotics-intermediate', 2, 'i6-pid', 'PID Control', 'Understand feedback, error, proportional, integral and derivative terms.', 'Tune a PID controller for line or motor control.'),
    lesson('robotics-intermediate', 2, 'i7-embedded', 'Embedded Systems Project', 'Integrate sensors, timing, control and communication.', 'Build a connected autonomous rover with telemetry.')
  ]},
  { id: 'robotics-advanced', level: 3, title: 'ADVANCED', tagline: 'Engineer autonomous intelligent robots.', description: 'Embedded systems, computer vision, AI, navigation, ROS concepts and capstone engineering.', iconName: 'Trophy', lessons: [
    lesson('robotics-advanced', 3, 'a1-embedded', 'Advanced Embedded Systems', 'Design responsive real-time embedded software.', 'Use interrupts, state machines, timing and robust subsystem interfaces.'),
    lesson('robotics-advanced', 3, 'a2-computer-vision', 'Computer Vision', 'Interpret camera frames for robotics.', 'Work with pixels, regions of interest and visual features.'),
    lesson('robotics-advanced', 3, 'a3-object-detection', 'Object Detection & Robot AI', 'Use AI perception results safely.', 'Turn detected objects and confidence values into robot decisions.'),
    lesson('robotics-advanced', 3, 'a4-navigation', 'Navigation & Path Planning', 'Understand localization, mapping and path planning.', 'Plan safe routes for an autonomous mobile robot.'),
    lesson('robotics-advanced', 3, 'a5-ros', 'ROS & Robot Architecture', 'Understand nodes, topics, messages and modular robot software.', 'Design a ROS-style architecture for sensors, planning and control.'),
    lesson('robotics-advanced', 3, 'a6-autonomy', 'Autonomous Robotics', 'Close the sense-decide-act feedback loop.', 'Combine perception, planning, control and safety.'),
    lesson('robotics-advanced', 3, 'a7-capstone', 'Advanced Robotics Capstone', 'Engineer and document a complete autonomous robot.', 'Deliver a tested autonomous robotics project with telemetry, safety and documentation.')
  ]}
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
