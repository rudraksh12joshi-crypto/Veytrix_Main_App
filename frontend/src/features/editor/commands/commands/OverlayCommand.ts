import { Command } from "../Command";
import { OverlayLayer } from "../../types/editor.types";

export interface OverlayCommandParams {
  previousLayers: OverlayLayer[];
  nextLayers: OverlayLayer[];
  selectedId: string | null;
  applyOverlayLayers: (layers: OverlayLayer[], selectedId: string | null) => void;
}

export class OverlayCommand implements Command {
  public id: string;
  public name = "OverlayCommand";

  constructor(private params: OverlayCommandParams) {
    this.id = `overlay-${Date.now()}`;
  }

  public execute(): void {
    this.params.applyOverlayLayers(this.params.nextLayers, this.params.selectedId);
  }

  public undo(): void {
    this.params.applyOverlayLayers(this.params.previousLayers, this.params.selectedId);
  }

  public redo(): void {
    this.execute();
  }
}
