<script lang="ts">
  import type { Vector2 } from "@babylonjs/core";

  import type { Box } from "$/types";
  import { meter } from "$/utils/formatters";

  interface Props {
    box: Box;
    position: Vector2;
  }

  const { box, position }: Props = $props();
</script>

<div
  class="surface pointer-events-none fixed rounded-sm px-1.5 py-1 font-mono text-sm"
  style="left: {position.x + 16}px; top: {position.y + 16}px;"
>
  {meter(box.width)} × {meter(box.depth)} × {meter(box.height)}
</div>
