<script>
  export let isOpen = false;
  export let onClose = () => {};

  export let hideActions = false;
  export let backgroundColor = '#fff';
  export let overlayColor = 'rgba(30, 30, 30, 0.8)';
  export let transparent = false;

  // New props for width and height
  export let width = '100%';
  export let maxWidth = '150px';
  export let height = 'auto';
  export let maxHeight = '150px';

  import { fly, fade } from 'svelte/transition';
</script>

{#if isOpen}
  <div class="modal-container" transition:fade={{ duration: 200 }}>
    <div
      class="modal-overlay"
      style="--overlay-background: {overlayColor};"
      on:click="{onClose}"
    ></div>
    <div
      class="modal-content"
      style="
        --modal-background: {transparent ? 'transparent' : backgroundColor};
        --modal-width: {width};
        --modal-max-width: {maxWidth};
        --modal-height: {height};
        --modal-max-height: {maxHeight};
      "
      on:click|stopPropagation
      in:fly={{ y: -50, duration: 300 }}
      out:fly={{ y: 50, duration: 300 }}
    >
      {#if !hideActions}
        <button class="modal-close-button" on:click="{onClose}">&times;</button>
      {/if}
      <slot></slot>
    </div>
  </div>
{/if}

<style>
  /* Container that holds both the overlay and the modal content */
  .modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
  }

  /* Overlay that darkens the background */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--overlay-background, rgba(30, 30, 30, 0.8));
    backdrop-filter: blur(5px);
    z-index: 1000;
    opacity: 0.7;
  }

  /* Modal content */
  .modal-content {
    background: var(--modal-background);
    padding: 2rem;
    border-radius: 16px;
    text-align: center;
    width: var(--modal-width, 90%);
    max-width: var(--modal-max-width, 400px);
    height: var(--modal-height, auto);
    max-height: var(--modal-max-height, none);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    color: #fff;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    z-index: 1001; /* Ensures modal content is above the overlay */
  }

  /* Close button */
  .modal-close-button {
    position: absolute;
    top: -5px;
    right: 15px;
    background: transparent;
    border: none;
    font-size: 2rem;
    color: #fff;
    cursor: pointer;

  }

  .modal-close-button:hover {
    color: #ddd;
  }
</style>
