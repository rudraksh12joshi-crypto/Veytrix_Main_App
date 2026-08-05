import { TransitionInstance, TimelineBehavior } from './TransitionEngineTypes';
import { TransitionExecutionContext } from './TransitionExecutionContext';
import { TransitionDurationResolver } from './TransitionDurationResolver';
import { TransitionParameterResolver } from './TransitionParameterResolver';

export interface ITransitionStrategy {
  readonly strategyName: string;
  readonly supportedEngineKeys: string[];
  readonly supportsRealtimePreview: boolean;
  readonly supportsBackendRender: boolean;
  readonly supportsGPU: boolean;

  execute(context: TransitionExecutionContext): TransitionInstance;
}

export abstract class BaseTransitionStrategy implements ITransitionStrategy {
  abstract readonly strategyName: string;
  abstract readonly supportedEngineKeys: string[];
  abstract readonly supportsRealtimePreview: boolean;
  abstract readonly supportsBackendRender: boolean;
  abstract readonly supportsGPU: boolean;

  protected getTimelineBehavior(duration: number): TimelineBehavior {
    return {
      requiresOverlap: true,
      defaultOverlap: duration / 2,
      supportsHandles: true,
      minOverlap: 0.05,
      maxOverlap: duration
    };
  }

  public execute(context: TransitionExecutionContext): TransitionInstance {
    const { model, options } = context;

    const resolvedDuration = TransitionDurationResolver.resolve(
      model,
      options.userDurationOverride,
      options.timelineConstraint
    );

    const resolvedParameters = TransitionParameterResolver.resolve(
      model,
      options.parameterOverrides
    );

    const easing = resolvedParameters.easing || 'easeInOutCubic';

    return {
      id: model.id,
      name: model.name,
      engineKey: model.engineKey,
      category: model.category,
      subcategory: model.subcategory,
      plan: model.plan,
      duration: resolvedDuration,
      easing,
      parameters: resolvedParameters,
      timelineBehavior: this.getTimelineBehavior(resolvedDuration),
      executionStrategy: this.strategyName,
      supportsRealtimePreview: this.supportsRealtimePreview,
      supportsBackendRender: this.supportsBackendRender,
      supportsGPU: this.supportsGPU,
      enabled: model.enabled,
      metadata: {
        version: model.version,
        description: model.description,
        thumbnail: model.thumbnail,
        preview: model.preview,
        tags: model.tags
      }
    };
  }
}

// 1. Opacity & Color Dissolve Strategy
export class OpacityStrategy extends BaseTransitionStrategy {
  readonly strategyName = 'OpacityStrategy';
  readonly supportedEngineKeys = ['dissolve_color_engine'];
  readonly supportsRealtimePreview = true;
  readonly supportsBackendRender = true;
  readonly supportsGPU = false; // Works on standard 2D Canvas / CPU
}

// 2. 2D Spatial Translation & Push Strategy
export class TransformStrategy extends BaseTransitionStrategy {
  readonly strategyName = 'TransformStrategy';
  readonly supportedEngineKeys = ['spatial_push_engine'];
  readonly supportsRealtimePreview = true;
  readonly supportsBackendRender = true;
  readonly supportsGPU = true;
}

// 3. Focal Scale & Zoom Strategy
export class ZoomStrategy extends BaseTransitionStrategy {
  readonly strategyName = 'ZoomStrategy';
  readonly supportedEngineKeys = ['scale_zoom_engine'];
  readonly supportsRealtimePreview = true;
  readonly supportsBackendRender = true;
  readonly supportsGPU = true;
}

// 4. 3D Matrix Perspective Strategy
export class Rotation3DStrategy extends BaseTransitionStrategy {
  readonly strategyName = 'Rotation3DStrategy';
  readonly supportedEngineKeys = ['3d_rotation_engine'];
  readonly supportsRealtimePreview = true;
  readonly supportsBackendRender = true;
  readonly supportsGPU = true;
}

// 5. Optical & Motion Blur Strategy
export class BlurStrategy extends BaseTransitionStrategy {
  readonly strategyName = 'BlurStrategy';
  readonly supportedEngineKeys = ['optical_blur_engine'];
  readonly supportsRealtimePreview = true;
  readonly supportsBackendRender = true;
  readonly supportsGPU = true;
}

// 6. Dynamic Camera & Shake Strategy
export class CameraStrategy extends BaseTransitionStrategy {
  readonly strategyName = 'CameraStrategy';
  readonly supportedEngineKeys = ['camera_motion_engine'];
  readonly supportsRealtimePreview = true;
  readonly supportsBackendRender = true;
  readonly supportsGPU = true;
}

// 7. Digital Glitch & UV Shader Strategy
export class GlitchStrategy extends BaseTransitionStrategy {
  readonly strategyName = 'GlitchStrategy';
  readonly supportedEngineKeys = ['digital_glitch_engine'];
  readonly supportsRealtimePreview = true;
  readonly supportsBackendRender = true;
  readonly supportsGPU = true;
}

// 8. Photometric Light & Overlay Strategy
export class LightingStrategy extends BaseTransitionStrategy {
  readonly strategyName = 'LightingStrategy';
  readonly supportedEngineKeys = ['photometric_light_engine'];
  readonly supportsRealtimePreview = true;
  readonly supportsBackendRender = true;
  readonly supportsGPU = true;
}
