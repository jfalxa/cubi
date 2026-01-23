import type { Stage } from "$/stage";

interface GridInit {
  width?: number;
  depth?: number;
  unit?: number;
  layer?: number;
  level?: number;
}

const DEFAULT_GRID = {
  width: 10,
  depth: 10,
  unit: 10,
  level: 20,
};

export class GridStore {
  width = $state(0);
  depth = $state(0);
  unit = $state(0);
  layer = $state(0);

  cutOff = $state(false);
  level = $state(0);

  showGridForm = $state(false);

  constructor(init?: GridInit) {
    const cached = readGrid();

    this.width = init?.width ?? cached.width;
    this.depth = init?.depth ?? cached.depth;
    this.unit = init?.unit ?? cached.unit;
    this.layer = init?.layer ?? 0;
    this.level = init?.level ?? cached.level;
  }

  setLayer(layer: number) {
    this.layer = Math.max(0, layer);
  }

  moveLayer(delta: number) {
    this.layer = Math.max(0, this.layer + delta);
  }

  update({ width, depth, unit, layer, level }: GridInit) {
    if (width !== undefined) this.width = width;
    if (depth !== undefined) this.depth = depth;
    if (unit !== undefined) this.unit = unit;
    if (layer !== undefined) this.layer = layer;
    if (level !== undefined) this.level = level;
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
      ? gridStore.layer + gridStore.level
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
      gridStore.level,
    );
  });
}

function writeGrid(width: number, depth: number, unit: number, cutOff: number) {
  localStorage.setItem(
    "cubi:grid",
    JSON.stringify({ width, depth, unit, cutOff }),
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
