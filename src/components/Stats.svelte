<script>
	import { UserDataStore } from '../store/store';
	import { calculateFurthestDistance, calculateTimeTaken } from '../helpers/StatsHelpers';
	import InfoDisplay from './InfoDisplay.svelte';
	import { BarChart3 } from 'lucide-svelte';

	export let map;

	let data = $UserDataStore;
	let furthestDistance = 0;
	let timeTaken = null;
	let earliestDate = null;
	let latestDate = null;

	$: {
		data = $UserDataStore;
		if (data && map) {
			furthestDistance = calculateFurthestDistance(data.features);
			const timeResults = calculateTimeTaken(data.features);
			earliestDate = timeResults.earliestDate;
			latestDate = timeResults.latestDate;
			timeTaken = timeResults.timeTaken;
		}
	}
</script>

{#if $UserDataStore?.features}
	<div class="absolute right-4 bottom-5 flex flex-col items-end gap-4">
		<div class="bg-white p-5 rounded-lg shadow-md flex flex-col gap-3">
			<h2 class="text-xl font-bold my-2 flex gap-2 items-center">
				<BarChart3 />
				Statistics
			</h2>
			<InfoDisplay label="Boat" value={data?.features?.[0]?.properties?.Boat ?? 'N/A'} />
			<InfoDisplay label="First Sighting" value={earliestDate?.toLocaleString() ?? 'N/A'} />
			<InfoDisplay label="Latest Sighting" value={latestDate?.toLocaleString() ?? 'N/A'} />
			<InfoDisplay label="Distance Travelled" value={`${furthestDistance.toFixed(2)} km`} />
			<InfoDisplay label="Time Taken" value={timeTaken ?? '0.0'} />
		</div>
	</div>
{/if}
