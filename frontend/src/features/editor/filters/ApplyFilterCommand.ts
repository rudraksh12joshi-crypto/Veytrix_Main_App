import { Command } from "../commands/Command";
import { VideoClip } from "../types/editor.types";

export interface ApplyFilterCommandParams {
  clipId: string;
  previousClips: VideoClip[];
  nextClips: VideoClip[];
  applyClips: (clips: VideoClip[]) => void;
}

export class ApplyFilterCommand implements Command {
  public id: string;
  public name = "ApplyFilterCommand";

  constructor(private params: ApplyFilterCommandParams) {
    this.id = `apply-filter-${Date.now()}`;
  }

  public execute(): void {
    this.params.applyClips(this.params.nextClips);
  }

  public undo(): void {
    this.params.applyClips(this.params.previousClips);
  }

  public redo(): void {
    this.execute();
  }
}
