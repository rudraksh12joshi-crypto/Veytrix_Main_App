import { TransitionModel, TransitionPlan, RegistryMetrics, ValidationResult } from './TransitionTypes';
import { TransitionLoader } from './TransitionLoader';
import { TransitionValidator } from './TransitionValidator';

export class TransitionRegistry {
  private static instance: TransitionRegistry | null = null;

  private transitions: TransitionModel[] = [];
  private byIdMap: Map<string, TransitionModel> = new Map();
  private byCategoryMap: Map<string, TransitionModel[]> = new Map();
  private byPlanMap: Map<TransitionPlan, TransitionModel[]> = new Map();
  private byEngineMap: Map<string, TransitionModel[]> = new Map();
  private byTagMap: Map<string, TransitionModel[]> = new Map();

  private isInitialized = false;
  private validationResult: ValidationResult | null = null;
  private metrics: RegistryMetrics | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): TransitionRegistry {
    if (!TransitionRegistry.instance) {
      TransitionRegistry.instance = new TransitionRegistry();
    }
    return TransitionRegistry.instance;
  }

  public initialize(forceReload = false): void {
    if (this.isInitialized && !forceReload) {
      return;
    }

    const startTime = performance.now();
    const rawCatalog = TransitionLoader.loadCatalog();

    // Reset maps
    this.transitions = [];
    this.byIdMap.clear();
    this.byCategoryMap.clear();
    this.byPlanMap.clear();
    this.byEngineMap.clear();
    this.byTagMap.clear();

    let freeCount = 0;
    let proCount = 0;
    let premiumCount = 0;

    for (const item of rawCatalog) {
      if (!item.enabled) continue;

      this.transitions.push(item);

      // Index by ID
      this.byIdMap.set(item.id, item);

      // Index by Category
      const catList = this.byCategoryMap.get(item.category) || [];
      catList.push(item);
      this.byCategoryMap.set(item.category, catList);

      // Index by Plan
      const planList = this.byPlanMap.get(item.plan) || [];
      planList.push(item);
      this.byPlanMap.set(item.plan, planList);

      if (item.plan === 'FREE') freeCount++;
      else if (item.plan === 'PRO') proCount++;
      else if (item.plan === 'PREMIUM') premiumCount++;

      // Index by Engine
      const engineList = this.byEngineMap.get(item.engineKey) || [];
      engineList.push(item);
      this.byEngineMap.set(item.engineKey, engineList);

      // Index by Tags
      for (const tag of item.tags) {
        const normalizedTag = tag.toLowerCase().trim();
        const tagList = this.byTagMap.get(normalizedTag) || [];
        tagList.push(item);
        this.byTagMap.set(normalizedTag, tagList);
      }
    }

    // Run Validation
    this.validationResult = TransitionValidator.validate(this.transitions);

    const endTime = performance.now();
    const initTime = Math.round((endTime - startTime) * 100) / 100;

    // Estimate memory usage (approx 1.2 KB per object + map overhead)
    const estMemKb = Math.round((this.transitions.length * 1.2 * 100)) / 100;

    this.metrics = {
      totalTransitions: this.transitions.length,
      categoriesDetected: Array.from(this.byCategoryMap.keys()),
      engineGroupsDetected: Array.from(this.byEngineMap.keys()),
      freeCount,
      proCount,
      premiumCount,
      duplicateIdCheckPassed: this.validationResult.isValid,
      missingAssetCheckPassed: this.validationResult.warnings.length === 0,
      initializationTimeMs: initTime,
      estimatedMemoryUsageKb: estMemKb,
      isCached: true
    };

    this.isInitialized = true;
  }

  // --- PUBLIC API METHODS ---

  public getAllTransitions(): TransitionModel[] {
    return [...this.transitions];
  }

  public getTransitionById(id: string): TransitionModel | undefined {
    return this.byIdMap.get(id);
  }

  public getTransitionsByCategory(category: string): TransitionModel[] {
    return [...(this.byCategoryMap.get(category) || [])];
  }

  public getTransitionsByPlan(plan: TransitionPlan): TransitionModel[] {
    return [...(this.byPlanMap.get(plan) || [])];
  }

  public getTransitionsByEngine(engineKey: string): TransitionModel[] {
    return [...(this.byEngineMap.get(engineKey) || [])];
  }

  public getFreeTransitions(): TransitionModel[] {
    return this.getTransitionsByPlan('FREE');
  }

  public getProTransitions(): TransitionModel[] {
    return this.getTransitionsByPlan('PRO');
  }

  public getPremiumTransitions(): TransitionModel[] {
    return this.getTransitionsByPlan('PREMIUM');
  }

  public searchTransitions(query: string): TransitionModel[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllTransitions();

    return this.transitions.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.subcategory.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  public hasTransition(id: string): boolean {
    return this.byIdMap.has(id);
  }

  public countTransitions(): number {
    return this.transitions.length;
  }

  public getCategories(): string[] {
    return Array.from(this.byCategoryMap.keys());
  }

  public getEngines(): string[] {
    return Array.from(this.byEngineMap.keys());
  }

  public getValidationResult(): ValidationResult | null {
    return this.validationResult;
  }

  public getMetrics(): RegistryMetrics | null {
    return this.metrics;
  }
}
