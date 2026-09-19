import React, { useEffect, useRef, useState } from 'react';
import { ImageOff, Loader2, ExternalLink } from 'lucide-react';
import { MEDIA } from '../assets/media';

type ImageState = {
  url: string | null;
  sourceUrl?: string;
  source: 'verified' | 'robu' | 'openverse' | 'wikimedia' | 'none';
};

const memoryCache = new Map<string, ImageState>();

// Robu product pages are used as authoritative references. Exact product image
// URLs are intentionally not guessed: if an exact licensed/local asset is not
// available, the component falls back to the existing verified/open-license
// image pipeline rather than showing a potentially wrong product photo.
const ROBU_SOURCE_LABEL = 'Robu reference';

const LOCAL_NAME_ALIASES: Record<string, string> = {
  'Arduino Uno R3/R4': 'arduino-uno',
  'ESP32 WROOM': 'esp32',
  'ESP32 NodeMCU': 'esp32',
  'ESP32 DevKit V1': 'esp32',
  'HC-SR04 Ultrasonic Sensor': 'hc-sr04',
  'SG90 Micro Servo (9g)': 'sg90-servo',
  'MG996R Metal Gear Servo': 'servo',
  'L298N H-Bridge Driver': 'l298n-driver',
  'L298N Motor Driver Module': 'l298n-driver',
  'Solderless Breadboards': 'breadboard',
  'Mini Breadboard': 'breadboard',
  'LED / Diode Kit': 'led',
  'Diode / LED Kit': 'led',
  'LED 5mm Red': 'led',
  'Resistor Kit': 'resistor',
  'MPU6050': 'mpu6050-imu',
  'PIR Sensor (HC-SR501)': 'pir-sensor',
  'PIR Motion Sensor': 'pir-sensor',
  'TT DC Gear Motor': 'tt-dc-motor'
};

const getLocalImage = (id: string, name: string) => {
  const direct = MEDIA.components[id];
  if (direct) return direct;
  const alias = LOCAL_NAME_ALIASES[name];
  return alias ? MEDIA.components[alias] : undefined;
};


const ROBU_PRODUCT_URLS: Record<string, string> = {
  'Arduino Uno R3/R4': 'https://robu.in/product/original-arduino-uno-rev3/',
  'ESP32 WROOM': 'https://robu.in/product/espressif-esp32-wroom-32-4m-32mbit-flash-wifi-bluetooth-module/',
  'HC-SR04 Ultrasonic Sensor': 'https://robu.in/product/hc-sr04-ultrasonic-range-finder/',
  'SG90 Micro Servo (9g)': 'https://robu.in/product/towerpro-sg90-9gm-1-2~kg-180-degree-rotation-servo-motor-good-quality/',
  'L298N H-Bridge Driver': 'https://robu.in/product/l298n-2a-based-motor-driver-module-good-quality/',
  'TB6612FNG Driver': 'https://robu.in/product/tb6612fng-motor-driver-module-performance-ultra-small-volume-3-pi-matching-performance-ultra-l298n/',
  'RC522 RFID Reader/Writer SPI': 'https://robu.in/product/rc522-rfid-reader-writer-module-with-card-and-tag/',
  'DS3231 RTC Module': 'https://robu.in/product/ds3231-rtc-module-precise-real-time-clock-i2c-at24c32/',
  'PCA9685 16-Channel Servo Driver': 'https://robu.in/product/16-channel-12-bit-pwm-servo-driver-i2c-interface-pca9685-for-arduino-raspberry-pi/',
  'Arduino Nano ESP32': 'https://robu.in/product/arduino-nano-esp32-s3/',
  'ESP32-S3 Development Board': 'https://robu.in/product/espressif-esp32-s3-devkitc-1-n8r8-development-board/',
  'MG996R Metal Gear Servo': 'https://robu.in/product/towerpro-mg996r-digital-high-torque-servo-motor/',
  'NEO-M8N / M9N GPS': 'https://robu.in/product-category/gps-module/',
  'GPS NEO-6M': 'https://robu.in/product/neo-6m-gps-module-with-eprom-normal-quality/',
  'BMP280 / BME280': 'https://robu.in/product-category/environmental-sensor/',
  'RPLIDAR A1M8 2D LiDAR': 'https://robu.in/product-category/lidar-sensor/',
  'RPLIDAR A1M8 / A2': 'https://robu.in/product-category/lidar-sensor/',
};

