import { TransitionModel, TransitionPlan } from './TransitionTypes';
import { TransitionRegistry } from './TransitionRegistry';

export class TransitionSelectors {
  public static selectAll(): TransitionModel[] {
    return TransitionRegistry.getInstance().getAllTransitions();
  }

  public static selectById(id: string): TransitionModel | undefined {
    return TransitionRegistry.getInstance().getTransitionById(id);
  }

  public static selectByCategory(category: string): TransitionModel[] {
    return TransitionRegistry.getInstance().getTransitionsByCategory(category);
  }

  public static selectByPlan(plan: TransitionPlan): TransitionModel[] {
    return TransitionRegistry.getInstance().getTransitionsByPlan(plan);
  }

  public static selectByEngine(engineKey: string): TransitionModel[] {
    return TransitionRegistry.getInstance().getTransitionsByEngine(engineKey);
  }

  public static selectGroupedByCategory(): Record<string, TransitionModel[]> {
    const registry = TransitionRegistry.getInstance();
    const categories = registry.getCategories();
    const result: Record<string, TransitionModel[]> = {};

    for (const cat of categories) {
      result[cat] = registry.getTransitionsByCategory(cat);
    }

    return result;
  }

  public static selectUnlockedForPlan(userPlan: TransitionPlan): TransitionModel[] {
    const all = TransitionRegistry.getInstance().getAllTransitions();
    if (userPlan === 'PREMIUM') {
      return all;
    }
    if (userPlan === 'PRO') {
      return all.filter((t) => t.plan === 'FREE' || t.plan === 'PRO');
    }
    return all.filter((t) => t.plan === 'FREE');
  }

  public static isUnlocked(transitionId: string, userPlan: TransitionPlan): boolean {
    const item = TransitionRegistry.getInstance().getTransitionById(transitionId);
    if (!item) return false;
    if (userPlan === 'PREMIUM') return true;
    if (userPlan === 'PRO') return item.plan === 'FREE' || item.plan === 'PRO';
    return item.plan === 'FREE';
  }
}
