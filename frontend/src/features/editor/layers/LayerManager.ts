import { UnifiedLayer } from "./layer.types";

export class LayerManager {
  private layers: Map<string, UnifiedLayer> = new Map();
  private selectedLayerId: string | null = null;

  public addLayer(layer: UnifiedLayer): void {
    this.layers.set(layer.id, layer);
  }

  public removeLayer(id: string): void {
    this.layers.delete(id);
    if (this.selectedLayerId === id) {
      this.selectedLayerId = null;
    }
  }

  public getLayerById(id: string): UnifiedLayer | undefined {
    return this.layers.get(id);
  }

  public selectLayer(id: string | null): void {
    this.selectedLayerId = id;
    this.layers.forEach((layer) => {
      layer.selected = layer.id === id;
    });
  }

  public getSelectedLayer(): UnifiedLayer | null {
    if (!this.selectedLayerId) return null;
    return this.layers.get(this.selectedLayerId) || null;
  }

  public getAllLayers(): UnifiedLayer[] {
    return Array.from(this.layers.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  public updateLayer(id: string, updates: Partial<UnifiedLayer>): void {
    const layer = this.layers.get(id);
    if (layer) {
      this.layers.set(id, { ...layer, ...updates } as UnifiedLayer);
    }
  }

  public clear(): void {
    this.layers.clear();
    this.selectedLayerId = null;
  }
}

export const layerManager = new LayerManager();
