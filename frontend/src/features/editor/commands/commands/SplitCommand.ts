import { Command } from "../Command";
import { VideoClip } from "../../types/editor.types";

export interface SplitCommandParams {
  previousClips: VideoClip[];
  nextClips: VideoClip[];
  newSelectedClipId: string;
  previousSelectedClipId: string | null;
  applyClips: (clips: VideoClip[], selectedId: string | null) => void;
}

export class SplitCommand implements Command {
  public id: string;
  public name = "SplitCommand";

  constructor(private params: SplitCommandParams) {
    this.id = `split-${Date.now()}`;
  }

  public execute(): void {
    this.params.applyClips(this.params.nextClips, this.params.newSelectedClipId);
  }

  public undo(): void {
    this.params.applyClips(this.params.previousClips, this.params.previousSelectedClipId);
  }

  public redo(): void {
    this.execute();
  }
}
