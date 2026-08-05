import { TransitionExecutionGraph } from './TransitionExecutionGraph';
import { SerializedExecutionGraph } from './ExecutionGraphTypes';

export class ExecutionGraphSerializer {
  public static serializeToJson(graph: TransitionExecutionGraph): string {
    return JSON.stringify(graph.toSerialized(), null, 2);
  }

  public static deserializeFromJson(jsonString: string): TransitionExecutionGraph {
    const raw: SerializedExecutionGraph = JSON.parse(jsonString);

    return new TransitionExecutionGraph(
      raw.graphId,
      raw.transitionId,
      raw.engineKey,
      raw.category,
      raw.duration,
      raw.easing,
      raw.nodes,
      raw.estimatedGPUCost,
      raw.estimatedBackendCost,
      raw.complexityScore,
      raw.version
    );
  }
}
