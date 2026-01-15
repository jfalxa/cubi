import type { Commands } from "$/commands";
import type { Stage } from "$/stage";
import type { Interactive } from "$/stage/interactions";
import type { ContextMenuStore } from "$/stores/context-menu.svelte";
import type { GridStore } from "$/stores/grid.svelte";
import type { MeasureStore } from "$/stores/measure.svelte";
import type { SelectionStore } from "$/stores/selection.svelte";
import type { ShapeStore } from "$/stores/shape.svelte";

import { ContextMenuTool } from "./context-menu";
import { DrawTool } from "./draw";
import { LayerTool } from "./layer";
import { MoveTool } from "./move";
import { ResizeTool } from "./resize";
import { SelectionTool } from "./selection";

interface Dependencies {
  stage: Stage;
  commands: Commands;
  selection: SelectionStore;
  shapes: ShapeStore;
  contextMenu: ContextMenuStore;
  grid: GridStore;
  measure: MeasureStore;
}

export class Tools {
  selection: SelectionTool;
  layer: LayerTool;
  contextMenu: ContextMenuTool;
  draw: DrawTool;
  resize: ResizeTool;
  move: MoveTool;

  constructor({
    stage,
    commands,
    selection,
    shapes,
    contextMenu,
    grid,
    measure,
  }: Dependencies) {
    this.layer = new LayerTool(stage, {
      onLayer: (layer) => {
        grid.update({ layer });
        this.draw.reset();
        this.selection.clear();
      },
    });

    this.selection = new SelectionTool(stage, {
      onSelect: (ids) => selection.set(ids),
    });

    this.draw = new DrawTool(stage, {
      onDraw: (shape, position) => {
        measure.update(shape, position);
      },
      onCommit: (shape) => {
        shapes.add(shape);
      },
      onCancel: () => {
        measure.clear();
      },
    });

    this.resize = new ResizeTool(stage, {
      onResizeStart: () => {
        return selection.getSelectedShapes();
      },
      onResize: (resizedShapes, box, position) => {
        shapes.patch(...resizedShapes);
        measure.update(box, position);
      },
      onResizeEnd: () => {
        shapes.commit();
        measure.clear();
      },
    });

    this.move = new MoveTool(stage, {
      onMoveStart: () => {
        return selection.getSelectedShapes();
      },
      onMove: (movedShapes) => {
        shapes.patch(...movedShapes);
      },
      onMoveEnd: () => {
        shapes.commit();
      },
    });

    this.contextMenu = new ContextMenuTool(stage, {
      onContextMenu: (id, position) => {
        const available = commands.available(id);
        contextMenu.update(available, position);
      },
    });
  }

  dispose() {
    this.selection.dispose();
    this.contextMenu.dispose();
    this.draw.dispose();
    this.move.dispose();
  }
}

export interface Tool extends Interactive {
  dispose(): void;
}
