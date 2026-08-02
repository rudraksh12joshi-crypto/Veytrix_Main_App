import { FilterItem, FilterParams, FilterEngineType } from "./FilterTypes";
import rawCatalog from "../../../data/catalog/parsed_filters.json";

// Parameter calculation helper per category family
function generateParametersForFilter(id: string, category: string, index: number): { engineType: FilterEngineType; engineKey: string; params: FilterParams } {
  // Category Family 1: Color Matrix Engine (Colour, Nature, Black & White)
  if (category === "Colour") {
    const shift = (index % 10) * 5;
    return {
      engineType: "ColorMatrixEngine",
      engineKey: `color_matrix_${id}`,
      params: {
        saturation: 10 + shift,
        contrast: 5 + (shift / 2),
        temperature: (index % 2 === 0 ? 1 : -1) * (10 + shift),
        vibrance: 15 + shift,
      },
    };
  }

  if (category === "Nature") {
    const shift = (index % 10) * 4;
    return {
      engineType: "ColorMatrixEngine",
      engineKey: `color_matrix_${id}`,
      params: {
        saturation: 15 + shift,
        temperature: index % 2 === 0 ? 15 : -10,
        tint: index % 3 === 0 ? -12 : 8,
        highlights: -10,
        shadows: 15,
      },
    };
  }

  if (category === "Black & White") {
    const contrastVal = 15 + (index % 10) * 6;
    return {
      engineType: "ColorMatrixEngine",
      engineKey: `color_matrix_${id}`,
      params: {
        saturation: -100,
        contrast: contrastVal,
        brightness: index % 2 === 0 ? 5 : -5,
        blacks: index % 4 === 0 ? -20 : 0,
      },
    };
  }

  // Category Family 2: 3D LUT & Split Tone Engine (Portrait, Cinematic, Vintage & Retro)
  if (category === "Portrait") {
    return {
      engineType: "LUTSplitToneEngine",
      engineKey: `lut_splittone_${id}`,
      params: {
        skinSmoothness: 20 + (index % 5) * 10,
        highlightTint: "#FFF4E0",
        shadowTint: "#1A202C",
        saturation: 10,
        contrast: 10,
      },
    };
  }

  if (category === "Cinematic") {
    return {
      engineType: "LUTSplitToneEngine",
      engineKey: `lut_splittone_${id}`,
      params: {
        lutKey: `lut_cinematic_${(index % 5) + 1}`,
        contrast: 25 + (index % 5) * 5,
        shadowTint: "#004B49", // Teal
        highlightTint: "#FF9A00", // Orange
        saturation: 15,
      },
    };
  }

  if (category === "Vintage & Retro") {
    return {
      engineType: "LUTSplitToneEngine",
      engineKey: `lut_splittone_${id}`,
      params: {
        lutKey: `lut_vintage_${(index % 5) + 1}`,
        raisedBlacks: 15 + (index % 5) * 5,
        filmFade: 20,
        temperature: 15,
        contrast: -10,
      },
    };
  }

  // Category Family 3: Multi-Pass Shader Engine (Neon & Cyber, Creative & Artistic)
  if (category === "Neon & Cyber") {
    return {
      engineType: "MultiPassShaderEngine",
      engineKey: `multipass_shader_${id}`,
      params: {
        chromaticAberration: 15 + (index % 5) * 5,
        glowIntensity: 25 + (index % 5) * 10,
        duotonePrimary: "#FF007F", // Magenta
        duotoneSecondary: "#00E5FF", // Cyan
      },
    };
  }

  // Creative & Artistic
  return {
    engineType: "MultiPassShaderEngine",
    engineKey: `multipass_shader_${id}`,
    params: {
      prismSpread: 12 + (index % 5) * 4,
      rgbSplitShift: 10 + (index % 5) * 5,
      glowIntensity: 15,
    },
  };
}

// Map all 200 catalog entries dynamically
export const MASTER_FILTER_CATALOG: FilterItem[] = (rawCatalog as any[]).map((item, idx) => {
  const { engineType, engineKey, params } = generateParametersForFilter(item.id, item.category, idx);
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    requiredPlan: item.requiredPlan,
    engineType,
    engineKey,
    version: item.version || "1.0.0",
    description: item.description || `${item.name} from ${item.category}`,
    enabled: item.enabled ?? true,
    type: "FILTERS",
    adjustments: params,
  };
});
