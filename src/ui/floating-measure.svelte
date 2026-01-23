<script lang="ts">
  import type { Vector2 } from "@babylonjs/core";

  import type { Box } from "$/types";

  interface Props {
    box: Box;
    unit: number;
    position: Vector2;
  }

  const { box, unit, position }: Props = $props();

  function meter(dimension: number) {
    if (dimension === 0) return "0";
    if (dimension < 1) return `${(dimension * 100).toFixed(0)}cm`;
    else return `${dimension.toFixed(2)}m`.replace(".00", "");
  }

  const width = $derived(meter(box.width * unit));
  const depth = $derived(meter(box.depth * unit));
  const height = $derived(meter(box.height * unit));
</script>

<div
  class="surface pointer-events-none fixed rounded-sm px-1.5 py-1 font-mono text-sm"
  style="left: {position.x + 16}px; top: {position.y + 16}px;"
>
  {width} × {depth} × {height}
</div>
