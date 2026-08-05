import { ExecutionGraphNode, ExecutionOperation, OperationTarget } from './ExecutionGraphTypes';

export class GraphNodeBuilder {
  private static nodeCounter = 0;

  public static createNode(
    phaseName: string,
    order: number,
    target: OperationTarget,
    operations: ExecutionOperation[] = []
  ): ExecutionGraphNode {
    this.nodeCounter++;
    return {
      nodeId: `node_${order}_${this.nodeCounter}`,
      phaseName,
      order,
      target,
      operations
    };
  }
}
