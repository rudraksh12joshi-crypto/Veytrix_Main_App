import { TransitionModel, TransitionPlan } from '../registry/TransitionTypes';

export interface TimelineBehavior {
  requiresOverlap: boolean;
  defaultOverlap: number;
  supportsHandles: boolean;
  minOverlap: number;
  maxOverlap: number;
}

export interface TransitionInstance {
  id: string;
  name: string;
  engineKey: string;
  category: string;
  subcategory: string;
  plan: TransitionPlan;
  duration: number;
  easing: string;
  parameters: Record<string, any>;
  timelineBehavior: TimelineBehavior;
  executionStrategy: string;
  supportsRealtimePreview: boolean;
  supportsBackendRender: boolean;
  supportsGPU: boolean;
  enabled: boolean;
  metadata: {
    version: string;
    description: string;
    thumbnail: string;
    preview: string;
    tags: string[];
    [key: string]: any;
  };
}

export interface EngineValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  transitionId: string;
}

export interface TransitionEngineOptions {
  userDurationOverride?: number;
  timelineConstraint?: number;
  userPlan?: TransitionPlan;
  parameterOverrides?: Record<string, any>;
}

export interface EngineMetrics {
  totalStrategiesRegistered: number;
  supportedEngineKeys: string[];
  instancesCreatedCount: number;
  cacheHitRatio: number;
  initializationTimeMs: number;
  memoryUsageKb: number;
}
