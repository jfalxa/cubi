import type { Stage } from "$/stage";

interface GridInit {
  width?: number;
  depth?: number;
  height?: number;
  unit?: number;
  layer?: number;
}

const DEFAULT_GRID = {
  width: 10,
  depth: 10,
  height: 20,
  unit: 10,
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

  constructor(init?: GridInit) {
    const cached = readGrid();

    this.width = init?.width ?? cached.width;
    this.depth = init?.depth ?? cached.depth;
    this.height = init?.height ?? cached.height;
    this.unit = init?.unit ?? cached.unit;
    this.layer = init?.layer ?? 0;
  }

  setLayer(layer: number) {
    this.layer = Math.max(0, layer);
  }

  setLevel(level: number) {
    this.setLayer(level * this.height);
  }

  update({ width, depth, unit, layer, height }: GridInit) {
    if (width !== undefined) this.width = width;
    if (depth !== undefined) this.depth = depth;
    if (height !== undefined) this.height = height;
    if (unit !== undefined) this.unit = unit;
    if (layer !== undefined) this.layer = layer;
  }
}

export function useGridSync(gridStore: GridStore, stage: Stage) {
  const { grid, view } = stage;

  $effect(() => {
    grid.setSize(gridStore.width, gridStore.depth);
    grid.setLayer(gridStore.layer);
  });

  $effect(() => {
    const maxY = gridStore.cutOff
      ? (gridStore.level + 1) * gridStore.height
      : Infinity;

    for (const mesh of view.getMeshes()) {
      mesh.setCutOff(maxY);
    }
  });

  $effect(() => {
    writeGrid(
      gridStore.width,
      gridStore.depth,
      gridStore.unit,
      gridStore.height,
    );
  });
}

function writeGrid(width: number, depth: number, height: number, unit: number) {
  localStorage.setItem(
    "cubi:grid",
    JSON.stringify({ width, depth, height, unit }),
  );
}

function readGrid(): typeof DEFAULT_GRID {
  try {
    const grid = JSON.parse(localStorage.getItem("cubi:grid") ?? "{}");
    return { ...DEFAULT_GRID, ...grid };
  } catch {
    return DEFAULT_GRID;
  }
}
