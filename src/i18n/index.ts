// Internationalization (i18n) system for RoboLearn AI
// Supports 30 languages with clean fallback to English

export type SupportedLanguage =
  | 'en'
  | 'hi'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'it'
  | 'ru'
  | 'ar'
  | 'zh-CN'
  | 'zh-TW'
  | 'ja'
  | 'ko'
  | 'bn'
  | 'ur'
  | 'mr'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'gu'
  | 'pa'
  | 'or'
  | 'th'
  | 'vi'
  | 'tr'
  | 'nl'
  | 'pl'
  | 'id';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' }
];

export const translations: Record<string, Record<string, string>> = {
  en: {
    'brand.name': 'RoboLearn AI',
    'brand.tagline': 'Learn. Code. Simulate. Build.',
    'nav.dashboard': 'Dashboard',
    'nav.learn': 'Learn Robotics',
    'nav.components': 'Component Library',
    'nav.programming': 'Programming',
    'nav.aiTutor': 'AI Tutor',
    'nav.aiCode': 'AI Code Generator',
    'nav.lab3d': '3D Virtual Lab',
    'nav.challenges': 'Challenges',
    'nav.projects': 'Projects',
    'nav.achievements': 'Achievements',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.login': 'Sign In',
    'nav.register': 'Get Started',
    'nav.logout': 'Sign Out',
    'hero.title': 'Learn Robotics. Code Anything. See It Come Alive.',
    'hero.subtitle': 'An AI-powered interactive platform for learning programming, electronics, and robotics through coding and 3D simulation.',
    'hero.startLearning': 'START LEARNING',
    'hero.explore3D': 'EXPLORE 3D LAB',
    'dashboard.welcome': 'Welcome back',
    'dashboard.level': 'Level',
    'dashboard.xp': 'Total XP',
    'dashboard.streak': 'Day Streak',
    'dashboard.quickActions': 'Quick Actions',
    'actions.runSimulation': 'Run Simulation',
    'actions.stop': 'Stop',
    'actions.reset': 'Reset',
    'actions.explainCode': 'Explain with AI',
    'actions.debugCode': 'Debug with AI',
    'actions.getHint': 'Get Hint',
    'actions.generate': 'Generate Code',
    'components.search': 'Search components, sensors, microcontrollers...',
    'components.allCategories': 'All Categories',
    'components.specs': 'Specifications',
    'components.pinout': 'Pinout Diagram',
    'components.wiring': 'Wiring Guide',
    'components.codeExamples': 'Code Examples',
    'components.commonMistakes': 'Common Mistakes',
    'components.safety': 'Safety Guidelines',
    'components.markLearned': 'Mark as Learned',
    'components.learned': 'Learned',
    'ai.askPrompt': 'Ask the AI tutor anything about electronics or robotics...',
    'ai.generatePrompt': 'e.g., Make an Arduino robot detect an obstacle and turn left'
  },
  hi: {
    'brand.name': 'RoboLearn AI',
    'brand.tagline': 'सीखें. कोड करें. सिमुलेट करें. बनाएं.',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.learn': 'रोबोटिक्स सीखें',
    'nav.components': 'कंपोनेंट लाइब्रेरी',
    'nav.programming': 'प्रोग्रामिंग',
    'nav.aiTutor': 'एआई ट्यूटर',
    'nav.aiCode': 'एआई कोड जनरेटर',
    'nav.lab3d': '3D वर्चुअल लैब',
    'nav.challenges': 'चुनौतियाँ',
    'nav.projects': 'प्रोजेक्ट्स',
    'nav.achievements': 'उपलब्धियां',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.login': 'लॉग इन करें',
    'nav.register': 'शुरू करें',
    'nav.logout': 'लॉग आउट',
    'hero.title': 'रोबोटिक्स सीखें. कुछ भी कोड करें. इसे जीवंत देखें.',
    'hero.subtitle': 'कोडिंग और 3D सिमुलेशन के माध्यम से प्रोग्रामिंग, इलेक्ट्रॉनिक्स और रोबोटिक्स सीखने के लिए एक एआई-संचालित इंटरैक्टिव प्लेटफॉर्म।',
    'hero.startLearning': 'सीखना शुरू करें',
    'hero.explore3D': '3D लैब देखें',
    'dashboard.welcome': 'वापसी पर स्वागत है',
    'dashboard.level': 'स्तर',
    'dashboard.xp': 'कुल एक्सपी',
    'dashboard.streak': 'दिन की लकीर',
    'dashboard.quickActions': 'त्वरित क्रियाएं',
    'actions.runSimulation': 'सिमुलेशन चलाएं',
    'actions.stop': 'रोकें',
    'actions.reset': 'रीसेट करें',
    'actions.explainCode': 'एआई से समझें',
    'actions.debugCode': 'एआई से डीबग करें',
    'actions.getHint': 'संकेत प्राप्त करें',
    'actions.generate': 'कोड बनाएं',
    'components.search': 'कंपोनेंट्स, सेंसर, माइक्रोकंट्रोलर खोजें...',
    'components.allCategories': 'सभी श्रेणियां',
    'components.specs': 'तकनीकी विवरण',
    'components.pinout': 'पिनआउट आरेख',
    'components.wiring': 'वायरिंग गाइड',
    'components.codeExamples': 'कोड उदाहरण',
    'components.commonMistakes': 'सामान्य गलतियाँ',
    'components.safety': 'सुरक्षा दिशानिर्देश',
    'components.markLearned': 'सीखा हुआ चिह्नित करें',
    'components.learned': 'सीख लिया',
    'ai.askPrompt': 'इलेक्ट्रॉनिक्स या रोबोटिक्स के बारे में एआई ट्यूटर से कुछ भी पूछें...',
    'ai.generatePrompt': 'उदा., एक Arduino रोबोट बनाएं जो बाधा का पता लगाए और बाएं मुड़े'
  },
  es: {
    'brand.name': 'RoboLearn AI',
    'brand.tagline': 'Aprende. Programa. Simula. Construye.',
    'nav.dashboard': 'Panel',
    'nav.learn': 'Aprender Robótica',
    'nav.components': 'Componentes',
    'nav.programming': 'Programación',
    'nav.aiTutor': 'Tutor IA',
    'nav.aiCode': 'Generador de Código IA',
    'nav.lab3d': 'Laboratorio 3D',
    'nav.challenges': 'Desafíos',
    'nav.projects': 'Proyectos',
    'nav.achievements': 'Logros',
    'nav.profile': 'Perfil',
    'nav.settings': 'Ajustes',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    'hero.title': 'Aprende Robótica. Programa Todo. Míralo Cobrar Vida.',
    'hero.subtitle': 'Plataforma interactiva con IA para aprender programación, electrónica y robótica mediante código y simulación 3D.',
    'hero.startLearning': 'EMPEZAR A APRENDER',
    'hero.explore3D': 'EXPLORAR LAB 3D',
    'dashboard.welcome': 'Bienvenido de nuevo',
    'dashboard.level': 'Nivel',
    'dashboard.xp': 'XP Total',
    'dashboard.streak': 'Racha de días',
    'dashboard.quickActions': 'Acciones Rápidas',
    'actions.runSimulation': 'Ejecutar Simulación',
    'actions.stop': 'Detener',
    'actions.reset': 'Reiniciar',
    'actions.explainCode': 'Explicar con IA',
    'actions.debugCode': 'Depurar con IA',
    'actions.getHint': 'Obtener Pista',
    'actions.generate': 'Generar Código',
    'components.search': 'Buscar componentes, sensores...',
    'components.allCategories': 'Todas las Categorías',
    'components.specs': 'Especificaciones',
    'components.pinout': 'Diagrama de Pines',
    'components.wiring': 'Guía de Cableado',
    'components.codeExamples': 'Ejemplos de Código',
    'components.commonMistakes': 'Errores Comunes',
    'components.safety': 'Seguridad',
    'components.markLearned': 'Marcar como Aprendido',
    'components.learned': 'Aprendido',
    'ai.askPrompt': 'Pregunta al tutor de IA sobre electrónica o robótica...',
    'ai.generatePrompt': 'ej., Haz que un robot Arduino detecte un obstáculo y gire a la izquierda'
  },
  fr: {
    'brand.name': 'RoboLearn AI',
    'brand.tagline': 'Apprendre. Coder. Simuler. Construire.',
    'nav.dashboard': 'Tableau de bord',
    'nav.learn': 'Robotique',
    'nav.components': 'Composants',
    'nav.programming': 'Programmation',
    'nav.aiTutor': 'Tuteur IA',
    'nav.aiCode': 'Générateur de Code IA',
    'nav.lab3d': 'Labo Virtuel 3D',
    'nav.challenges': 'Défis',
    'nav.projects': 'Projets',
    'nav.achievements': 'Succès',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.login': 'Connexion',
    'nav.register': 'Commencer',
    'nav.logout': 'Déconnexion',
    'hero.title': 'Apprenez la robotique. Codez tout. Voyez-le prendre vie.',
    'hero.subtitle': 'Plateforme interactive propulsée par IA pour apprendre la programmation, l’électronique et la robotique.',
    'hero.startLearning': 'COMMENCER',
    'hero.explore3D': 'EXPLORER LE LABO 3D',
    'dashboard.welcome': 'Bon retour',
    'dashboard.level': 'Niveau',
    'dashboard.xp': 'XP Totale',
    'dashboard.streak': 'Série de jours',
    'dashboard.quickActions': 'Actions Rapides',
    'actions.runSimulation': 'Lancer la Simulation',
    'actions.stop': 'Arrêter',
    'actions.reset': 'Réinitialiser',
    'actions.explainCode': 'Expliquer avec l’IA',
    'actions.debugCode': 'Déboguer avec l’IA',
    'actions.getHint': 'Indice',
    'actions.generate': 'Générer du code',
    'components.search': 'Rechercher des composants...',
    'components.allCategories': 'Toutes les catégories',
    'components.specs': 'Spécifications',
    'components.pinout': 'Brochage',
    'components.wiring': 'Câblage',
    'components.codeExamples': 'Exemples de code',
    'components.commonMistakes': 'Erreurs courantes',
    'components.safety': 'Sécurité',
    'components.markLearned': 'Marquer comme appris',
    'components.learned': 'Appris'
  },
  de: {
    'brand.name': 'RoboLearn AI',
    'brand.tagline': 'Lernen. Coden. Simulieren. Bauen.',
    'nav.dashboard': 'Dashboard',
    'nav.learn': 'Robotik Lernen',
    'nav.components': 'Bauteile',
    'nav.programming': 'Programmierung',
    'nav.aiTutor': 'KI-Tutor',
    'nav.aiCode': 'KI-Codegenerator',
    'nav.lab3d': '3D-Virtuallabor',
    'nav.challenges': 'Herausforderungen',
    'nav.projects': 'Projekte',
    'nav.achievements': 'Erfolge',
    'nav.profile': 'Profil',
    'nav.settings': 'Einstellungen',
    'nav.login': 'Anmelden',
    'nav.register': 'Registrieren',
    'nav.logout': 'Abmelden',
    'hero.title': 'Robotik lernen. Alles coden. Zum Leben erwecken.',
    'hero.subtitle': 'Eine KI-gestützte interaktive Plattform zum Erlernen von Programmierung, Elektronik und Robotik.',
    'hero.startLearning': 'JETZT LERNEN',
    'hero.explore3D': '3D-LABOR ÖFFNEN'
  },
  ja: {
    'brand.name': 'RoboLearn AI',
    'brand.tagline': '学ぶ。コードを書く。シミュレーションする。創る。',
    'nav.dashboard': 'ダッシュボード',
    'nav.learn': 'ロボット工学',
    'nav.components': '電子部品ライブラリ',
    'nav.programming': 'プログラミング',
    'nav.aiTutor': 'AIチューター',
    'nav.aiCode': 'AIコード生成',
    'nav.lab3d': '3D仮想実験室',
    'nav.challenges': 'コーディング課題',
    'nav.projects': 'プロジェクト',
    'nav.achievements': 'アチーブメント',
    'nav.profile': 'プロフィール',
    'nav.settings': '設定',
    'nav.login': 'ログイン',
    'nav.register': '登録する',
    'nav.logout': 'ログアウト',
    'hero.title': 'ロボティクスを学ぶ。コードを書く。命を吹き込む。',
    'hero.subtitle': '3DシミュレーションとAIによってプログラミングと電子工作を体感できる学習プラットフォーム。',
    'hero.startLearning': '学習を開始する',
    'hero.explore3D': '3Dラボを体験'
  },
  'zh-CN': {
    'brand.name': 'RoboLearn AI',
    'brand.tagline': '学习。编程。仿真。构建。',
    'nav.dashboard': '仪表板',
    'nav.learn': '学习机器人',
    'nav.components': '元件库',
    'nav.programming': '编程教学',
    'nav.aiTutor': 'AI导师',
    'nav.aiCode': 'AI代码生成器',
    'nav.lab3d': '3D虚拟实验室',
    'nav.challenges': '编程挑战',
    'nav.projects': '实战项目',
    'nav.achievements': '荣誉成就',
    'nav.profile': '个人主页',
    'nav.settings': '偏好设置',
    'nav.login': '登录',
    'nav.register': '即刻加入',
    'nav.logout': '退出登录',
    'hero.title': '学习机器人。编写万物代码。见证灵动运转。',
    'hero.subtitle': '专为学习编程、电子电路与机器人学而打造的AI驱动3D仿真互动教学平台。',
    'hero.startLearning': '开始学习',
    'hero.explore3D': '探索3D实验室'
  }
};

export function getTranslation(key: string, lang: SupportedLanguage): string {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  if (translations['en'] && translations['en'][key]) {
    return translations['en'][key];
  }
  return key;
}
