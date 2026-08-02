import { Command } from "../Command";
import { ColorAdjustments } from "../../types/editor.types";

export interface AdjustCommandParams {
  clipId: string;
  previousAdjustments: ColorAdjustments;
  nextAdjustments: ColorAdjustments;
  applyAdjustments: (clipId: string, adjustments: ColorAdjustments) => void;
}

export class AdjustCommand implements Command {
  public id: string;
  public name = "AdjustCommand";

  constructor(private params: AdjustCommandParams) {
    this.id = `adjust-${Date.now()}`;
  }

  public execute(): void {
    this.params.applyAdjustments(this.params.clipId, this.params.nextAdjustments);
  }

  public undo(): void {
    this.params.applyAdjustments(this.params.clipId, this.params.previousAdjustments);
  }

  public redo(): void {
    this.execute();
  }
}
