<script>
	import { createEventDispatcher } from 'svelte';
	import { tooltip } from '../../actions/tippy';

	export let sightings = [];
	export let currentIndex = 0;

	const dispatch = createEventDispatcher();

	const handleDotClick = (index) => {
		dispatch('select', { index });
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
</script>

<div class="dots-wrapper">
	<div class="dots-line"></div>

	<div class="dots-container">
		{#each sightings as sighting, index}
			<button
				use:tooltip={{
					content: formatDate(sighting.properties.Date),
					theme: 'dark',
					arrow: true,
					placement: 'top'
				}}
				class={`dot ${currentIndex === index ? 'active' : ''}`}
				on:click={() => handleDotClick(index)}
				aria-label={`Select sighting ${index + 1}`}
			/>
		{/each}
	</div>
</div>

<style>
	.dots-wrapper {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px 0;
	}

	.dots-line {
		position: absolute;
		top: 50%;
		left: 5%;
		right: 5%;
		height: 2px;
		background-color: #ccc;
		z-index: 1;
		border-radius: 1px;
	}

	.dots-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 90%;
		position: relative;
		z-index: 2;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background-color: #9c9c9c;
		border: none;
		cursor: pointer;
		transition:
			background-color 0.3s,
			transform 0.3s;
		position: relative;
	}

	.dot.active,
	.dot:hover {
		background-color: #333;
		transform: scale(1.2);
	}

	.dot:focus {
		outline: 2px solid #333;
	}

	@media (max-width: 600px) {
		.dots-container {
			width: 95%;
		}

		.dots-line {
			left: 2.5%;
			right: 2.5%;
		}
	}
</style>
