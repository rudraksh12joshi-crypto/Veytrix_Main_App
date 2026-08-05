import React, { createContext, useContext, useMemo } from 'react';
import { ExecutionGraphFactory } from './ExecutionGraphFactory';
import { TransitionExecutionGraph } from './TransitionExecutionGraph';
import { TransitionInstance } from '../engine/TransitionEngineTypes';
import { GraphValidationResult, ExecutionGraphMetrics, PerformanceCost } from './ExecutionGraphTypes';

interface ExecutionGraphContextType {
  createExecutionGraph: (instanceOrId: string | TransitionInstance, userDurationOverride?: number) => TransitionExecutionGraph | null;
  validateExecutionGraph: (graph: TransitionExecutionGraph) => GraphValidationResult;
  serializeExecutionGraph: (graph: TransitionExecutionGraph) => string;
  deserializeExecutionGraph: (jsonString: string) => TransitionExecutionGraph;
  estimateComplexity: (graph: TransitionExecutionGraph) => number;
  estimateGPUCost: (graph: TransitionExecutionGraph) => PerformanceCost;
  estimateBackendCost: (graph: TransitionExecutionGraph) => PerformanceCost;
  metrics: ExecutionGraphMetrics;
}

const ExecutionGraphContext = createContext<ExecutionGraphContextType | null>(null);

export const ExecutionGraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const factory = ExecutionGraphFactory.getInstance();

  const value = useMemo(
    () => ({
      createExecutionGraph: (instanceOrId: string | TransitionInstance, userDurationOverride?: number) =>
        factory.createExecutionGraph(instanceOrId, userDurationOverride),
      validateExecutionGraph: (graph: TransitionExecutionGraph) => factory.validateExecutionGraph(graph),
      serializeExecutionGraph: (graph: TransitionExecutionGraph) => factory.serializeExecutionGraph(graph),
      deserializeExecutionGraph: (jsonString: string) => factory.deserializeExecutionGraph(jsonString),
      estimateComplexity: (graph: TransitionExecutionGraph) => factory.estimateComplexity(graph),
      estimateGPUCost: (graph: TransitionExecutionGraph) => factory.estimateGPUCost(graph),
      estimateBackendCost: (graph: TransitionExecutionGraph) => factory.estimateBackendCost(graph),
      metrics: factory.getMetrics()
    }),
    []
  );

  return (
    <ExecutionGraphContext.Provider value={value}>
      {children}
    </ExecutionGraphContext.Provider>
  );
};

export const useExecutionGraph = (): ExecutionGraphContextType => {
  const context = useContext(ExecutionGraphContext);
  if (!context) {
    const factory = ExecutionGraphFactory.getInstance();
    return {
      createExecutionGraph: (instanceOrId: string | TransitionInstance, userDurationOverride?: number) =>
        factory.createExecutionGraph(instanceOrId, userDurationOverride),
      validateExecutionGraph: (graph: TransitionExecutionGraph) => factory.validateExecutionGraph(graph),
      serializeExecutionGraph: (graph: TransitionExecutionGraph) => factory.serializeExecutionGraph(graph),
      deserializeExecutionGraph: (jsonString: string) => factory.deserializeExecutionGraph(jsonString),
      estimateComplexity: (graph: TransitionExecutionGraph) => factory.estimateComplexity(graph),
      estimateGPUCost: (graph: TransitionExecutionGraph) => factory.estimateGPUCost(graph),
      estimateBackendCost: (graph: TransitionExecutionGraph) => factory.estimateBackendCost(graph),
      metrics: factory.getMetrics()
    };
  }
  return context;
};
