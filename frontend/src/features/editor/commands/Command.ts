export interface Command {
  id: string;
  name: string;
  execute: () => void;
  undo: () => void;
  redo: () => void;
}
