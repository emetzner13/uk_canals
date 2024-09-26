<script>
	import { tooltip } from '../../actions/tippy';
	import { createEventDispatcher } from 'svelte';

	export let map;
	export let sighting;
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

		dispatch('select', { coordinates: midpoint });
	};
</script>

<div
	use:tooltip={{
		content: fullDescription,
		theme: 'dark',
		arrow: true,
		placement: 'top'
	}}
	class={`card bg-white p-4 rounded-md ${className} ${
		animated ? 'transition transform hover:scale-105 hover:shadow-lg cursor-pointer' : ''
	} ${bordered ? 'border border-gray-200 shadow-sm' : ''}`}
	on:click={handleClick}
>
	{#if sighting?.properties}
		<div class="flex flex-col gap-1 text-[10px]">
			<span>
				({sighting.properties.SAP_FUNC_LOC}) - {truncatedDescription}
			</span>
			<span>
				{new Date(sighting.properties.Date).toLocaleDateString('en-GB', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				})}
			</span>
		</div>
	{/if}
</div>

<style>
	.card {
		min-width: 150px;
		max-width: 200px;
		position: relative;
	}
</style>
