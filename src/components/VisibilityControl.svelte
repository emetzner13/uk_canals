<script>
	/* --------------------------------- IMPORTS -------------------------------- */
	import { Eye } from 'lucide-svelte';
	import { UserDataStore } from '../store/store';

	/* -------------------------------- VARIABLES ------------------------------- */

	export let map;

	let visibility = {
		canals: true,
		locks: true,
		sightings: true
	};

	let VisibilityCheckBoxes = [
		{
			name: 'Canals',
			layer: 'canals-layer',
			bind: 'canals',
			color: 'blue'
		},
		{
			name: 'Locks',
			layer: 'locks-layer',
			bind: 'locks',
			color: 'red'
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
		const userData = $UserDataStore;
		const sightingsExists = VisibilityCheckBoxes.some((item) => item.bind === 'sightings');
		if (userData.features && userData.features.length > 0) {
			if (!sightingsExists) {
				VisibilityCheckBoxes = [
					{
						name: 'Sightings',
						layer: 'user-joined-data-layer',
						bind: 'sightings',
						color: 'green'
					},
					...VisibilityCheckBoxes
				];
			}
		}
	}
</script>

<button
	class="absolute left-4 top-5 z-10 cursor-pointer bg-white shadow overflow-hidden h-auto flex flex-col gap-5 rounded-xl p-5"
>
	<div class="flex gap-2">
		<div>
			<Eye />
		</div>
		<span> Visibility </span>
	</div>
	<div class="flex flex-col gap-2 items-start">
		{#each VisibilityCheckBoxes as { name, layer, bind, color }}
			<div class="flex gap-5 items-center">
				<label class="w-32 flex justify-start gap-2">
					<input
						type="checkbox"
						bind:checked={visibility[bind]}
						on:change={() => toggleVisibility(layer, visibility[bind])}
					/>
					<span class="cursor-pointer">{name}</span>
				</label>
				<div class="w-3 h-3 rounded-full" style="background-color: {color}" />
			</div>
		{/each}
	</div>
</button>
