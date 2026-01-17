<script lang="ts">
  import type { Snippet } from "svelte";

  import { Dialog } from "bits-ui";

  type Props = {
    open?: boolean;
    title?: string;
    showClose?: boolean;
    closeLabel?: string;
    contentClass?: string;
    headerClass?: string;
    titleClass?: string;
    bodyClass?: string;
    header?: Snippet;
    children?: Snippet;
  };

  let {
    open = $bindable(false),
    title,
    showClose = false,
    closeLabel = "Close",
    contentClass = "",
    headerClass = "",
    titleClass = "",
    bodyClass = "",
    header,
    children,
  }: Props = $props();

  const baseContentClass = "surface fixed inset-0 m-auto h-fit rounded-xl";
  const baseHeaderClass = "flex items-center justify-between gap-4";

  const composedContentClass = $derived(
    `${baseContentClass} ${contentClass}`.trim()
  );
  const composedHeaderClass = $derived(
    `${baseHeaderClass} ${headerClass}`.trim()
  );
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 bg-black/40" />
    <Dialog.Content class={composedContentClass}>
      {#if header}
        {@render header()}
      {:else if title || showClose}
        <div class={composedHeaderClass}>
          {#if title}
            <Dialog.Title class={titleClass}>{title}</Dialog.Title>
          {/if}
          {#if showClose}
            <Dialog.Close>{closeLabel}</Dialog.Close>
          {/if}
        </div>
      {/if}
      <div class={bodyClass}>
        {@render children?.()}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
