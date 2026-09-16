// Shared TypeScript Interfaces for RoboLearn AI

export type UserRole = 'user' | 'admin';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  experienceLevel: ExperienceLevel;
  preferredLanguage: string;
  preferredProgrammingLanguage: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  completedChallenges: string[];
  completedProjects: string[];
  learnedComponents: string[];
  achievements: string[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type ComponentCategory =
  | 'basic_electronics'
  | 'microcontrollers'
  | 'computing_boards'
  | 'sensors'
  | 'actuators'
  | 'communication'
  | 'robotics'
  | 'displays'
  | 'power'
  | 'passive';

export interface PinDefinition {
  pinNumber: number | string;
  name: string;
  type: 'Power' | 'Ground' | 'Digital I/O' | 'Analog Input' | 'PWM' | 'Communication' | 'Control';
  description: string;
  voltage?: string;
}

export interface ComponentSpecification {
  key: string;
  value: string;
}

export interface ElectronicComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tagline: string;
  description: string;
  imageUrl?: string;
  modelType: 'arduino_uno' | 'esp32' | 'ultrasonic' | 'servo' | 'dc_motor' | 'led' | 'resistor' | 'buzzer' | 'ir_sensor' | 'motor_driver' | 'breadboard' | 'chassis' | 'generic';
  whatIsIt: string;
  whyUsed: string;
  howItWorks: string;
  internalWorking: string;
  specifications: ComponentSpecification[];
  pins: PinDefinition[];
  wiringGuide: {
    targetBoard: string;
    connections: { pinOnComponent: string; pinOnBoard: string; wireColor: string; notes: string }[];
  };
  codeExamples: {
    language: string;
    title: string;
    code: string;
    explanation: string;
  }[];
  commonMistakes: string[];
  safetyRules: string[];
  realWorldApplications: string[];
  relatedComponentIds: string[];
  quizQuestionIds?: string[];
}

export interface CourseLesson {
  id: string;
  courseId: string;
  level: number;
  title: string;
  summary: string;
  durationMinutes: number;
  learningObjective: string;
  theory: string[];
  imageUrl?: string;
  diagramDescription: string;
  codeSnippet: string;
  programmingLanguage: string;
  simulationSetup?: {
    components: string[];
    defaultCode: string;
    expectedAction: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  challenge: {
    title: string;
    prompt: string;
    starterCode: string;
    expectedResult: string;
    hint: string;
  };
}

export interface Course {
  id: string;
  level: number;
  title: string;
  tagline: string;
  description: string;
  imageUrl?: string;
  iconName: string;
  lessons: CourseLesson[];
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  imageUrl?: string;
  xpReward: number;
  problem: string;
  objective: string;
  requiredComponents: string[];
  constraints: string[];
  starterCode: string;
  programmingLanguage: string;
  hints: string[];
  testCases: { input?: string; expectedAction: string; description: string }[];
  solutionExplanation: string;
}

export interface ProjectStep {
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string;
  codeSnippet?: string;
  circuitNote?: string;
}

export interface RoboticsProject {
  id: string;
  title: string;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  imageUrl?: string;
  estimatedHours: number;
  xpReward: number;
  prerequisites: string[];
  componentsRequired: string[];
  circuitOverview: string;
  theory: string;
  steps: ProjectStep[];
  completeCode: string;
  programmingLanguage: string;
  simulationConfig: {
    components: string[];
    initialObstacleDistance?: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'coding' | 'robotics' | 'streak';
  badgeIcon: string;
  xpValue: number;
  unlockedAt?: string;
}

export type SimulationActionType =
  | 'LED_SET'
  | 'LED_BLINK'
  | 'SERVO_SET'
  | 'SERVO_SWEEP'
  | 'MOTOR_SPEED'
  | 'ROBOT_MOVE'
  | 'ROBOT_TURN'
  | 'ROBOT_STOP'
  | 'BUZZER_TONE'
  | 'ULTRASONIC_PING'
  | 'OBSTACLE_DETECT';

export interface SimulationAction {
  type: SimulationActionType;
  componentId?: string;
  pin?: number | string;
  state?: 'ON' | 'OFF' | boolean;
  angle?: number;
  speed?: number;
  direction?: 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT';
  duration?: number;
  frequency?: number;
  distance?: number;
  delayMs?: number;
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  speedMultiplier: number;
  leds: Record<string, { on: boolean; brightness: number }>;
  servos: Record<string, { angle: number }>;
  motors: Record<string, { speed: number; direction: 'FORWARD' | 'BACKWARD' | 'STOP' }>;
  robot: { x: number; z: number; rotationY: number; speed: number; status: 'IDLE' | 'MOVING' | 'TURNING' | 'STOPPED_OBSTACLE' };
  obstacle: { x: number; z: number; distanceToRobot: number };
  serialLogs: { timestamp: number; text: string; type: 'info' | 'output' | 'error' }[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  codeSnippet?: string;
  language?: string;
  components?: string[];
  simulationActions?: SimulationAction[];
  timestamp: string;
}

export interface AICodeGenerationResult {
  language: string;
  code: string;
  requiredComponents: string[];
  wiring: { from: string; to: string; note: string }[];
  explanation: string;
  functionsUsed: { name: string; purpose: string }[];
  possibleErrors: string[];
  simulationSupported: boolean;
  simulationActions?: SimulationAction[];
  challenge?: { title: string; prompt: string };
}

export interface AIDebugResult {
  problem: string;
  cause: string;
  solution: string;
  correctedCode: string;
  explanation: string;
  confidence: 'High' | 'Medium' | 'Low';
  preventionTips: string[];
}
