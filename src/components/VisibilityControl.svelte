<script>
	/* --------------------------------- IMPORTS -------------------------------- */
	import { View } from 'lucide-svelte';
	import { sightingsData } from '../store/store';
	import {
		NEW_SIGHTING_LAYER_COLOR,
		OLD_SIGHTING_LAYER_COLOR,
		CANAL_LAYER_COLOR,
		LOCK_LAYER_COLOR
	} from '../constants/layerColors.consants';
	/* -------------------------------- VARIABLES ------------------------------- */

	export let map;

	let visibility = {
		canals: true,
		locks: false,
		sightings: true
	};

	let VisibilityCheckBoxes = [
		{
			name: 'Canals',
			layer: 'canals-layer',
			bind: 'canals',
			color: CANAL_LAYER_COLOR
		},
		{
			name: 'Locks',
			layer: 'locks-layer',
			bind: 'locks',
			color: LOCK_LAYER_COLOR
		}
	];

	/* --------------------------------- HELPERS -------------------------------- */

	const toggleVisibility = (layer, visibility) => {
		if (visibility) {
			map.setLayoutProperty(layer, 'visibility', 'visible');
		} else {
			map.setLayoutProperty(layer, 'visibility', 'none');
		}
	};

	// Reactive statement to update VisibilityCheckBoxes based on store data
	$: {
		const userData = $sightingsData;
		const sightingsExists = VisibilityCheckBoxes.some((item) => item.bind === 'sightings');
		if (userData.features && userData.features.length > 0) {
			if (!sightingsExists) {
				VisibilityCheckBoxes = [
					{
						name: 'Sightings (New-Old)',
						layer: 'user-joined-data-layer',
						bind: 'sightings',
						color: [NEW_SIGHTING_LAYER_COLOR, OLD_SIGHTING_LAYER_COLOR]
					},
					...VisibilityCheckBoxes
				];
			}
		}
	}
</script>

<button
	class="absolute left-4 top-10 z-10 cursor-pointer bg-white shadow overflow-hidden h-auto flex flex-col gap-4 rounded-xl p-5"
>
	<h2 class="text-lg font-bold flex gap-2 items-center">
		<View />
		Legend
	</h2>
	<div class="flex flex-col gap-2 items-start">
		{#each VisibilityCheckBoxes as { name, layer, bind, color }}
			<div class="flex gap-5 items-center">
				<label class="w-40 flex justify-start gap-2">
					<input
						type="checkbox"
						bind:checked={visibility[bind]}
						on:change={() => toggleVisibility(layer, visibility[bind])}
					/>
					<span class="text-sm">{name}</span>
				</label>
				{#if Array.isArray(color)}
					<div
						class="w-10 h-3 rounded-full"
						style="background: linear-gradient(to right, {color[0]}, {color[1]})"
					/>
				{:else}
					<div class="w-3 h-3 rounded-full" style="background-color: {color}" />
				{/if}
			</div>
		{/each}
	</div>
</button>
