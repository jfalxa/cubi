import hotkeys from "hotkeys-js";

import type { CameraStore } from "$/stores/camera.svelte";
import type { ContextMenuStore } from "$/stores/context-menu.svelte";
import type { GridStore } from "$/stores/grid.svelte";
import type { SelectionStore } from "$/stores/selection.svelte";
import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";

import { ColorsCommand } from "./colors";
import { DeleteCommand } from "./delete";
import { DuplicateCommand } from "./duplicate";
import { ExportCommand, ImportCommand, OpenCommand, SaveCommand } from "./file";
import { GridCommand } from "./grid";
import { GroupCommand, UngroupCommand } from "./group";
import { RedoCommand, UndoCommand } from "./history";
import { LayerDownCommand, LayerUpCommand } from "./layer";
import { LevelDownCommand, LevelUpCommand } from "./level";
import { LockCommand, UnlockCommand } from "./lock";
import { NewCommand } from "./new";
import { RotateCCWCommand, RotateCWCommand } from "./rotate";
import { ToggleLevelCommand } from "./toggle-level";

export interface Dependencies {
  selection: SelectionStore;
  shapes: ShapeStore;
  camera: CameraStore;
  grid: GridStore;
  contextMenu: ContextMenuStore;
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
  grid: GridCommand;
  lock: LockCommand;
  unlock: UnlockCommand;
  level: ToggleLevelCommand;
  layerUp: LayerUpCommand;
  layerDown: LayerDownCommand;
  levelUp: LevelUpCommand;
  levelDown: LevelDownCommand;

  private shapes: ShapeStore;
  private selection: SelectionStore;
  private commands!: Command[];

  constructor({ shapes, selection, camera, grid, contextMenu }: Dependencies) {
    this.open = new OpenCommand(shapes, grid, camera);
    this.save = new SaveCommand(shapes, grid);
    this.import = new ImportCommand(shapes, grid, camera);
    this.export = new ExportCommand(shapes, grid);
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
    this.grid = new GridCommand(grid);
    this.lock = new LockCommand(shapes);
    this.unlock = new UnlockCommand(shapes);
    this.level = new ToggleLevelCommand(grid);
    this.layerUp = new LayerUpCommand(grid);
    this.layerDown = new LayerDownCommand(grid);
    this.levelUp = new LevelUpCommand(grid, camera);
    this.levelDown = new LevelDownCommand(grid, camera);

    this.shapes = shapes;
    this.selection = selection;

    this.initCommands();
    this.initHotkeys();
  }

  available(id?: string): AvailableCommand[] {
    const context = this.context(id);

    const available = this.commands.filter(
      (cmd) => !cmd.hidden && cmd.isAvailable(context),
    );

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
      this.lock,
      this.unlock,
      this.colors,
      this.rotateClockwise,
      this.rotateCounterclockwise,
      this.grid,
      this.layerUp,
      this.layerDown,
      this.levelUp,
      this.levelDown,
      this.level,
      this.import,
      this.export,
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
  hidden?: boolean;
  options?: Record<string, string>;
  shortcuts?: string[];
  isAvailable(context: Shape[]): boolean;
  execute(context: Shape[], option?: string): void;
}
