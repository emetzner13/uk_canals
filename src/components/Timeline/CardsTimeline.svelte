<script>
	import SightingCard from './SightingCard.svelte';

	export let sightings;
	export let map;
	export let currentIndex = 0;

	let scrollContainer;

	const scrollToIndex = (index) => {
		if (!scrollContainer) return;

		const cardWidth = 160;
		const gap = 16;
		const scrollAmount = index * (cardWidth + gap);

		scrollContainer.scrollTo({
			left: scrollAmount - scrollContainer.clientWidth / 2 + cardWidth / 2,
			behavior: 'smooth'
		});
	};

	$: if (currentIndex != null) {
		scrollToIndex(currentIndex);
	}

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
	<div
		class="overflow-x-auto scroll-smooth scrollbar-hidden flex gap-4 py-5 w-[calc(100dvw-900px)]"
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
			{#each sightings as sighting, index}
				<SightingCard
					{sighting}
					on:select={handleSelectSighting}
					className={index === currentIndex ? 'selected' : ''}
				/>
			{/each}
		{:else}
			<p>No sightings to display.</p>
		{/if}
	</div>
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

	.selected {
		border: 2px solid #333;
	}
</style>
