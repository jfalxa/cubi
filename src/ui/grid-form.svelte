<script lang="ts">
  import type { CameraStore } from "$/stores/camera.svelte";
  import type { GridStore } from "$/stores/grid.svelte";
  import type { ShapeStore } from "$/stores/shape.svelte";
  import Dialog from "$/ui/dialog.svelte";
  import { scaleShapes } from "$/utils/geometry";

  type Props = {
    grid: GridStore;
    shapes: ShapeStore;
    camera: CameraStore;
  };

  let { grid, shapes, camera }: Props = $props();

  let width = $state("");
  let depth = $state("");
  let unit = $state("");
  let height = $state("");

  const gridToMeter = (size: number, unit: number) => size * unit;
  const meterToGrid = (size: number, unit: number) => Math.round((size) / unit); // prettier-ignore

  $effect(() => {
    if (grid.showGridForm) {
      unit = String(grid.unit * 100);
      width = String(gridToMeter(grid.width, grid.unit));
      depth = String(gridToMeter(grid.depth, grid.unit));
      height = String(gridToMeter(grid.height, grid.unit));
    }
  });

  function confirm() {
    const newUnit = parseFloat(unit) / 100;
    const ratio = grid.unit / newUnit;

    grid.update({
      unit: newUnit,
      width: meterToGrid(parseFloat(width), newUnit),
      depth: meterToGrid(parseFloat(depth), newUnit),
      height: meterToGrid(parseFloat(height), newUnit),
    });

    grid.showGridForm = false;

    if (ratio !== 1) {
      shapes.update(...scaleShapes(shapes.current, ratio));
      camera.scale(ratio);
    }
  }

  function cancel() {
    grid.showGridForm = false;
  }
</script>

<Dialog
  bind:open={grid.showGridForm}
  title="Grid size"
  contentClass="w-[min(90vw,420px)] p-6"
  titleClass="text-2xl font-semibold"
>
  <div class="mt-6 space-y-4">
    <label class="grid gap-2 text-sm">
      <span class="text-gray-500 dark:text-gray-400">Width (m)</span>
      <input
        class="surface rounded-md px-3 py-2"
        type="number"
        min="0.1"
        step="0.1"
        bind:value={width}
      />
    </label>

    <label class="grid gap-2 text-sm">
      <span class="text-gray-500 dark:text-gray-400">Depth (m)</span>
      <input
        class="surface rounded-md px-3 py-2"
        type="number"
        min="0.1"
        step="0.1"
        bind:value={depth}
      />
    </label>

    <label class="grid gap-2 text-sm">
      <span class="text-gray-500 dark:text-gray-400">Level height (m)</span>
      <input
        class="surface rounded-md px-3 py-2"
        type="number"
        min="0"
        step="0.1"
        bind:value={height}
      />
    </label>

    <label class="grid gap-2 text-sm">
      <span class="text-gray-500 dark:text-gray-400">Unit (cm)</span>
      <input
        class="surface rounded-md px-3 py-2"
        type="number"
        min="0.1"
        step="0.1"
        bind:value={unit}
      />
    </label>
  </div>

  <div class="mt-6 flex justify-end gap-3">
    <button class="surface rounded-md px-4 py-2" type="button" onclick={cancel}>
      Cancel
    </button>
    <button
      class="surface rounded-md px-4 py-2"
      type="button"
      onclick={confirm}
    >
      Confirm
    </button>
  </div>
</Dialog>
