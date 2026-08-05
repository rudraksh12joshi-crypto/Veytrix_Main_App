import { ITransitionStrategy } from './TransitionStrategy';
import {
  OpacityStrategy,
  TransformStrategy,
  ZoomStrategy,
  Rotation3DStrategy,
  BlurStrategy,
  CameraStrategy,
  GlitchStrategy,
  LightingStrategy
} from './TransitionStrategy';

export class TransitionEngineFactory {
  private static instance: TransitionEngineFactory | null = null;
  private strategyRegistry: Map<string, ITransitionStrategy> = new Map();
  private defaultStrategy: ITransitionStrategy;

  private constructor() {
    // Default fallback strategy
    this.defaultStrategy = new OpacityStrategy();
    this.registerBuiltInStrategies();
  }

  public static getInstance(): TransitionEngineFactory {
    if (!TransitionEngineFactory.instance) {
      TransitionEngineFactory.instance = new TransitionEngineFactory();
    }
    return TransitionEngineFactory.instance;
  }

  private registerBuiltInStrategies(): void {
    this.registerStrategy(new OpacityStrategy());
    this.registerStrategy(new TransformStrategy());
    this.registerStrategy(new ZoomStrategy());
    this.registerStrategy(new Rotation3DStrategy());
    this.registerStrategy(new BlurStrategy());
    this.registerStrategy(new CameraStrategy());
    this.registerStrategy(new GlitchStrategy());
    this.registerStrategy(new LightingStrategy());
  }

  /**
   * Registers a new transition strategy mapping its supported engine keys in O(1) lookup.
   * Open/Closed Principle: Allows adding new strategies without modifying existing engine core code.
   */
  public registerStrategy(strategy: ITransitionStrategy): void {
    for (const key of strategy.supportedEngineKeys) {
      this.strategyRegistry.set(key, strategy);
    }
  }

  public getStrategy(engineKey: string): ITransitionStrategy {
    const strategy = this.strategyRegistry.get(engineKey);
    if (!strategy) {
      console.warn(`[TransitionEngineFactory] Engine key "${engineKey}" not registered. Falling back to default OpacityStrategy.`);
      return this.defaultStrategy;
    }
    return strategy;
  }

  public getRegisteredEngineKeys(): string[] {
    return Array.from(this.strategyRegistry.keys());
  }

  public getRegisteredStrategies(): ITransitionStrategy[] {
    const unique = new Set<ITransitionStrategy>(this.strategyRegistry.values());
    return Array.from(unique);
  }
}
