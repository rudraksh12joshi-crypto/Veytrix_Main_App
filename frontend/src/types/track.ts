import { Clip } from "./clip";
import { TrackType } from "@/src/constants/editor";

export interface Track {
  id: string;
  type: TrackType;
  label?: string;
  order: number;
  locked: boolean;
  muted: boolean;
  visible: boolean;
  clips: Clip[];
}
