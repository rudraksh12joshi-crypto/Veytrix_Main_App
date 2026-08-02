import { Command } from "../Command";
import { VideoClip } from "../../types/editor.types";

export interface TrimCommandParams {
  clipId: string;
  previousClips: VideoClip[];
  nextClips: VideoClip[];
  previousTotalDuration: number;
  nextTotalDuration: number;
  applyClips: (clips: VideoClip[], totalDur: number) => void;
}

export class TrimCommand implements Command {
  public id: string;
  public name = "TrimCommand";

  constructor(private params: TrimCommandParams) {
    this.id = `trim-${Date.now()}`;
  }

  public execute(): void {
    this.params.applyClips(this.params.nextClips, this.params.nextTotalDuration);
  }

  public undo(): void {
    this.params.applyClips(this.params.previousClips, this.params.previousTotalDuration);
  }

  public redo(): void {
    this.execute();
  }
}
