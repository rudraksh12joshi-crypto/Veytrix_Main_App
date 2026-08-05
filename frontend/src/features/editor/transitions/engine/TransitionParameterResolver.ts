import { TransitionModel } from '../registry/TransitionTypes';

export class TransitionParameterResolver {
  public static resolve(
    model: TransitionModel,
    userOverrides?: Record<string, any>
  ): Record<string, any> {
    const defaultParams = model.parameters || {};

    const merged = {
      ...defaultParams,
      ...(userOverrides || {})
    };

    // Ensure core normalization keys exist
    if (!merged.easing) {
      merged.easing = 'easeInOutCubic';
    }
    if (typeof merged.intensity !== 'number') {
      merged.intensity = 1.0;
    }
    if (!merged.direction) {
      merged.direction = 'auto';
    }

    return merged;
  }
}
