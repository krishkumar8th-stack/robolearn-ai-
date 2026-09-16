import React, { useEffect, useRef, useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { MEDIA } from '../assets/media';

type ImageState = { url: string | null; source: 'verified' | 'reference' | 'none' };

const memoryCache = new Map<string, ImageState>();

function normalizeQuery(name: string) {
  return name
    .replace(/\b(v\d+|r\d+|rev\.?\s*\d+|module|board|devkit|development board|development kit)\b/gi, ' ')
    .replace(/[^a-zA-Z0-9+.# -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function searchCommonsImage(name: string): Promise<string | null> {
  const queries = [name, normalizeQuery(name)].filter((value, index, all) => value && all.indexOf(value) === index);

  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        generator: 'search',
        gsrnamespace: '6',
        gsrsearch: query,
        gsrlimit: '3',
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '800'
      });

      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
        headers: { 'Api-User-Agent': 'RoboLearn-AI/1.0 (component image lookup)' }
      });
      if (!response.ok) continue;

      const payload = await response.json();
      const pages = Object.values(payload?.query?.pages || {}) as Array<any>;
      const image = pages.find((page) => {
        const mime = page?.imageinfo?.[0]?.mime || '';
        return String(mime).startsWith('image/');
      });
      const url = image?.imageinfo?.[0]?.thumburl || image?.imageinfo?.[0]?.url;
      if (typeof url === 'string' && url.startsWith('http')) return url;
    } catch {
      // Keep the catalog usable when an external image search is unavailable.
    }
  }

  return null;
}

function cacheKey(id: string, name: string) {
  return `robolearn-component-image:${id}:${name}`;
}

export const ComponentImage: React.FC<{
  id: string;
  name: string;
  className?: string;
}> = ({ id, name, className = '' }) => {
  const localImage = MEDIA.components[id];
  const initial: ImageState = localImage
    ? { url: localImage, source: 'verified' }
    : memoryCache.get(id) || { url: null, source: 'none' };
  const [state, setState] = useState<ImageState>(initial);
  const [started, setStarted] = useState(Boolean(initial.url));
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initial.url || started || !ref.current) return;

    const element = ref.current;
    const load = () => setStarted(true);
    if (!('IntersectionObserver' in window)) {
      load();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        load();
      }
    }, { rootMargin: '240px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, [initial.url, started]);

  useEffect(() => {
    if (!started || initial.url || state.url) return;

    const stored = localStorage.getItem(cacheKey(id, name));
    if (stored === 'none') {
      setState({ url: null, source: 'none' });
      return;
    }
    if (stored) {
      const cached = { url: stored, source: 'reference' as const };
      memoryCache.set(id, cached);
      setState(cached);
      return;
    }

    let cancelled = false;
    searchCommonsImage(name).then((url) => {
      if (cancelled) return;
      if (url) {
        const result = { url, source: 'reference' as const };
        memoryCache.set(id, result);
        localStorage.setItem(cacheKey(id, name), url);
        setState(result);
      } else {
        localStorage.setItem(cacheKey(id, name), 'none');
        setState({ url: null, source: 'none' });
      }
    });

    return () => { cancelled = true; };
  }, [started, initial.url, state.url, id, name]);

  return (
    <div ref={ref} className={`relative w-full h-full ${className}`}>
      {state.url ? (
        <img
          src={state.url}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={() => {
            if (state.source === 'reference') {
              localStorage.removeItem(cacheKey(id, name));
              setState({ url: null, source: 'none' });
            }
          }}
        />
      ) : state.source === 'none' && !started ? (
        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
          <ImageOff className="w-8 h-8" />
        </div>
      ) : state.source === 'none' && started ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600">
          <ImageOff className="w-8 h-8" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Photo unavailable</span>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {state.url && (
        <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-[10px] text-white pointer-events-none">
          {state.source === 'verified' ? 'Verified asset' : 'Wikimedia reference'}
        </div>
      )}
    </div>
  );
};
