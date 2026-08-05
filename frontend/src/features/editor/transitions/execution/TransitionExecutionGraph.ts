import { ExecutionGraphNode, ExecutionOperation, PerformanceCost, SerializedExecutionGraph } from './ExecutionGraphTypes';

export class TransitionExecutionGraph {
  public readonly graphId: string;
  public readonly transitionId: string;
  public readonly engineKey: string;
  public readonly category: string;
  public readonly duration: number;
  public readonly easing: string;
  public readonly nodes: readonly ExecutionGraphNode[];
  public readonly estimatedGPUCost: PerformanceCost;
  public readonly estimatedBackendCost: PerformanceCost;
  public readonly complexityScore: number;
  public readonly version: string;
  public readonly createdAt: number;

  constructor(
    graphId: string,
    transitionId: string,
    engineKey: string,
    category: string,
    duration: number,
    easing: string,
    nodes: ExecutionGraphNode[],
    estimatedGPUCost: PerformanceCost,
    estimatedBackendCost: PerformanceCost,
    complexityScore: number,
    version = '1.0.0'
  ) {
    this.graphId = graphId;
    this.transitionId = transitionId;
    this.engineKey = engineKey;
    this.category = category;
    this.duration = duration;
    this.easing = easing;
    this.nodes = Object.freeze(nodes);
    this.estimatedGPUCost = estimatedGPUCost;
    this.estimatedBackendCost = estimatedBackendCost;
    this.complexityScore = complexityScore;
    this.version = version;
    this.createdAt = Date.now();
  }

  public getAllOperations(): ExecutionOperation[] {
    const ops: ExecutionOperation[] = [];
    for (const node of this.nodes) {
      ops.push(...node.operations);
    }
    return ops;
  }

  public getOperationsByPhase(phaseName: string): ExecutionOperation[] {
    const node = this.nodes.find((n) => n.phaseName === phaseName);
    return node ? [...node.operations] : [];
  }

  public toSerialized(): SerializedExecutionGraph {
    return {
      graphId: this.graphId,
      transitionId: this.transitionId,
      engineKey: this.engineKey,
      category: this.category,
      duration: this.duration,
      easing: this.easing,
      nodes: [...this.nodes],
      estimatedGPUCost: this.estimatedGPUCost,
      estimatedBackendCost: this.estimatedBackendCost,
      complexityScore: this.complexityScore,
      version: this.version,
      createdAt: this.createdAt
    };
  }
}
