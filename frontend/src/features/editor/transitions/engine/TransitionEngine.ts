import { TransitionModel, TransitionPlan } from '../registry/TransitionTypes';
import { TransitionRegistry } from '../registry/TransitionRegistry';
import { TransitionInstance, TransitionEngineOptions, EngineValidationResult, EngineMetrics } from './TransitionEngineTypes';
import { TransitionExecutionContext } from './TransitionExecutionContext';
import { TransitionEngineFactory } from './TransitionEngineFactory';
import { TransitionValidation } from './TransitionValidation';
import { TransitionDurationResolver } from './TransitionDurationResolver';
import { TransitionParameterResolver } from './TransitionParameterResolver';
import { ITransitionStrategy } from './TransitionStrategy';

export class TransitionEngine {
  private static instance: TransitionEngine | null = null;
  private factory: TransitionEngineFactory;
  private registry: TransitionRegistry;
  private instanceCache: Map<string, TransitionInstance> = new Map();

  private instancesCreated = 0;
  private cacheHits = 0;
  private initTimeMs = 0;

  private constructor() {
    const t0 = performance.now();
    this.factory = TransitionEngineFactory.getInstance();
    this.registry = TransitionRegistry.getInstance();
    const t1 = performance.now();
    this.initTimeMs = Math.round((t1 - t0) * 100) / 100;
  }

  public static getInstance(): TransitionEngine {
    if (!TransitionEngine.instance) {
      TransitionEngine.instance = new TransitionEngine();
    }
    return TransitionEngine.instance;
  }

  public createTransitionInstance(
    idOrModel: string | TransitionModel,
    options: TransitionEngineOptions = {}
  ): TransitionInstance | null {
    let model: TransitionModel | undefined;

    if (typeof idOrModel === 'string') {
      model = this.registry.getTransitionById(idOrModel);
    } else {
      model = idOrModel;
    }

    if (!model) {
      console.error(`[TransitionEngine] Transition model not found: ${idOrModel}`);
      return null;
    }

    // Cache key incorporates overrides if present
    const hasOverrides = options.userDurationOverride || options.parameterOverrides || options.timelineConstraint;
    const cacheKey = `${model.id}_${options.userDurationOverride || 'def'}_${options.timelineConstraint || 'none'}`;

    if (!hasOverrides && this.instanceCache.has(cacheKey)) {
      this.cacheHits++;
      return this.instanceCache.get(cacheKey)!;
    }

    const context = new TransitionExecutionContext(model, options);
    const strategy = this.factory.getStrategy(model.engineKey);

    const instance = strategy.execute(context);
    this.instancesCreated++;

    if (!hasOverrides) {
      this.instanceCache.set(cacheKey, instance);
    }

    return instance;
  }

  public validateTransition(
    idOrModel: string | TransitionModel,
    userPlan?: TransitionPlan
  ): EngineValidationResult {
    let model: TransitionModel | undefined;

    if (typeof idOrModel === 'string') {
      model = this.registry.getTransitionById(idOrModel);
    } else {
      model = idOrModel;
    }

    const supportedEngines = new Set(this.factory.getRegisteredEngineKeys());
    return TransitionValidation.validate(model!, supportedEngines, userPlan);
  }

  public resolveParameters(
    idOrModel: string | TransitionModel,
    userOverrides?: Record<string, any>
  ): Record<string, any> {
    const model = typeof idOrModel === 'string' ? this.registry.getTransitionById(idOrModel) : idOrModel;
    if (!model) return { easing: 'easeInOutCubic', intensity: 1.0 };
    return TransitionParameterResolver.resolve(model, userOverrides);
  }

  public resolveDuration(
    idOrModel: string | TransitionModel,
    userOverride?: number,
    timelineConstraint?: number
  ): number {
    const model = typeof idOrModel === 'string' ? this.registry.getTransitionById(idOrModel) : idOrModel;
    if (!model) return 0.5;
    return TransitionDurationResolver.resolve(model, userOverride, timelineConstraint);
  }

  public supportsRealtimePreview(engineKey: string): boolean {
    return this.factory.getStrategy(engineKey).supportsRealtimePreview;
  }

  public supportsBackendRendering(engineKey: string): boolean {
    return this.factory.getStrategy(engineKey).supportsBackendRender;
  }

  public getExecutionStrategy(engineKey: string): ITransitionStrategy {
    return this.factory.getStrategy(engineKey);
  }

  public clearCache(): void {
    this.instanceCache.clear();
  }

  public getMetrics(): EngineMetrics {
    const totalCalls = this.instancesCreated + this.cacheHits;
    const cacheRatio = totalCalls > 0 ? Math.round((this.cacheHits / totalCalls) * 100) : 100;
    const strategies = this.factory.getRegisteredStrategies();

    return {
      totalStrategiesRegistered: strategies.length,
      supportedEngineKeys: this.factory.getRegisteredEngineKeys(),
      instancesCreatedCount: this.instancesCreated,
      cacheHitRatio: cacheRatio,
      initializationTimeMs: this.initTimeMs,
      memoryUsageKb: Math.round(this.instanceCache.size * 0.8 * 100) / 100
    };
  }
}
