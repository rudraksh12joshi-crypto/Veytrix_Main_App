import rawTransitions from '../../../../data/catalog/parsed_transitions';
import { TransitionModel, TransitionPlan } from './TransitionTypes';
import { TRANSITION_DEFAULTS } from './TransitionConstants';

export class TransitionLoader {
  private static cachedTransitions: TransitionModel[] | null = null;

  public static loadCatalog(): TransitionModel[] {
    if (this.cachedTransitions) {
      return this.cachedTransitions;
    }

    const loaded: TransitionModel[] = [];

    for (const item of rawTransitions as any[]) {
      // Ignore any non-transition items if mixed in raw catalog
      if (item.type && item.type.toUpperCase() !== 'TRANSITIONS') {
        continue;
      }

      const plan: TransitionPlan = (item.plan || 'FREE').toUpperCase() as TransitionPlan;

      const model: TransitionModel = {
        id: String(item.id),
        name: String(item.name || '').trim(),
        category: String(item.category || '').trim(),
        subcategory: String(item.subcategory || item.category || '').trim(),
        plan,
        engineKey: String(item.engineKey || '').trim(),
        duration: typeof item.duration === 'number' ? item.duration : TRANSITION_DEFAULTS.DURATION,
        defaultDuration: typeof item.defaultDuration === 'number' ? item.defaultDuration : TRANSITION_DEFAULTS.DURATION,
        minDuration: typeof item.minDuration === 'number' ? item.minDuration : TRANSITION_DEFAULTS.MIN_DURATION,
        maxDuration: typeof item.maxDuration === 'number' ? item.maxDuration : TRANSITION_DEFAULTS.MAX_DURATION,
        thumbnail: String(item.thumbnail || ''),
        preview: String(item.preview || ''),
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        description: String(item.description || ''),
        enabled: item.enabled !== false,
        version: String(item.version || TRANSITION_DEFAULTS.VERSION),
        parameters: item.parameters || { easing: TRANSITION_DEFAULTS.EASING, intensity: 1.0 }
      };

      loaded.push(model);
    }

    this.cachedTransitions = loaded;
    return loaded;
  }

  public static clearCache(): void {
    this.cachedTransitions = null;
  }
}
