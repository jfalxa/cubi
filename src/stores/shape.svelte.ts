import type { View } from "$/stage/view";
import type { PartialShape, PartialShapeWithId, Shape } from "$/types";
import { indexById } from "$/utils/collection";
import { createShape, subtractShapes } from "$/utils/shape";

export class ShapeStore {
  current = $state.raw<Shape[]>([]);

  past: Shape[][] = [];
  future: Shape[][] = [];

  private beforePatch?: Shape[];

  add(...shapes: PartialShape[]) {
    this.commit(() => {
      const newShapes = shapes.map(createShape);
      this.current = [...this.current, ...newShapes];
    });
  }

  remove(...shapes: PartialShapeWithId[]) {
    this.commit(() => {
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const removedIds = new Set(shapes.map((s) => s.id));
      this.current = this.current.filter((s) => !removedIds.has(s.id));
    });
  }

  update(...shapes: PartialShapeWithId[]) {
    this.commit(() => {
      this.patch(...shapes);
    });
  }

  carve(shape: Shape) {
    this.commit(() => {
      this.current = this.current.flatMap((s) => subtractShapes(s, shape));
    });
  }

  lock(...shapes: PartialShapeWithId[]) {
    this.update(...shapes.map((s) => ({ ...s, locked: true })));
  }

  unlock(...shapes: PartialShapeWithId[]) {
    this.update(...shapes.map((s) => ({ ...s, locked: false })));
  }

  patch(...shapes: PartialShapeWithId[]) {
    if (this.beforePatch === undefined) {
      this.beforePatch = [...this.current];
    }

    const updateById = indexById(shapes);

    this.current = this.current.map((s) => {
      if (!updateById[s.id]) return s;
      else return { ...s, ...updateById[s.id] };
    });
  }

  commit(update?: () => void) {
    this.past.push([...(this.beforePatch ?? this.current)]);
    this.future.length = 0;
    update?.();
    this.beforePatch = undefined;
  }

  reset(shapes: Shape[] = []) {
    this.past = [];
    this.future = [];
    this.current = shapes;
  }

  canUndo() {
    return this.past.length > 0;
  }

  canRedo() {
    return this.future.length > 0;
  }

  undo() {
    const previous = this.past.pop();
    if (previous === undefined) return;
    this.future.push([...this.current]);
    this.current = previous;
  }

  redo() {
    const next = this.future.pop();
    if (next === undefined) return;
    this.past.push([...this.current]);
    this.current = next;
  }
}

export function useShapeSync(shapeStore: ShapeStore, view: View) {
  $effect(() => {
    const storeShapes = indexById(shapeStore.current);
    const viewShapes = indexById(view.getMeshes());

    for (const id in storeShapes) {
      if (!viewShapes[id]) {
        view.createMesh(storeShapes[id]);
      } else {
        view.updateMesh(storeShapes[id]);
      }
    }

    for (const id in viewShapes) {
      if (!storeShapes[id]) {
        view.deleteMesh(id);
      }
    }
  });
}
