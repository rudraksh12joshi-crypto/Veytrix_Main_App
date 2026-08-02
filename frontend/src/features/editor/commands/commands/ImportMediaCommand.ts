import { Command } from "../Command";
import { VideoClip } from "../../types/editor.types";

export interface ImportMediaCommandParams {
  previousClips: VideoClip[];
  nextClips: VideoClip[];
  previousTotalDuration: number;
  nextTotalDuration: number;
  newSelectedClipId: string | null;
  applyClips: (clips: VideoClip[], totalDur: number, selectedId: string | null) => void;
}

export class ImportMediaCommand implements Command {
  public id: string;
  public name = "ImportMediaCommand";

  constructor(private params: ImportMediaCommandParams) {
    this.id = `import-${Date.now()}`;
  }

  public execute(): void {
    this.params.applyClips(this.params.nextClips, this.params.nextTotalDuration, this.params.newSelectedClipId);
  }

  public undo(): void {
    this.params.applyClips(this.params.previousClips, this.params.previousTotalDuration, null);
  }

  public redo(): void {
    this.execute();
  }
}
