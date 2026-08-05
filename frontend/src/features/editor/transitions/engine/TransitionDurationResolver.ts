import { TransitionModel } from '../registry/TransitionTypes';

export class TransitionDurationResolver {
  public static resolve(
    model: TransitionModel,
    userOverride?: number,
    timelineConstraint?: number
  ): number {
    let duration = model.defaultDuration || model.duration || 0.5;

    // 1. Apply user duration override if provided
    if (typeof userOverride === 'number' && userOverride > 0) {
      duration = userOverride;
    }

    // 2. Clamp duration between model min and max boundaries
    const min = model.minDuration || 0.1;
    const max = model.maxDuration || 3.0;
    duration = Math.max(min, Math.min(max, duration));

    // 3. Apply timeline clip constraint if media handles are bounded
    if (typeof timelineConstraint === 'number' && timelineConstraint > 0) {
      duration = Math.min(duration, timelineConstraint);
    }

    return Math.round(duration * 1000) / 1000;
  }
}
