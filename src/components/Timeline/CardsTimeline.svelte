<script>
	import { onDestroy } from 'svelte';
	import { currentIndex } from '../../store/store';
	import SightingCard from './SightingCard.svelte';

	export let sightings = [];
	export let map;

	let scrollContainer;
	let isDragging = false;
	let startX;
	let scrollLeft;

	let isProgrammaticScroll = false;

	const scrollToIndex = (index) => {
		if (!scrollContainer) return;

		const cards = scrollContainer.querySelectorAll('.sighting-card');
		const card = cards[index];
		if (card) {
			card.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'center'
			});
		}
	};

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
				zoom: 15
			});
		}
	};

	const unsubscribe = currentIndex.subscribe((index) => {
		isProgrammaticScroll = true;
		scrollToIndex(index);
	});

	onDestroy(() => {
		unsubscribe();
	});
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
		role="scrollbar"
		tabindex="0"
		aria-controls="timeline"
		aria-valuenow="0"
		aria-label="Sighting cards"
	>
		{#if sightings && sightings.length}
			{#each sightings as sighting, index}
				<SightingCard
					{sighting}
					on:select={handleSelectSighting}
					className={index === $currentIndex ? 'selected' : ''}
				/>
			{/each}
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
</style>