const SEARCH_ALIASES: Record<string, string[]> = {
  'Arduino Uno R3/R4': ['Arduino Uno R3', 'Arduino Uno Rev3'],
  'ESP32 WROOM': ['ESP32-WROOM-32', 'ESP32 DevKit'],
  'HC-SR04 Ultrasonic Sensor': ['HC-SR04 Ultrasonic Sensor'],
  'TCRT5000 IR Module': ['TCRT5000'],
  'SG90 Micro Servo (9g)': ['TowerPro SG90 servo', 'SG90 micro servo'],
  'MG996R Metal Gear Servo': ['MG996R servo'],
  'L298N H-Bridge Driver': ['L298N motor driver module'],
  'TB6612FNG Driver': ['TB6612FNG motor driver'],
  'RC522 RFID Reader/Writer SPI': ['MFRC522 RC522 RFID module'],
  'DS3231 RTC Module': ['DS3231 RTC module'],
  'PCA9685 16-Channel Servo Driver': ['PCA9685 16-channel PWM servo driver'],
  'MAX7219 8-Digit Display Driver': ['MAX7219 8 digit LED display'],
  'TM1637 4-Digit Display Module': ['TM1637 4 digit display'],
  'DS18B20 Waterproof Temperature Probe': ['DS18B20 waterproof temperature sensor'],
  'BH1750 Ambient Light Sensor': ['BH1750 light sensor'],
  'ADXL345 3-Axis Accelerometer': ['ADXL345 accelerometer'],
  'Thumb Joystick Module': ['thumb joystick module'],
  '4-Channel 5V Relay Module': ['4 channel relay module'],
  'Arduino Nano ESP32': ['Arduino Nano ESP32'],
  'ESP32-S3 Development Board': ['ESP32-S3 development board'],
  'RPLIDAR A1M8 2D LiDAR': ['RPLIDAR A1']
};


