import { TransitionModel, TransitionPlan } from '../registry/TransitionTypes';
import { EngineValidationResult } from './TransitionEngineTypes';

export class TransitionValidation {
  public static validate(
    model: TransitionModel,
    supportedEngines: Set<string>,
    userPlan?: TransitionPlan
  ): EngineValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!model) {
      return {
        isValid: false,
        errors: ['TransitionModel is null or undefined'],
        warnings: [],
        transitionId: 'UNKNOWN'
      };
    }

    // 1. Check Enabled Status
    if (model.enabled === false) {
      errors.push(`Transition "${model.name}" (${model.id}) is disabled in asset catalog`);
    }

    // 2. Engine Key Support Check
    if (!model.engineKey || !supportedEngines.has(model.engineKey)) {
      errors.push(`Unsupported or missing engineKey "${model.engineKey}" for transition ${model.id}`);
    }

    // 3. User Plan Access Check
    if (userPlan) {
      if (userPlan === 'FREE' && (model.plan === 'PRO' || model.plan === 'PREMIUM')) {
        warnings.push(`Transition ${model.id} requires ${model.plan} subscription (Current user plan: FREE)`);
      } else if (userPlan === 'PRO' && model.plan === 'PREMIUM') {
        warnings.push(`Transition ${model.id} requires PREMIUM subscription (Current user plan: PRO)`);
      }
    }

    // 4. Duration Check
    if (!model.duration || model.duration <= 0) {
      warnings.push(`Invalid default duration ${model.duration} for transition ${model.id}. Using default 0.5s.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      transitionId: model.id
    };
  }
}
