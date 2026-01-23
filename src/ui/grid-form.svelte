<script lang="ts">
  import type { GridStore } from "$/stores/grid.svelte";
  import Dialog from "$/ui/dialog.svelte";

  type Props = {
    grid: GridStore;
  };

  let { grid }: Props = $props();

  let width = $state("");
  let depth = $state("");
  let unit = $state("");
  let cutOff = $state("");

  const gridToMeter = (size: number, unit: number) => (size * unit) / 100;
  const meterToGrid = (size: number, unit: number) => Math.round((size * 100) / unit); // prettier-ignore

  $effect(() => {
    if (grid.showGridForm) {
      unit = String(grid.unit);
      width = String(gridToMeter(grid.width, grid.unit));
      depth = String(gridToMeter(grid.depth, grid.unit));
      cutOff = String(gridToMeter(grid.height, grid.unit));
    }
  });

  function confirm() {
    const newUnit = parseFloat(unit);

    grid.update({
      unit: newUnit,
      width: meterToGrid(parseFloat(width), newUnit),
      depth: meterToGrid(parseFloat(depth), newUnit),
      height: meterToGrid(parseFloat(cutOff), newUnit),
    });

    grid.showGridForm = false;
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
      <span class="text-gray-500 dark:text-gray-400">Unit (cm)</span>
      <input
        class="surface rounded-md px-3 py-2"
        type="number"
        min="0.1"
        step="0.1"
        bind:value={unit}
      />
    </label>

    <label class="grid gap-2 text-sm">
      <span class="text-gray-500 dark:text-gray-400">Level cut-off (m)</span>
      <input
        class="surface rounded-md px-3 py-2"
        type="number"
        min="0"
        step="0.1"
        bind:value={cutOff}
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
