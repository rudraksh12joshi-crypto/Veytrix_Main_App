import { TransitionModel } from '../registry/TransitionTypes';
import { TransitionEngineOptions } from './TransitionEngineTypes';

export class TransitionExecutionContext {
  public readonly model: TransitionModel;
  public readonly options: TransitionEngineOptions;
  public readonly createdAt: number;

  constructor(model: TransitionModel, options: TransitionEngineOptions = {}) {
    this.model = model;
    this.options = options;
    this.createdAt = Date.now();
  }

  public get id(): string {
    return this.model.id;
  }

  public get engineKey(): string {
    return this.model.engineKey;
  }

  public get category(): string {
    return this.model.category;
  }

  public get rawParameters(): Record<string, any> {
    return this.model.parameters || {};
  }

  public get parameterOverrides(): Record<string, any> | undefined {
    return this.options.parameterOverrides;
  }
}
