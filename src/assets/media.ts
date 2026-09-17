// Media asset references for high-fidelity robotics hardware photos
import heroRobotLabImg from './images/hero_robot_lab_1789419858544.jpg';
import autonomousRoverImg from './images/autonomous_rover_3d_1789419871575.jpg';
import breadboardCircuitImg from './images/breadboard_circuit_1789419886536.jpg';
import microcontrollerBoardImg from './images/microcontroller_board_1789419899142.jpg';
import sonarRadarDisplayImg from './images/sonar_radar_display_1789419917773.jpg';
import esp32ModuleImg from './images/esp32_module_1789420155841.jpg';
import servoMotorImg from './images/servo_motor_1789420168564.jpg';
import l298nDriverImg from './images/l298n_driver_1789420179742.jpg';
import ledCircuitImg from './images/led_circuit_1789420192295.jpg';

export const MEDIA = {
  hero: heroRobotLabImg,
  labEnvironment: heroRobotLabImg,
  rover: autonomousRoverImg,
  roboticsRover: autonomousRoverImg,
  breadboard: breadboardCircuitImg,
  arduinoUno: microcontrollerBoardImg,
  sonarRadar: sonarRadarDisplayImg,
  esp32: esp32ModuleImg,
  servo: servoMotorImg,
  l298n: l298nDriverImg,
  ledCircuit: ledCircuitImg,
  
  // High-fidelity verified photographic assets for each component
  components: {
    'arduino-uno': microcontrollerBoardImg,
    'esp32': esp32ModuleImg,
    'esp32-devkit': esp32ModuleImg,
    'ultrasonic': sonarRadarDisplayImg,
    'hc-sr04': sonarRadarDisplayImg,
    'servo': servoMotorImg,
    'sg90-servo': servoMotorImg,
    'l298n': l298nDriverImg,
    'l298n-driver': l298nDriverImg,
    'breadboard': breadboardCircuitImg,
    'breadboard-mb102': breadboardCircuitImg,
    'led': ledCircuitImg,
    'led-5mm-red': ledCircuitImg,
    'resistor': ledCircuitImg,
    'resistor-220': ledCircuitImg,
    'oled-display': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    'mpu6050-imu': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    'pir-sensor': 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    'tt-dc-motor': autonomousRoverImg
  } as Record<string, string>,

  // Project photos
  projects: {
    'proj-smart-night-light': ledCircuitImg,
    'proj-smart-led': ledCircuitImg,
    'proj-obstacle-avoiding-rover': autonomousRoverImg,
    'proj-rover': autonomousRoverImg,
    'proj-ultrasonic-radar': sonarRadarDisplayImg,
    'proj-radar': sonarRadarDisplayImg,
    'proj-plant-monitor': esp32ModuleImg
  } as Record<string, string>,

  // Challenge photos
  challenges: {
    'chal-blink-sos': ledCircuitImg,
    'chal-reverse-sonar': sonarRadarDisplayImg,
    'chal-servo-sweep': servoMotorImg,
    'chal-esp32-wifi': esp32ModuleImg,
    'chal-motor-h-bridge': l298nDriverImg
  } as Record<string, string>,

  // Course level visual banners
  courses: {
    1: breadboardCircuitImg,
    2: ledCircuitImg,
    3: microcontrollerBoardImg,
    4: sonarRadarDisplayImg,
    5: servoMotorImg,
    6: autonomousRoverImg,
    'level-1-programming': breadboardCircuitImg,
    'level-2-circuits': ledCircuitImg,
    'level-3-arduino': microcontrollerBoardImg,
    'level-4-sensors': sonarRadarDisplayImg,
    'level-5-motors': servoMotorImg,
    'level-6-autonomous': autonomousRoverImg
  } as Record<string | number, string>
};

