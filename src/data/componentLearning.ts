import type { ComponentCategory, ElectronicComponent } from '../types/index';

export interface ComponentLearningGuide {
  simpleExplanation: string;
  howItWorksStepByStep: string[];
  inputsOutputs: string;
  whereUsed: string[];
  keyConcepts: string[];
  miniProject: string;
  quickQuiz: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  remember: string[];
}

const categoryDefaults: Record<ComponentCategory, { what: string; where: string[]; concepts: string[] }> = {
  microcontrollers: {
    what: 'A programmable control board that reads inputs, runs your program, and controls outputs.',
    where: ['Robot brains', 'Sensor projects', 'Automation and IoT'],
    concepts: ['GPIO', 'Digital vs analog signals', 'Control loops']
  },
  computing_boards: {
    what: 'A small computer that can run larger programs, connect cameras or sensors, and make higher-level decisions.',
    where: ['Computer vision robots', 'AI robotics', 'Robot dashboards'],
    concepts: ['CPU/GPU', 'Operating systems', 'Edge AI']
  },
  sensors: {
    what: 'A device that measures something in the real world and turns that measurement into a signal a controller can read.',
    where: ['Obstacle detection', 'Navigation', 'Environmental monitoring'],
    concepts: ['Inputs', 'Measurement', 'Calibration']
  },
  actuators: {
    what: 'A device that converts electrical control into physical movement or another physical action.',
    where: ['Robot wheels', 'Drone propulsion', 'Robot arms and grippers'],
    concepts: ['Torque', 'Speed', 'PWM/control signals']
  },
  communication: {
    what: 'A hardware interface that lets a robot send or receive data from another device.',
    where: ['Telemetry', 'Remote control', 'Robot-to-robot communication'],
    concepts: ['Packets', 'Baud rate or wireless link', 'Telemetry']
  },
  robotics: {
    what: 'A robotics-focused module that connects control electronics to motors, sensors, or robot mechanisms.',
    where: ['Mobile robots', 'Robot kits', 'Motion-control systems'],
    concepts: ['Control signals', 'Motor/sensor interfaces', 'Modular robotics']
  },
  power: {
    what: 'A power component that supplies, converts, protects, or controls electrical energy for a robot.',
    where: ['Robot power systems', 'Motor power stages', 'Battery-powered projects'],
    concepts: ['Voltage', 'Current', 'Power and efficiency']
  },
  basic_electronics: {
    what: 'A basic electronic part used to shape signals, switch loads, or build simple circuits.',
    where: ['Prototype circuits', 'Signal conditioning', 'Learning electronics fundamentals'],
    concepts: ['Voltage', 'Current', 'Circuit paths']
  },
  displays: {
    what: 'A component that turns digital data into information a person can see.',
    where: ['Robot status screens', 'Telemetry displays', 'User interfaces'],
    concepts: ['Pixels/segments', 'Interfaces', 'Refresh rate']
  },
  passive: {
    what: 'A passive component that changes how voltage or current behaves without doing computation itself.',
    where: ['Filtering', 'Protection', 'Signal and power circuits'],
    concepts: ['Resistance', 'Capacitance', 'Filtering']
  }
};

