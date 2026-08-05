import { TransitionPlan } from '../registry/TransitionTypes';

export class TransitionStore {
  private static instance: TransitionStore | null = null;
  private userPlan: TransitionPlan = 'FREE';
  private favorites: Set<string> = new Set();
  private recentTransitions: string[] = [];

  private constructor() {}

  public static getInstance(): TransitionStore {
    if (!TransitionStore.instance) {
      TransitionStore.instance = new TransitionStore();
    }
    return TransitionStore.instance;
  }

  public getUserPlan(): TransitionPlan {
    return this.userPlan;
  }

  public setUserPlan(plan: TransitionPlan): void {
    this.userPlan = plan;
  }

  public toggleFavorite(transitionId: string): boolean {
    if (this.favorites.has(transitionId)) {
      this.favorites.delete(transitionId);
      return false;
    } else {
      this.favorites.add(transitionId);
      return true;
    }
  }

  public isFavorite(transitionId: string): boolean {
    return this.favorites.has(transitionId);
  }

  public addRecent(transitionId: string): void {
    if (transitionId === 'none') return;
    this.recentTransitions = [
      transitionId,
      ...this.recentTransitions.filter((id) => id !== transitionId)
    ].slice(0, 10);
  }

  public getRecents(): string[] {
    return [...this.recentTransitions];
  }
}
