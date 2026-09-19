import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';

const SKIP_SELECTOR = [
  'script',
  'style',
  'noscript',
  'textarea',
  'input',
  '[data-no-translate]',
  '[data-user-content]',
  '.monaco-editor',
  'code',
  'pre'
].join(',');

const ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt'] as const;
const BATCH_SIZE = 35;
const MAX_TEXT_LENGTH = 500;

function shouldTranslate(node: Text) {
  const parent = node.parentElement;
  if (!parent || parent.closest(SKIP_SELECTOR)) return false;
  const source = node.nodeValue?.replace(/\s+/g, ' ').trim() || '';
  if (source.length < 2 || source.length > MAX_TEXT_LENGTH) return false;
  if (!/[A-Za-z]/.test(source)) return false;
  if (/^(https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$)/i.test(source)) return false;
  if (/^[A-Z_][A-Z0-9_-]*(\(.*\))?$/.test(source) && source.length < 40) return false;
  return true;
}

function collectTextNodes(root: ParentNode) {
  const result: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current: Node | null;
  while ((current = walker.nextNode())) {
    if (current.nodeType === Node.TEXT_NODE && shouldTranslate(current as Text)) {
      result.push(current as Text);
    }
  }
  return result;
}

export const AutoTranslatePage: React.FC = () => {
  const { currentLanguage, currentMeta } = useLanguage();
  const originals = useRef(new Map<Text, string>());
  const attrOriginals = useRef(new Map<Element, Record<string, string>>());
  const cache = useRef<Record<string, string>>({});
  const observer = useRef<MutationObserver | null>(null);
  const translating = useRef(false);
  const timer = useRef<number | null>(null);

  const restoreOriginals = () => {
    originals.current.forEach((source, node) => {
      if (node.isConnected) node.nodeValue = source;
    });
    attrOriginals.current.forEach((attrs, element) => {
      if (!element.isConnected) return;
      Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value));
    });
  };

  const loadCache = () => {
    try {
      const raw = localStorage.getItem('roblearn_translation_cache_' + currentLanguage);
      const parsed = raw ? JSON.parse(raw) : {};
      cache.current = parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      cache.current = {};
    }
  };

  const saveCache = () => {
    try {
      localStorage.setItem(
        'roblearn_translation_cache_' + currentLanguage,
        JSON.stringify(cache.current)
      );
    } catch {
      // Optional cache only.
    }
  };

  const runTranslation = async () => {
    if (currentLanguage === 'en' || translating.current) return;
    translating.current = true;
    observer.current?.disconnect();

    try {
      const nodes = collectTextNodes(document.body);
      const uniqueSources: string[] = [];
      const sourceToNodes = new Map<string, Text[]>();

      nodes.forEach((node) => {
        const source = originals.current.get(node) || node.nodeValue?.replace(/\s+/g, ' ').trim() || '';
        if (!source) return;
        if (!originals.current.has(node)) originals.current.set(node, source);
        const list = sourceToNodes.get(source);
        if (list) list.push(node);
        else {
          sourceToNodes.set(source, [node]);
          uniqueSources.push(source);
        }
      });

      document.body.querySelectorAll<HTMLElement>('*').forEach((element) => {
        if (element.closest(SKIP_SELECTOR)) return;
        ATTRIBUTES.forEach((attribute) => {
          const value = element.getAttribute(attribute);
          if (!value || value.length > MAX_TEXT_LENGTH || !/[A-Za-z]/.test(value)) return;
          const attrs = attrOriginals.current.get(element) || {};
          if (!(attribute in attrs)) attrs[attribute] = value;
          attrOriginals.current.set(element, attrs);
          if (!uniqueSources.includes(value)) uniqueSources.push(value);
        });
      });

      const missing = uniqueSources.filter((source) => !cache.current[source]);
      for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        const batch = missing.slice(i, i + BATCH_SIZE);
        const translated = await api.translateTexts(batch, currentMeta.name);
        batch.forEach((source, index) => {
          const value = translated[index];
          if (value) cache.current[source] = value;
        });
        saveCache();
      }

      sourceToNodes.forEach((textNodes, source) => {
        const value = cache.current[source];
        if (value) textNodes.forEach((node) => {
          if (node.isConnected) node.nodeValue = value;
        });
      });

      attrOriginals.current.forEach((attrs, element) => {
        if (!element.isConnected) return;
        Object.entries(attrs).forEach(([attribute, source]) => {
          const value = cache.current[source];
          if (value) element.setAttribute(attribute, value);
        });
      });
    } catch (error) {
      console.warn('[RoboLearn i18n] Translation failed:', error);
    } finally {
      translating.current = false;
      startObserver();
    }
  };

  const schedule = () => {
    if (timer.current !== null || translating.current) return;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      void runTranslation();
    }, 150);
  };

  const startObserver = () => {
    observer.current?.disconnect();
    observer.current = new MutationObserver((mutations) => {
      if (translating.current) return;
      if (mutations.some((mutation) => mutation.addedNodes.length > 0)) schedule();
    });
    observer.current.observe(document.body, { childList: true, subtree: true });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    loadCache();
    restoreOriginals();

    const timeout = window.setTimeout(() => {
      void runTranslation();
    }, 100);

    return () => {
      window.clearTimeout(timeout);
      if (timer.current !== null) window.clearTimeout(timer.current);
      observer.current?.disconnect();
      observer.current = null;
      restoreOriginals();
    };
  }, [currentLanguage]);

  return null;
};
