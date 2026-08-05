import { ExecutionOperation } from '../execution/ExecutionGraphTypes';
import { TransitionInterpolator } from './TransitionInterpolator';

export interface EvaluatedOperationProgress {
  operation: ExecutionOperation;
  rawProgress: number;       // 0.0 to 1.0 within operation time window
  evaluatedProgress: number; // Easing curve applied
  isActive: boolean;
}

export class TransitionFrameCalculator {
  public static calculateGraphProgress(currentTimeSeconds: number, durationSeconds: number): number {
    if (durationSeconds <= 0) return 1.0;
    const progress = currentTimeSeconds / durationSeconds;
    return Math.max(0.0, Math.min(1.0, progress));
  }

  public static calculateOperationProgress(
    operation: ExecutionOperation,
    graphProgress: number
  ): EvaluatedOperationProgress {
    const { startTimeRatio, endTimeRatio, easing } = operation;

    // Out of bounds checks
    if (graphProgress < startTimeRatio) {
      return {
        operation,
        rawProgress: 0.0,
        evaluatedProgress: TransitionInterpolator.evaluate(0.0, easing),
        isActive: false
      };
    }

    if (graphProgress > endTimeRatio) {
      return {
        operation,
        rawProgress: 1.0,
        evaluatedProgress: TransitionInterpolator.evaluate(1.0, easing),
        isActive: false
      };
    }

    const durationRatio = endTimeRatio - startTimeRatio;
    const rawProgress = durationRatio > 0 ? (graphProgress - startTimeRatio) / durationRatio : 1.0;
    const evaluatedProgress = TransitionInterpolator.evaluate(rawProgress, easing);

    return {
      operation,
      rawProgress,
      evaluatedProgress,
      isActive: true
    };
  }
}
