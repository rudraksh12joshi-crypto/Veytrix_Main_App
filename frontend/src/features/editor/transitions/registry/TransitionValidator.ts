import { TransitionModel, ValidationError, ValidationResult } from './TransitionTypes';

export class TransitionValidator {
  public static validate(transitions: TransitionModel[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const seenIds = new Set<string>();

    for (const item of transitions) {
      // 1. Duplicate ID Check
      if (!item.id) {
        errors.push({
          transitionId: item.id || 'UNKNOWN',
          field: 'id',
          message: 'Missing transition ID',
          severity: 'error'
        });
      } else if (seenIds.has(item.id)) {
        errors.push({
          transitionId: item.id,
          field: 'id',
          message: `Duplicate transition ID detected: ${item.id}`,
          severity: 'error'
        });
      } else {
        seenIds.add(item.id);
      }

      // 2. Required Text Fields Check
      if (!item.name || item.name.trim() === '') {
        errors.push({
          transitionId: item.id,
          field: 'name',
          message: 'Missing transition name',
          severity: 'error'
        });
      }

      if (!item.category || item.category.trim() === '') {
        errors.push({
          transitionId: item.id,
          field: 'category',
          message: 'Missing transition category',
          severity: 'error'
        });
      }

      if (!item.engineKey || item.engineKey.trim() === '') {
        errors.push({
          transitionId: item.id,
          field: 'engineKey',
          message: 'Missing engineKey for transition',
          severity: 'error'
        });
      }

      // 3. Plan Validation
      if (!item.plan || !['FREE', 'PRO', 'PREMIUM'].includes(item.plan)) {
        errors.push({
          transitionId: item.id,
          field: 'plan',
          message: `Invalid or missing plan tier: ${item.plan}`,
          severity: 'error'
        });
      }

      // 4. Duration Bounds Check
      if (
        typeof item.duration !== 'number' ||
        item.duration <= 0 ||
        item.minDuration < 0.05 ||
        item.maxDuration > 10.0 ||
        item.minDuration > item.maxDuration
      ) {
        errors.push({
          transitionId: item.id,
          field: 'duration',
          message: `Invalid duration configuration: duration=${item.duration}, min=${item.minDuration}, max=${item.maxDuration}`,
          severity: 'error'
        });
      }

      // 5. Assets Reference Verification
      if (!item.thumbnail || item.thumbnail.trim() === '') {
        warnings.push({
          transitionId: item.id,
          field: 'thumbnail',
          message: 'Missing thumbnail asset path',
          severity: 'warning'
        });
      }

      if (!item.preview || item.preview.trim() === '') {
        warnings.push({
          transitionId: item.id,
          field: 'preview',
          message: 'Missing preview asset path',
          severity: 'warning'
        });
      }
    }

    if (errors.length > 0) {
      console.error(`[TransitionValidator] Found ${errors.length} validation errors:`, errors);
    }
    if (warnings.length > 0) {
      console.warn(`[TransitionValidator] Found ${warnings.length} validation warnings:`, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalChecked: transitions.length
    };
  }
}
