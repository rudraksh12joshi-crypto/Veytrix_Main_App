import { Command } from "./Command";

export class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  public execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
  }

  public undo(): void {
    if (!this.canUndo()) return;
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  }

  public redo(): void {
    if (!this.canRedo()) return;
    const command = this.redoStack.pop();
    if (command) {
      command.redo();
      this.undoStack.push(command);
    }
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  public getUndoCount(): number {
    return this.undoStack.length;
  }

  public getRedoCount(): number {
    return this.redoStack.length;
  }
}

export const commandManager = new CommandManager();
