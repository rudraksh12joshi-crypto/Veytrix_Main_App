import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TransitionRegistry } from './TransitionRegistry';
import { TransitionModel, TransitionPlan, RegistryMetrics, ValidationResult } from './TransitionTypes';

interface TransitionRegistryContextType {
  isInitialized: boolean;
  metrics: RegistryMetrics | null;
  validation: ValidationResult | null;
  getAllTransitions: () => TransitionModel[];
  getTransitionById: (id: string) => TransitionModel | undefined;
  getTransitionsByCategory: (category: string) => TransitionModel[];
  getTransitionsByPlan: (plan: TransitionPlan) => TransitionModel[];
  getTransitionsByEngine: (engineKey: string) => TransitionModel[];
  searchTransitions: (query: string) => TransitionModel[];
  categories: string[];
  engines: string[];
}

const TransitionRegistryContext = createContext<TransitionRegistryContextType | null>(null);

export const TransitionRegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    TransitionRegistry.getInstance().initialize();
    setIsInitialized(true);
  }, []);

  const registry = TransitionRegistry.getInstance();

  const value = useMemo(
    () => ({
      isInitialized,
      metrics: registry.getMetrics(),
      validation: registry.getValidationResult(),
      getAllTransitions: () => registry.getAllTransitions(),
      getTransitionById: (id: string) => registry.getTransitionById(id),
      getTransitionsByCategory: (category: string) => registry.getTransitionsByCategory(category),
      getTransitionsByPlan: (plan: TransitionPlan) => registry.getTransitionsByPlan(plan),
      getTransitionsByEngine: (engineKey: string) => registry.getTransitionsByEngine(engineKey),
      searchTransitions: (query: string) => registry.searchTransitions(query),
      categories: registry.getCategories(),
      engines: registry.getEngines()
    }),
    [isInitialized]
  );

  return (
    <TransitionRegistryContext.Provider value={value}>
      {children}
    </TransitionRegistryContext.Provider>
  );
};

export const useTransitionRegistry = (): TransitionRegistryContextType => {
  const context = useContext(TransitionRegistryContext);
  if (!context) {
    // Fallback to singleton instance direct access if outside provider
    const registry = TransitionRegistry.getInstance();
    return {
      isInitialized: true,
      metrics: registry.getMetrics(),
      validation: registry.getValidationResult(),
      getAllTransitions: () => registry.getAllTransitions(),
      getTransitionById: (id: string) => registry.getTransitionById(id),
      getTransitionsByCategory: (category: string) => registry.getTransitionsByCategory(category),
      getTransitionsByPlan: (plan: TransitionPlan) => registry.getTransitionsByPlan(plan),
      getTransitionsByEngine: (engineKey: string) => registry.getTransitionsByEngine(engineKey),
      searchTransitions: (query: string) => registry.searchTransitions(query),
      categories: registry.getCategories(),
      engines: registry.getEngines()
    };
  }
  return context;
};
