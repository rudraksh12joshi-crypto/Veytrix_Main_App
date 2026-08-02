import { Command } from "../Command";
import { VideoClip, TextLayer, OverlayLayer } from "../../types/editor.types";

export interface RotateCommandParams {
  targetId: string;
  targetType: "clip" | "text" | "overlay";
  previousRotation: number;
  nextRotation: number;
  applyRotation: (rotation: number) => void;
}

export class RotateCommand implements Command {
  public id: string;
  public name = "RotateCommand";

  constructor(private params: RotateCommandParams) {
    this.id = `rotate-${Date.now()}`;
  }

  public execute(): void {
    this.params.applyRotation(this.params.nextRotation);
  }

  public undo(): void {
    this.params.applyRotation(this.params.previousRotation);
  }

  public redo(): void {
    this.execute();
  }
}
