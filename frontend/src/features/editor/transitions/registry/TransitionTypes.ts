export type TransitionPlan = 'FREE' | 'PRO' | 'PREMIUM';

export interface TransitionParameters {
  easing?: string;
  intensity?: number;
  direction?: string;
  [key: string]: any;
}

export interface TransitionModel {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  plan: TransitionPlan;
  engineKey: string;
  duration: number;
  defaultDuration: number;
  minDuration: number;
  maxDuration: number;
  thumbnail: string;
  preview: string;
  tags: string[];
  description: string;
  enabled: boolean;
  version: string;
  parameters: TransitionParameters;
}

export interface ValidationError {
  transitionId?: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  totalChecked: number;
}

export interface RegistryMetrics {
  totalTransitions: number;
  categoriesDetected: string[];
  engineGroupsDetected: string[];
  freeCount: number;
  proCount: number;
  premiumCount: number;
  duplicateIdCheckPassed: boolean;
  missingAssetCheckPassed: boolean;
  initializationTimeMs: number;
  estimatedMemoryUsageKb: number;
  isCached: boolean;
}

export interface TransitionRegistryState {
  isInitialized: boolean;
  metrics: RegistryMetrics | null;
  validation: ValidationResult | null;
}
