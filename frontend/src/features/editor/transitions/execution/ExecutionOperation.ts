import { ExecutionOperation, OperationType, OperationTarget } from './ExecutionGraphTypes';

export class OperationFactory {
  private static opCounter = 0;

  public static create(
    type: OperationType,
    target: OperationTarget,
    startTimeRatio: number,
    endTimeRatio: number,
    parameters: Record<string, any>,
    easing = 'easeInOutCubic',
    description?: string
  ): ExecutionOperation {
    this.opCounter++;
    return {
      id: `op_${type.toLowerCase()}_${this.opCounter}`,
      type,
      target,
      startTimeRatio: Math.max(0.0, Math.min(1.0, startTimeRatio)),
      endTimeRatio: Math.max(0.0, Math.min(1.0, endTimeRatio)),
      easing,
      parameters,
      description: description || `${type} operation on ${target.clip}`
    };
  }
}