const buildSearchQueries = (name: string) => {
  const withoutParentheses = name.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const slashExpanded = name.replace(/\s*\/\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = name.split('/').map((part) => part.trim()).filter(Boolean);
  return [...new Set([name, withoutParentheses, slashExpanded, ...parts].filter(Boolean))];
};

const clean = (value: string) => value
  .toLowerCase()
  .replace(/\b(v\d+|r\d+|rev\.?\s*\d+)\b/gi, ' ')
  .replace(/[^a-z0-9+#. -]/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const significantTokens = (value: string) => clean(value)
  .split(' ')
  .filter((token) => token.length >= 3 && !['the', 'for', 'and', 'with', 'module', 'board'].includes(token));

function scoreTitle(queryName: string, title: string) {
  const query = clean(queryName);
  const candidate = clean(title);
  if (!query || !candidate) return 0;
  if (candidate === query) return 100;
  let score = 0;
  if (candidate.includes(query)) score += 70;
  const tokens = significantTokens(queryName);
  const matches = tokens.filter((token) => candidate.includes(token)).length;
  score += tokens.length ? (matches / tokens.length) * 30 : 0;
  return score;
}

function scoreSearchResult(queryName: string, title: string, requestedName: string) {
  const titleScore = scoreTitle(queryName, title);
  const requestedTokens = significantTokens(requestedName);
  const candidate = clean(title);
  const identityMatches = requestedTokens.filter((token) => candidate.includes(token)).length;
  const identityCoverage = requestedTokens.length ? identityMatches / requestedTokens.length : 0;
  return titleScore * 0.7 + identityCoverage * 30;
}

async function searchOpenverse(name: string): Promise<ImageState | null> {
  const aliases = SEARCH_ALIASES[name] || [];
  const queries = [...aliases, ...buildSearchQueries(name), `"${name}"`, clean(name)].filter((query, index, all) => query && all.indexOf(query) === index);
  for (const q of queries) {
    try {
      const params = new URLSearchParams({ q, page_size: '8', mature: 'false' });
      const response = await fetch(`https://api.openverse.org/v1/images/?${params.toString()}`);
      if (!response.ok) continue;
      const payload = await response.json();
      const results = Array.isArray(payload?.results) ? payload.results : [];
      const best = results
        .filter((item: any) => typeof item?.thumbnail === 'string' || typeof item?.url === 'string')
        .map((item: any) => {
          const title = String(item?.title || '');
          const score = Math.max(...queries.map((query) => scoreSearchResult(query, title, name)), 0);
          return { item, score };
        })
        .sort((a: any, b: any) => b.score - a.score)[0];
      if (best && best.score >= 68) {
        const url = best.item.thumbnail || best.item.url;
        if (typeof url === 'string' && url.startsWith('http') && best && best.score >= 68) {
          return {
            url,
            sourceUrl: best.item.foreign_landing_url || best.item.detail_url || url,
            source: 'openverse'
          };
        }
      }
    } catch {
      // Continue to the next source.
    }
  }
  return null;
}

async function searchWikimedia(name: string): Promise<ImageState | null> {
  const aliases = SEARCH_ALIASES[name] || [];
  const queries = [...aliases.map((q) => `intitle:"${q}"`), ...buildSearchQueries(name).map((q) => `intitle:"${q}"`), ...aliases, ...buildSearchQueries(name), clean(name)].filter((query, index, all) => query && all.indexOf(query) === index);
  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        action: 'query', format: 'json', origin: '*', generator: 'search', gsrnamespace: '6',
        gsrsearch: query, gsrlimit: '8', prop: 'imageinfo', iiprop: 'url|canonicaltitle', iiurlwidth: '800'
      });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
      if (!response.ok) continue;
      const payload = await response.json();
      const pages = Object.values(payload?.query?.pages || {}) as Array<any>;
      const best = pages
        .map((page) => {
          const title = String(page?.title || '');
          const score = Math.max(...queries.map((query) => scoreSearchResult(query, title, name)), 0);
          return { page, score };
        })
        .filter(({ page }) => String(page?.imageinfo?.[0]?.mime || '').startsWith('image/'))
        .filter(({ score }) => score >= 68)
        .sort((a, b) => b.score - a.score)[0];
      const image = best?.page?.imageinfo?.[0];
      const url = image?.thumburl || image?.url;
      if (typeof url === 'string' && url.startsWith('http')) {
        return {
          url,
          sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(String(best.page.title || '').replace(/ /g, '_'))}`,
          source: 'wikimedia'
        };
      }
    } catch {
      // Ignore transient source failures.
    }
  }
  return null;
}

const cacheKey = (id: string, name: string) => `robolearn:web-image:${id}:${name}`;

export const WebComponentImage: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const localImage = getLocalImage(id, name);
  const cached = memoryCache.get(id);
  const [state, setState] = useState<ImageState>(localImage ? { url: localImage, source: 'verified' } : cached || { url: null, source: 'none' });
  const [started, setStarted] = useState(Boolean(localImage || cached?.url));
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (localImage || started || !ref.current) return;
    const element = ref.current;
    if (!('IntersectionObserver' in window)) { setStarted(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        setStarted(true);
      }
    }, { rootMargin: '500px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [localImage, started]);

  useEffect(() => {
    if (!started || localImage || state.url) return;
    const key = cacheKey(id, name);
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ImageState;
        if (parsed?.url) {
          memoryCache.set(id, parsed);
          setState(parsed);
          return;
        }
      } catch {
        localStorage.removeItem(key);
      }
    }

    let cancelled = false;
    (async () => {
      const result = await searchOpenverse(name) || await searchWikimedia(name);
      if (cancelled) return;
      if (result) {
        memoryCache.set(id, result);
        localStorage.setItem(key, JSON.stringify(result));
        setState(result);
      } else {
        setState({ url: null, source: 'none' });
      }
    })();
    return () => { cancelled = true; };
  }, [started, localImage, state.url, id, name]);

  const robuSourceUrl = ROBU_PRODUCT_URLS[name];
  const sourceLabel = state.source === 'verified' ? 'Verified asset' : state.source === 'robu' ? 'Robu product' : state.source === 'openverse' ? 'Web photo · Openverse' : state.source === 'wikimedia' ? 'Web photo · Wikimedia' : '';

  return (
    <div ref={ref} className="relative w-full h-full">
      {state.url ? (
        <img
          src={state.url}
          alt={`${name} web reference photo`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={() => {
            if (state.source === 'openverse' || state.source === 'wikimedia') {
              localStorage.removeItem(cacheKey(id, name));
              setState({ url: null, source: 'none' });
            }
          }}
        />
      ) : !started ? (
        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600"><ImageOff className="w-8 h-8" /></div>
      )}
      {state.url && <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
        <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-[10px] text-white">{sourceLabel}</span>
        {(state.sourceUrl || robuSourceUrl) && state.source !== 'verified' && <a href={state.sourceUrl || robuSourceUrl} target="_blank" rel="noreferrer" aria-label={`Open source for ${name}`} className="pointer-events-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-[10px] text-white hover:text-cyan-300 transition" onClick={(e) => e.stopPropagation()}>Source <ExternalLink className="w-3 h-3" /></a>}
      </div>}
    </div>
  );
};
