import type { ElectronicComponent } from '../types/index.js';

export type ComponentSourceStatus = 'catalog' | 'verified';

export interface CatalogEntry {
  id: string;
  name: string;
  category: ElectronicComponent['category'];
  difficulty: ElectronicComponent['difficulty'];
}

/**
 * 500+ real component/board/module names curated for the RoboLearn reference library.
 * Variant-specific electrical ratings are intentionally not invented here.
 * Entries become `verified` only after manufacturer documentation and a usable
 * photo/model asset have been checked.
 */
export const COMPONENT_CATALOG: CatalogEntry[] = "+cat_json+";

export function catalogEntryToComponent(entry: CatalogEntry): ElectronicComponent {
  return {
    ...entry,
    modelType: 'generic',
    tagline: `${entry.name} — hardware reference for robotics, electronics and embedded projects.`,
    description: `${entry.name} is a real electronics/robotics component or module. Check the manufacturer datasheet for exact variant ratings before wiring.`,
    whatIsIt: `A hardware component identified as ${entry.name}.`,
    whyUsed: `Used in embedded systems, electronics, automation or robotics where ${entry.name} is appropriate.`,
    howItWorks: 'Exact electrical behavior depends on the specific manufacturer and variant. Use the referenced datasheet before applying power or signals.',
    internalWorking: 'Variant-specific internal details are intentionally left for verified documentation rather than guessed values.',
    specifications: [
      { key: 'Reference', value: 'Manufacturer datasheet required for exact ratings' },
      { key: 'Category', value: entry.category }
    ],
    pins: [],
    wiringGuide: { targetBoard: 'Verify from datasheet', connections: [] },
    codeExamples: [],
    commonMistakes: ['Using a pinout or rating from a different variant.'],
    safetyRules: ['Verify voltage, current, polarity and pinout from the manufacturer documentation before connecting.'],
    realWorldApplications: ['Embedded systems', 'Robotics', 'Electronics prototyping'],
    relatedComponentIds: []
  };
}
