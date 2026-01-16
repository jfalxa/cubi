import type { Grid } from "$/stage/grid";

interface GridInit {
  width?: number;
  depth?: number;
  spacing?: number;
  layer?: number;
}

export class GridStore {
  width = $state(0);
  depth = $state(0);
  layer = $state(0);

  showGridForm = $state(false);

  constructor(init?: GridInit) {
    this.width = init?.width ?? 100;
    this.depth = init?.depth ?? 100;
    this.layer = init?.layer ?? 0;
  }

  update({ width, depth, layer }: GridInit) {
    if (width !== undefined) this.width = width;
    if (depth !== undefined) this.depth = depth;
    if (layer !== undefined) this.layer = layer;
  }
}

export function useGridSync(gridStore: GridStore, grid: Grid) {
  $effect(() => {
    grid.setSize(gridStore.width, gridStore.depth);
    grid.setLayer(gridStore.layer);
  });
}
