import { TransitionExecutionGraph } from './TransitionExecutionGraph';
import { GraphValidationResult } from './ExecutionGraphTypes';

export class ExecutionGraphValidator {
  public static validate(graph: TransitionExecutionGraph): GraphValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!graph) {
      return {
        isValid: false,
        errors: ['Execution graph is null or undefined'],
        warnings: [],
        graphId: 'UNKNOWN'
      };
    }

    // 1. Duration Check
    if (typeof graph.duration !== 'number' || graph.duration <= 0) {
      errors.push(`Invalid graph duration: ${graph.duration}`);
    }

    // 2. Nodes Check
    if (!graph.nodes || graph.nodes.length === 0) {
      errors.push(`Execution graph ${graph.graphId} contains 0 phase nodes`);
    }

    // 3. Node Order & Duplicate Check
    const seenOrders = new Set<number>();
    let totalOps = 0;

    for (const node of graph.nodes) {
      if (seenOrders.has(node.order)) {
        errors.push(`Duplicate node order ${node.order} detected in phase ${node.phaseName}`);
      }
      seenOrders.add(node.order);

      for (const op of node.operations) {
        totalOps++;
        if (op.startTimeRatio < 0 || op.endTimeRatio > 1 || op.startTimeRatio > op.endTimeRatio) {
          errors.push(`Invalid operation timing ratios: [${op.startTimeRatio}, ${op.endTimeRatio}] in operation ${op.id}`);
        }
      }
    }

    if (totalOps === 0) {
      warnings.push(`Execution graph ${graph.graphId} has no registered operations`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      graphId: graph.graphId
    };
  }
}
