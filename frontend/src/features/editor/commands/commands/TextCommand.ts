import { Command } from "../Command";
import { TextLayer } from "../../types/editor.types";

export interface TextCommandParams {
  previousLayers: TextLayer[];
  nextLayers: TextLayer[];
  selectedId: string | null;
  applyTextLayers: (layers: TextLayer[], selectedId: string | null) => void;
}

export class TextCommand implements Command {
  public id: string;
  public name = "TextCommand";

  constructor(private params: TextCommandParams) {
    this.id = `text-${Date.now()}`;
  }

  public execute(): void {
    this.params.applyTextLayers(this.params.nextLayers, this.params.selectedId);
  }

  public undo(): void {
    this.params.applyTextLayers(this.params.previousLayers, this.params.selectedId);
  }

  public redo(): void {
    this.execute();
  }
}
