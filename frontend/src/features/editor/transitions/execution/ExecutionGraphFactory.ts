import { TransitionInstance } from '../engine/TransitionEngineTypes';
import { TransitionEngine } from '../engine/TransitionEngine';
import { TransitionExecutionGraph } from './TransitionExecutionGraph';
import { ExecutionGraphBuilder } from './ExecutionGraphBuilder';
import { ExecutionGraphValidator } from './ExecutionGraphValidator';
import { ExecutionGraphSerializer } from './ExecutionGraphSerializer';
import { GraphValidationResult, ExecutionGraphMetrics, PerformanceCost, OperationType } from './ExecutionGraphTypes';

export class ExecutionGraphFactory {
  private static instance: ExecutionGraphFactory | null = null;
  private graphCache: Map<string, TransitionExecutionGraph> = new Map();
  private totalBuilt = 0;
  private totalBuildTimeMs = 0;

  private constructor() {}

  public static getInstance(): ExecutionGraphFactory {
    if (!ExecutionGraphFactory.instance) {
      ExecutionGraphFactory.instance = new ExecutionGraphFactory();
    }
    return ExecutionGraphFactory.instance;
  }

  public createExecutionGraph(
    instanceOrId: string | TransitionInstance,
    userDurationOverride?: number
  ): TransitionExecutionGraph | null {
    let instance: TransitionInstance | null = null;

    if (typeof instanceOrId === 'string') {
      instance = TransitionEngine.getInstance().createTransitionInstance(instanceOrId, { userDurationOverride });
    } else {
      instance = instanceOrId;
    }

    if (!instance) {
      console.error(`[ExecutionGraphFactory] Failed to resolve TransitionInstance for ${instanceOrId}`);
      return null;
    }

    const cacheKey = `${instance.id}_${instance.duration}_${instance.engineKey}`;
    if (this.graphCache.has(cacheKey)) {
      return this.graphCache.get(cacheKey)!;
    }

    const t0 = performance.now();
    const graph = ExecutionGraphBuilder.buildGraph(instance);
    const t1 = performance.now();

    this.totalBuilt++;
    this.totalBuildTimeMs += (t1 - t0);

    this.graphCache.set(cacheKey, graph);
    return graph;
  }

  public validateExecutionGraph(graph: TransitionExecutionGraph): GraphValidationResult {
    return ExecutionGraphValidator.validate(graph);
  }

  public serializeExecutionGraph(graph: TransitionExecutionGraph): string {
    return ExecutionGraphSerializer.serializeToJson(graph);
  }

  public deserializeExecutionGraph(jsonString: string): TransitionExecutionGraph {
    return ExecutionGraphSerializer.deserializeFromJson(jsonString);
  }

  public estimateComplexity(graph: TransitionExecutionGraph): number {
    return graph.complexityScore;
  }

  public estimateGPUCost(graph: TransitionExecutionGraph): PerformanceCost {
    return graph.estimatedGPUCost;
  }

  public estimateBackendCost(graph: TransitionExecutionGraph): PerformanceCost {
    return graph.estimatedBackendCost;
  }

  public clearCache(): void {
    this.graphCache.clear();
  }

  public getMetrics(): ExecutionGraphMetrics {
    const avgTime = this.totalBuilt > 0 ? Math.round((this.totalBuildTimeMs / this.totalBuilt) * 100) / 100 : 0;
    let totalOps = 0;
    for (const g of this.graphCache.values()) {
      totalOps += g.getAllOperations().length;
    }

    const supportedOps: OperationType[] = [
      'OPACITY',
      'TRANSLATE',
      'SCALE',
      'ROTATE',
      'BLUR',
      'MASK',
      'BLEND',
      'SHADER',
      'LIGHTING',
      'CAMERA',
      'WAIT',
      'COMPOSITE'
    ];

    return {
      totalGraphsBuilt: this.totalBuilt,
      cachedGraphCount: this.graphCache.size,
      averageBuildTimeMs: avgTime,
      totalOperationsCount: totalOps,
      supportedOperationTypes: supportedOps,
      memoryUsageKb: Math.round(this.graphCache.size * 2.5 * 100) / 100
    };
  }
}
