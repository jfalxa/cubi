import type { Stage } from "$/stage";

export interface GridInit {
  width: number;
  depth: number;
  height: number;
  unit: number;
}

export const DEFAULT_GRID: GridInit = {
  width: 100,
  depth: 100,
  height: 20,
  unit: 0.1,
};

export class GridStore {
  width = $state(0);
  depth = $state(0);
  unit = $state(0);
  layer = $state(0);

  cutOff = $state(false);
  height = $state(0);
  level = $derived(Math.floor(this.layer / this.height));

  showGridForm = $state(false);

  constructor(init?: Partial<GridInit>) {
    this.width = init?.width ?? DEFAULT_GRID.width;
    this.depth = init?.depth ?? DEFAULT_GRID.depth;
    this.height = init?.height ?? DEFAULT_GRID.height;
    this.unit = init?.unit ?? DEFAULT_GRID.unit;
    this.layer = 0;
  }

  setLayer(layer: number) {
    this.layer = Math.max(0, layer);
  }

  setLevel(level: number) {
    this.setLayer(level * this.height);
  }

  update({ width, depth, unit, height }: Partial<GridInit>) {
    if (width !== undefined) this.width = width;
    if (depth !== undefined) this.depth = depth;
    if (height !== undefined) this.height = height;
    if (unit !== undefined) this.unit = unit;
  }

  reset() {
    this.update(DEFAULT_GRID);
  }
}

export function useGridSync(gridStore: GridStore, stage: Stage) {
  const { grid, view } = stage;

  $effect(() => {
    grid.setSize(gridStore.width, gridStore.depth);
    grid.setLayer(gridStore.layer);
    grid.setUnit(gridStore.unit);
  });

  $effect(() => {
    const minY = gridStore.level * gridStore.height;

    const maxY = gridStore.cutOff
      ? (gridStore.level + 1) * gridStore.height
      : Infinity;

    for (const mesh of view.getMeshes()) {
      mesh.setCutOff(minY, maxY);
    }
  });
}
