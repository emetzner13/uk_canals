<script>
	import { tooltip } from '../../actions/tippy';
	import { createEventDispatcher } from 'svelte';

	export let sighting;
	export let index;
	export let className = '';
	export let animated = true;
	export let bordered = true;

	const dispatch = createEventDispatcher();

	const MAX_DESCRIPTION_LENGTH = 20;

	$: fullDescription = sighting?.properties?.FUNC_LOC_DESC || '';
	$: truncatedDescription =
		fullDescription.length > MAX_DESCRIPTION_LENGTH
			? fullDescription.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
			: fullDescription;

	const handleClick = () => {
		let coordinates = [];

		if (sighting.geometry.type === 'LineString') {
			coordinates = sighting.geometry.coordinates;
		} else if (sighting.geometry.type === 'MultiLineString') {
			coordinates = sighting.geometry.coordinates.flat();
		}

		let midpoint = [0, 0];
		if (coordinates.length > 0) {
			const midpointIndex = Math.floor(coordinates.length / 2);
			midpoint = coordinates[midpointIndex];
		}

		dispatch('select', { coordinates: midpoint, index });
	};
</script>

<button
	use:tooltip={{
		content: fullDescription,
		theme: 'dark',
		arrow: true,
		placement: 'top'
	}}
	class={`sighting-card card bg-white p-4 rounded-md xl:text-xs 2xl:text-base ${className} ${
		animated ? 'transition transform hover:scale-105 hover:shadow-lg cursor-pointer' : ''
	} ${bordered ? 'border border-gray-200 shadow-sm' : ''}`}
	on:click={handleClick}
	type="button"
>
	{#if sighting?.properties}
		<div class="flex flex-col gap-1">
			<span class="font-bold">
				({sighting.properties.SAP_FUNC_LOC}) - {truncatedDescription}
			</span>
			<span class="font-semibold">
				{new Date(sighting.properties.Date).toLocaleDateString('en-GB', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				})}
			</span>
		</div>
	{/if}
</button>

<style>
	.card {
		min-width: 200px;
		height: 100px;
		box-sizing: border-box;
	}

	@media (min-width: 1400px) {
		.card {
			min-width: 300px;
		}
	}

	.selected {
		border: 2px solid #333;
	}
</style>