function nameHints(name: string, category: ComponentCategory) {
  const n = name.toLowerCase();
  if (n.includes('imu') || /mpu|icm|bno/.test(n)) {
    return {
      what: 'An IMU measures motion using accelerometers and gyroscopes; some IMUs also include a magnetometer and sensor-fusion processing.',
      steps: ['Motion changes the accelerometer and gyroscope readings.', 'The sensor converts those changes into digital measurements.', 'Your controller reads the measurements over an interface such as I2C or SPI.', 'Software combines the readings to estimate movement or orientation.'],
      inputs: 'Input: physical motion and rotation. Output: acceleration and angular-rate data, sometimes orientation estimates.'
    };
  }
  if (n.includes('barometric') || /bmp|bme|ms5611|lps22/.test(n)) {
    return {
      what: 'A pressure sensor measures air pressure. A robot can use pressure changes to estimate relative altitude.',
      steps: ['Air pressure acts on a tiny sensing element.', 'The sensor converts that physical change into an electrical value.', 'The sensor outputs a digital pressure reading.', 'Software can convert pressure changes into an altitude estimate.'],
      inputs: 'Input: air pressure. Output: digital pressure data and, with a model, altitude estimate.'
    };
  }
  if (n.includes('gps') || n.includes('gnss') || n.includes('neo-6m') || n.includes('m8n')) {
    return {
      what: 'A satellite-navigation receiver estimates position by processing timing signals from navigation satellites.',
      steps: ['The antenna receives satellite signals.', 'The receiver calculates timing information from multiple satellites.', 'It computes a position solution.', 'The controller reads position and navigation data, commonly over serial.'],
      inputs: 'Input: satellite radio signals. Output: position, time, and navigation data.'
    };
  }
  if (n.includes('brushless') || n.includes('bldc') || n.includes('motor')) {
    return {
      what: 'A motor converts electrical energy into rotation. In robotics, the controller decides the direction and speed while a suitable driver or ESC handles the motor current.',
      steps: ['The controller sends a command to a motor driver or ESC.', 'The driver switches electrical current through the motor phases or windings.', 'Magnetic fields create torque and rotate the motor.', 'Feedback or timing can be used to control speed and position.'],
      inputs: 'Input: electrical power plus a control signal. Output: mechanical rotation, torque, and motion.'
    };
  }
  if (n.includes('esc')) {
    return {
      what: 'An ESC is the bridge between a controller and a brushless motor: it interprets a control command and switches motor power electronically.',
      steps: ['The flight or robot controller sends a throttle command.', 'The ESC interprets that command.', 'Power transistors switch current through the motor phases.', 'The motor produces controlled rotation.'],
      inputs: 'Input: battery power and control signal. Output: switched motor phase power.'
    };
  }
  if (n.includes('ultrasonic') || n.includes('tof') || n.includes('distance')) {
    return {
      what: 'A distance sensor estimates how far away an object is so a robot can react to its surroundings.',
      steps: ['The sensor sends or emits a signal.', 'The signal interacts with a nearby object.', 'The sensor measures the returned signal or timing.', 'The result becomes a distance value for the controller.'],
      inputs: 'Input: the physical environment. Output: distance measurement.'
    };
  }
  if (n.includes('lipo') || n.includes('battery') || n.includes('18650')) {
    return {
      what: 'A rechargeable battery stores electrical energy chemically and supplies DC power to the robot electronics.',
      steps: ['Chemical energy is stored inside the cells.', 'The battery provides a voltage difference at its terminals.', 'Current flows through the robot load.', 'The robot converts that energy into computing, sensing, and movement.'],
      inputs: 'Input: stored chemical energy. Output: DC electrical power.'
    };
  }
  if (n.includes('charger') || n.includes('tp4056')) {
    return {
      what: 'A charger module manages the process of putting electrical energy back into a rechargeable cell using the required charging method.',
      steps: ['The charger receives an input supply.', 'Charging electronics regulate the charge current and voltage.', 'The battery receives controlled energy.', 'Status circuitry can indicate charging or completion.'],
      inputs: 'Input: charger supply and battery connection. Output: controlled charging current/voltage.'
    };
  }
  if (n.includes('driver') || n.includes('l298') || n.includes('tb6612') || n.includes('bts7960') || n.includes('vnh')) {
    return {
      what: 'A motor driver lets a low-power controller safely control a motor that needs more current than a microcontroller pin can provide.',
      steps: ['The microcontroller sends logic control signals.', 'The driver switches a higher-current motor supply.', 'The motor receives the required current and voltage.', 'Changing the control signals changes speed or direction.'],
      inputs: 'Input: logic control plus motor power. Output: higher-current motor drive.'
    };
  }
  if (n.includes('bluetooth') || n.includes('wifi') || n.includes('lora') || n.includes('nrf24') || n.includes('telemetry')) {
    return {
      what: 'A wireless communication module sends and receives digital data over radio so a robot can exchange commands or telemetry without a cable.',
      steps: ['The controller creates digital data.', 'The radio module encodes data into a wireless signal.', 'An antenna transmits the signal.', 'The receiver decodes the signal and delivers the data to the other controller.'],
      inputs: 'Input: digital data. Output: digital data received from a wireless link.'
    };
  }
  if (category === 'displays') {
    return {
      what: 'A display receives digital information and converts it into visible pixels, segments, or characters.',
      steps: ['The controller prepares display data.', 'Data is sent through a display interface.', 'The display driver updates its pixels or segments.', 'The user sees the requested information.'],
      inputs: 'Input: digital display commands/data. Output: visible information.'
    };
  }
  return {
    what: categoryDefaults[category].what,
    steps: ['Your controller sends or supplies the required signal or power.', 'The component responds using its internal electrical or physical behavior.', 'The component produces a useful output or changes the circuit.', 'Software uses that result to make a robot action or decision.'],
    inputs: 'Input and output depend on the exact component variant; always check the manufacturer datasheet for electrical limits.'
  };
}

export function createComponentLearningGuide(name: string, category: ComponentCategory): ComponentLearningGuide {
  const hint = nameHints(name, category);
  const defaults = categoryDefaults[category];
  const miniProject = category === 'sensors'
    ? `Make a tiny obstacle-detection experiment: read ${name}, show the measured value on Serial Monitor, and trigger a simple robot response when the value crosses a safe threshold.`
    : category === 'actuators'
      ? `Build a motion experiment with ${name}: start slowly, change one control value at a time, and observe how the robot's movement changes.`
      : category === 'microcontrollers' || category === 'computing_boards'
        ? `Build a sensor-to-decision demo: read one sensor, print the value, then make the board control one output when the value changes.`
        : `Create a small learning circuit with ${name}: identify its input, output, power requirements, and one real robotics use before connecting it.`;

  return {
    simpleExplanation: hint.what,
    howItWorksStepByStep: hint.steps,
    inputsOutputs: hint.inputs,
    whereUsed: defaults.where,
    keyConcepts: defaults.concepts,
    miniProject,
    quickQuiz: [
      {
        question: `What is the first thing you should identify before using ${name}?`,
        options: ['Its color', 'Its electrical interface and limits', 'Its price', 'Its package weight'],
        correctIndex: 1,
        explanation: 'Understanding the interface, voltage/current requirements, pinout, and limits prevents wiring mistakes.'
      },
      {
        question: `What is ${name} mainly helping a robot do?`,
        options: category === 'actuators' ? ['Move something', 'Store passwords', 'Display websites', 'Compile code'] : ['Turn a physical or electrical input into useful robot data/action', 'Replace the operating system', 'Charge every type of battery automatically', 'Remove the need for software'],
        correctIndex: 0,
        explanation: category === 'actuators' ? 'Actuators create physical action such as rotation or movement.' : 'Components become useful when their signals or power are connected to a controller and used in a system.'
      }
    ],
    remember: [
      'Know what the component senses, controls, receives, or produces.',
      'Check the exact part variant before using a pinout or voltage value.',
      'Start with a small test and observe the result before building the full robot.'
    ]
  };
}
