import React, { createContext, useContext, useMemo } from 'react';
import { TransitionEngine } from './TransitionEngine';
import { TransitionInstance, TransitionEngineOptions, EngineValidationResult, EngineMetrics } from './TransitionEngineTypes';
import { TransitionModel, TransitionPlan } from '../registry/TransitionTypes';

interface TransitionEngineContextType {
  createInstance: (idOrModel: string | TransitionModel, options?: TransitionEngineOptions) => TransitionInstance | null;
  validateTransition: (idOrModel: string | TransitionModel, userPlan?: TransitionPlan) => EngineValidationResult;
  resolveParameters: (idOrModel: string | TransitionModel, userOverrides?: Record<string, any>) => Record<string, any>;
  resolveDuration: (idOrModel: string | TransitionModel, userOverride?: number, timelineConstraint?: number) => number;
  supportsRealtimePreview: (engineKey: string) => boolean;
  supportsBackendRendering: (engineKey: string) => boolean;
  metrics: EngineMetrics;
}

const TransitionEngineContext = createContext<TransitionEngineContextType | null>(null);

export const TransitionEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const engine = TransitionEngine.getInstance();

  const value = useMemo(
    () => ({
      createInstance: (idOrModel: string | TransitionModel, options?: TransitionEngineOptions) =>
        engine.createTransitionInstance(idOrModel, options),
      validateTransition: (idOrModel: string | TransitionModel, userPlan?: TransitionPlan) =>
        engine.validateTransition(idOrModel, userPlan),
      resolveParameters: (idOrModel: string | TransitionModel, userOverrides?: Record<string, any>) =>
        engine.resolveParameters(idOrModel, userOverrides),
      resolveDuration: (idOrModel: string | TransitionModel, userOverride?: number, timelineConstraint?: number) =>
        engine.resolveDuration(idOrModel, userOverride, timelineConstraint),
      supportsRealtimePreview: (engineKey: string) => engine.supportsRealtimePreview(engineKey),
      supportsBackendRendering: (engineKey: string) => engine.supportsBackendRendering(engineKey),
      metrics: engine.getMetrics()
    }),
    []
  );

  return (
    <TransitionEngineContext.Provider value={value}>
      {children}
    </TransitionEngineContext.Provider>
  );
};

export const useTransitionEngine = (): TransitionEngineContextType => {
  const context = useContext(TransitionEngineContext);
  if (!context) {
    const engine = TransitionEngine.getInstance();
    return {
      createInstance: (idOrModel: string | TransitionModel, options?: TransitionEngineOptions) =>
        engine.createTransitionInstance(idOrModel, options),
      validateTransition: (idOrModel: string | TransitionModel, userPlan?: TransitionPlan) =>
        engine.validateTransition(idOrModel, userPlan),
      resolveParameters: (idOrModel: string | TransitionModel, userOverrides?: Record<string, any>) =>
        engine.resolveParameters(idOrModel, userOverrides),
      resolveDuration: (idOrModel: string | TransitionModel, userOverride?: number, timelineConstraint?: number) =>
        engine.resolveDuration(idOrModel, userOverride, timelineConstraint),
      supportsRealtimePreview: (engineKey: string) => engine.supportsRealtimePreview(engineKey),
      supportsBackendRendering: (engineKey: string) => engine.supportsBackendRendering(engineKey),
      metrics: engine.getMetrics()
    };
  }
  return context;
};
