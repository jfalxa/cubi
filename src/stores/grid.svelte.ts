import type { Grid } from "$/stage/grid";

interface GridInit {
  width?: number;
  depth?: number;
  unit?: number;
  layer?: number;
}

const DEFAULT_GRID = {
  width: 10,
  depth: 10,
  unit: 10,
};

export class GridStore {
  width = $state(0);
  depth = $state(0);
  unit = $state(0);
  layer = $state(0);

  showGridForm = $state(false);

  constructor(init?: GridInit) {
    const cached = readGrid();

    this.width = init?.width ?? cached.width;
    this.depth = init?.depth ?? cached.depth;
    this.unit = init?.unit ?? cached.unit;
    this.layer = init?.layer ?? 0;
  }

  update({ width, depth, unit, layer }: GridInit) {
    if (width !== undefined) this.width = width;
    if (depth !== undefined) this.depth = depth;
    if (unit !== undefined) this.unit = unit;
    if (layer !== undefined) this.layer = layer;
  }
}

export function useGridSync(gridStore: GridStore, grid: Grid) {
  $effect(() => {
    grid.setSize(gridStore.width, gridStore.depth);
    grid.setLayer(gridStore.layer);
  });

  $effect(() => {
    writeGrid(gridStore.width, gridStore.depth, gridStore.unit);
  });
}

function writeGrid(width: number, depth: number, unit: number) {
  localStorage.setItem("cubi:grid", JSON.stringify({ width, depth, unit }));
}

function readGrid() {
  try {
    const grid = JSON.parse(localStorage.getItem("cubi:grid") ?? "{}");
    console.log(grid);
    return { ...DEFAULT_GRID, ...grid };
  } catch {
    return DEFAULT_GRID;
  }
}
