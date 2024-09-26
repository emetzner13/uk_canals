<script>
	export let isSpinning = false;
</script>

{#if isSpinning}
  <div class="bg-black w-full z-50 h-full absolute top-0 bg-opacity-30 flex items-center justify-center">
    <div class="loader" />
  </div>
{/if}

<style>
	.loader {
		width: 50px;
		padding: 8px;
		aspect-ratio: 1;
		border-radius: 50%;
		background: #0685d5;
		--_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
		-webkit-mask: var(--_m);
		mask: var(--_m);
		-webkit-mask-composite: source-out;
		mask-composite: subtract;
		animation: l3 1s infinite linear;
	}
	@keyframes l3 {
		to {
			transform: rotate(1turn);
		}
	}
</style>
