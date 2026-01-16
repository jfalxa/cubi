import hotkeys from "hotkeys-js";

import type { SelectionStore } from "$/stores/selection.svelte";
import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";

import { DeleteCommand } from "./delete";
import { DuplicateCommand } from "./duplicate";
import { OpenCommand, SaveCommand, ImportCommand, ExportCommand } from "./file";
import { GroupCommand, UngroupCommand } from "./group";
import { RedoCommand, UndoCommand } from "./history";
import { NewCommand } from "./new";
import { PlayCommand } from "./play";
import { RotateCCWCommand, RotateCWCommand } from "./rotate";
import { ColorsCommand } from "./colors";
import { SizeCommand } from "./size";
import type { GridStore } from "$/stores/grid.svelte";
import type { ContextMenuStore } from "$/stores/context-menu.svelte";
import type { ModeStore } from "$/stores/mode.svelte";

export interface Dependencies {
  selection: SelectionStore;
  shapes: ShapeStore;
  grid: GridStore;
  contextMenu: ContextMenuStore;
  mode: ModeStore;
}

export class Commands {
  open: OpenCommand;
  save: SaveCommand;
  import: ImportCommand;
  export: ExportCommand;
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
  play: PlayCommand;

  private shapes: ShapeStore;
  private selection: SelectionStore;
  private commands!: Command[];

  constructor({ shapes, selection, grid, contextMenu, mode }: Dependencies) {
    this.open = new OpenCommand(shapes);
    this.save = new SaveCommand(shapes);
    this.import = new ImportCommand(shapes);
    this.export = new ExportCommand(shapes);
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
    this.play = new PlayCommand(mode);

    this.shapes = shapes;
    this.selection = selection;

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
    } else if (this.selection.has(id)) {
      return this.selection.getSelectedShapes();
    } else {
      const shape = this.shapes.current.find((s) => s.id === id);
      if (!shape) return [];
      if (!shape.group) return [shape];
      return this.shapes.current.filter((s) => s.group === shape.group);
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
      this.import,
      this.export,
      this.new,
      this.open,
      this.save,
      this.play,
    ];
  }

  initHotkeys() {
    for (const command of this.commands) {
      const keys = command.shortcuts?.join(",");
      if (!keys) continue;
      hotkeys(keys, (e) => {
        e.preventDefault();
        command.execute(this.selection.getSelectedShapes());
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
