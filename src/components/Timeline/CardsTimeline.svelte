<script>
	import SightingCard from './SightingCard.svelte';

	export let sightings;
	export let map;

	let scrollContainer;

	const scroll = (direction) => {
		const scrollAmount = 300;
		if (direction === 'left') {
			scrollContainer.scrollBy({
				left: -scrollAmount,
				behavior: 'smooth'
			});
		} else if (direction === 'right') {
			scrollContainer.scrollBy({
				left: scrollAmount,
				behavior: 'smooth'
			});
		}
	};

	let isDragging = false;
	let startX;
	let scrollLeft;

	const startDrag = (e) => {
		isDragging = true;
		scrollContainer.classList.add('active');
		startX = e.pageX || e.touches[0].pageX;
		scrollLeft = scrollContainer.scrollLeft;
	};

	const stopDrag = () => {
		isDragging = false;
		scrollContainer.classList.remove('active');
	};

	const doDrag = (e) => {
		if (!isDragging) return;
		e.preventDefault();
		const x = e.pageX || e.touches[0].pageX;
		const walk = (x - startX) * 2;
		scrollContainer.scrollLeft = scrollLeft - walk;
	};

	const handleWheel = (e) => {
		e.preventDefault();

		const delta = e.deltaY;

		const scrollSpeed = 3;

		scrollContainer.scrollBy({
			left: delta * scrollSpeed,
			behavior: 'smooth'
		});
	};

	const handleSelectSighting = (event) => {
		const { coordinates } = event.detail;
		if (coordinates && map) {
			map.flyTo({
				center: coordinates,
				zoom: 14,
				speed: 1.2,
				essential: true
			});
		}
	};
</script>

<div class="flex flex-row gap-5 items-center justify-center w-full">
	<button
		class="z-10 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity"
		on:click={() => scroll('left')}
		aria-label="Scroll Left"
	>
		&#9664;
	</button>

	<div
		class="overflow-x-auto scroll-smooth scrollbar-hidden flex gap-4 py-5 w-[calc(100dvw-500px)]"
		bind:this={scrollContainer}
		on:mousedown|preventDefault={startDrag}
		on:mouseup={stopDrag}
		on:mouseleave={stopDrag}
		on:mousemove={doDrag}
		on:touchstart={startDrag}
		on:touchend={stopDrag}
		on:touchmove={doDrag}
		on:wheel={handleWheel}
	>
		{#if sightings && sightings.length}
			{#each sightings as sighting}
				<SightingCard {sighting} on:select={handleSelectSighting} />
			{/each}
		{:else}
			<p>No sightings to display.</p>
		{/if}
	</div>

	<button
		class="z-10 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity"
		on:click={() => scroll('right')}
		aria-label="Scroll Right"
	>
		&#9654;
	</button>
</div>

<style>
	.scrollbar-hidden::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hidden {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.active {
		cursor: grabbing;
		cursor: -webkit-grabbing;
	}

	button {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
