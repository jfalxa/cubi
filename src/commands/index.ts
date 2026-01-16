import hotkeys from "hotkeys-js";

import type { SelectionStore } from "$/stores/selection.svelte";
import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";

import { DeleteCommand } from "./delete";
import { DuplicateCommand } from "./duplicate";
import { OpenCommand, SaveCommand } from "./file";
import { GroupCommand, UngroupCommand } from "./group";
import { RedoCommand, UndoCommand } from "./history";
import { NewCommand } from "./new";
import { RotateCCWCommand, RotateCWCommand } from "./rotate";
import { ColorsCommand } from "./colors";
import { SizeCommand } from "./size";
import type { GridStore } from "$/stores/grid.svelte";
import type { ContextMenuStore } from "$/stores/context-menu.svelte";

export interface Dependencies {
  selection: SelectionStore;
  shapes: ShapeStore;
  grid: GridStore;
  contextMenu: ContextMenuStore;
}

export class Commands {
  open: OpenCommand;
  save: SaveCommand;
  undo: UndoCommand;
  redo: RedoCommand;
  new: NewCommand;
  delete: DeleteCommand;
  duplicate: DuplicateCommand;
  rotateClockwise: RotateCWCommand;
  rotateCounterclockwise: RotateCCWCommand;
  group: GroupCommand;
  ungroup: UngroupCommand;
  colors: ColorsCommand;
  size: SizeCommand;

  private shapeStore: ShapeStore;
  private selectionStore: SelectionStore;
  private commands!: Command[];

  constructor({ shapes, selection, grid, contextMenu }: Dependencies) {
    this.open = new OpenCommand(shapes);
    this.save = new SaveCommand(shapes);
    this.new = new NewCommand(shapes, contextMenu);
    this.undo = new UndoCommand(shapes, selection);
    this.redo = new RedoCommand(shapes, selection);
    this.delete = new DeleteCommand(shapes, selection);
    this.duplicate = new DuplicateCommand(shapes, selection);
    this.rotateClockwise = new RotateCWCommand(shapes);
    this.rotateCounterclockwise = new RotateCCWCommand(shapes);
    this.group = new GroupCommand(shapes);
    this.ungroup = new UngroupCommand(shapes);
    this.colors = new ColorsCommand(shapes);
    this.size = new SizeCommand(grid);

    this.shapeStore = shapes;
    this.selectionStore = selection;

    this.initCommands();
    this.initHotkeys();
  }

  available(id?: string): AvailableCommand[] {
    const context = this.context(id);
    const available = this.commands.filter((cmd) => cmd.isAvailable(context));
    return available.map((cmd) => ({
      label: cmd.label,
      group: cmd.group,
      options: cmd.options,
      action: (option?: string) => cmd.execute(context, option),
    }));
  }

  context(id?: string) {
    if (id === undefined) {
      return [];
    } else if (this.selectionStore.has(id)) {
      return this.selectionStore.getSelectedShapes();
    } else {
      const shape = this.shapeStore.current.find((s) => s.id === id);
      if (!shape) return [];
      if (!shape.group) return [shape];
      return this.shapeStore.current.filter((s) => s.group === shape.group);
    }
  }

  initCommands() {
    this.commands = [
      this.undo,
      this.redo,
      this.delete,
      this.duplicate,
      this.group,
      this.ungroup,
      this.colors,
      this.rotateClockwise,
      this.rotateCounterclockwise,
      this.size,
      this.new,
      this.open,
      this.save,
    ];
  }

  initHotkeys() {
    for (const command of this.commands) {
      const keys = command.shortcuts?.join(",");
      if (!keys) continue;
      hotkeys(keys, (e) => {
        e.preventDefault();
        command.execute(this.selectionStore.getSelectedShapes());
      });
    }
  }
}

export interface AvailableCommand {
  label: string;
  group: string;
  options?: Record<string, string>;
  action: (option?: string) => void;
}

export interface Command {
  label: string;
  group: string;
  options?: Record<string, string>;
  shortcuts?: string[];
  isAvailable(context: Shape[]): boolean;
  execute(context: Shape[], option?: string): void;
}
