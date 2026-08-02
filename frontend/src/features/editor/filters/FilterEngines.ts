import { FilterParams, FilterEngineType } from "./FilterTypes";

export interface EngineRenderResult {
  engineType: FilterEngineType;
  engineKey: string;
  intensity: number;
  computedAdjustments: Record<string, number | string>;
}

// Single abstract base interface for all 3 rendering engines
export interface IFilterEngine {
  readonly engineType: FilterEngineType;
  evaluate(params: FilterParams, intensity: number): Record<string, number | string>;
}

/**
 * ENGINE 1: Parameterized Color Matrix Engine
 * Responsible for: Colour, Nature, Black & White (75 Filters)
 */
export class ColorMatrixEngine implements IFilterEngine {
  readonly engineType: FilterEngineType = "ColorMatrixEngine";

  evaluate(params: FilterParams, intensity: number): Record<string, number | string> {
    const factor = Math.max(0, Math.min(100, intensity)) / 100;
    const result: Record<string, number> = {};

    const numericKeys: (keyof FilterParams)[] = [
      "brightness",
      "contrast",
      "exposure",
      "saturation",
      "temperature",
      "tint",
      "hue",
      "vibrance",
      "whites",
      "blacks",
      "highlights",
      "shadows",
      "gamma",
    ];

    numericKeys.forEach((key) => {
      const val = params[key];
      if (typeof val === "number") {
        result[key] = Math.round(val * factor);
      }
    });

    return result;
  }
}

/**
 * ENGINE 2: 3D LUT & Split Tone Engine
 * Responsible for: Portrait, Cinematic, Vintage & Retro (75 Filters)
 */
export class LUTSplitToneEngine implements IFilterEngine {
  readonly engineType: FilterEngineType = "LUTSplitToneEngine";

  evaluate(params: FilterParams, intensity: number): Record<string, number | string> {
    const factor = Math.max(0, Math.min(100, intensity)) / 100;
    const result: Record<string, number | string> = {};

    if (params.lutKey) {
      result.lutKey = params.lutKey;
    }
    if (params.shadowTint) {
      result.shadowTint = params.shadowTint;
    }
    if (params.highlightTint) {
      result.highlightTint = params.highlightTint;
    }

    const numericKeys: (keyof FilterParams)[] = [
      "skinSmoothness",
      "raisedBlacks",
      "filmFade",
      "contrast",
      "saturation",
      "temperature",
    ];

    numericKeys.forEach((key) => {
      const val = params[key];
      if (typeof val === "number") {
        result[key] = Math.round(val * factor);
      }
    });

    return result;
  }
}

/**
 * ENGINE 3: Multi-Pass Shader Engine
 * Responsible for: Neon & Cyber, Creative & Artistic (50 Filters)
 */
export class MultiPassShaderEngine implements IFilterEngine {
  readonly engineType: FilterEngineType = "MultiPassShaderEngine";

  evaluate(params: FilterParams, intensity: number): Record<string, number | string> {
    const factor = Math.max(0, Math.min(100, intensity)) / 100;
    const result: Record<string, number | string> = {};

    if (params.duotonePrimary) {
      result.duotonePrimary = params.duotonePrimary;
    }
    if (params.duotoneSecondary) {
      result.duotoneSecondary = params.duotoneSecondary;
    }

    const numericKeys: (keyof FilterParams)[] = [
      "chromaticAberration",
      "glowIntensity",
      "prismSpread",
      "rgbSplitShift",
    ];

    numericKeys.forEach((key) => {
      const val = params[key];
      if (typeof val === "number") {
        result[key] = Math.round(val * factor);
      }
    });

    return result;
  }
}

/**
 * Filter Engine Registry: Centralized execution router for the 3 engines
 */
export class FilterEngineManager {
  private engines: Map<FilterEngineType, IFilterEngine> = new Map();

  constructor() {
    this.registerEngine(new ColorMatrixEngine());
    this.registerEngine(new LUTSplitToneEngine());
    this.registerEngine(new MultiPassShaderEngine());
  }

  public registerEngine(engine: IFilterEngine): void {
    this.engines.set(engine.engineType, engine);
  }

  public processFilter(
    engineType: FilterEngineType,
    engineKey: string,
    params: FilterParams | undefined,
    intensity: number
  ): EngineRenderResult {
    const engine = this.engines.get(engineType) || this.engines.get("ColorMatrixEngine")!;
    const computedAdjustments = engine.evaluate(params || {}, intensity);

    return {
      engineType,
      engineKey,
      intensity,
      computedAdjustments,
    };
  }
}

export const filterEngineManager = new FilterEngineManager();
