<script>
  import { UserDataStore } from '../store/store';
  import { addCalculatedPathLayer } from '../helpers/MapHelpers';
  import PathStatsCalculator from '../helpers/PathStatsCalculator';
  import InfoDisplay from './InfoDisplay.svelte';
  import { BarChart3 } from 'lucide-svelte';

  export let canal_geojsonData;
  export let map;

  let data = $UserDataStore;
  let furthestDistance = 0;
  let totalDistance = 0;
  let timeTaken = null;
  let earliestDate = null;
  let latestDate = null;
  let showStats = false;
  let canalDetails = [];



  function resetStats() {
    furthestDistance = 0;
    totalDistance = 0;
    timeTaken = null;
    earliestDate = null;
    latestDate = null;
    showStats = false;
    canalDetails = [];
  }

  $: {
  data = $UserDataStore;
  if (Array.isArray(data.features) && Array.isArray(canal_geojsonData?.features)) {

    const timeResults = new PathStatsCalculator(data.features, canal_geojsonData.features).calculateTimeAndDistance();
    earliestDate = timeResults.earliestDate;
    latestDate = timeResults.latestDate;
    timeTaken = timeResults.timeTaken;
    totalDistance = timeResults.totalDistance;
    canalDetails = timeResults.canalDetails;

    // Add path to the map
    const pathCoordinates = timeResults.pathCoordinates;
    if (pathCoordinates.length > 0) {
      addCalculatedPathLayer(map, pathCoordinates);
    }

    showStats = true;
  } else {
    showStats = false;
  }
}
</script>


  {#if showStats}
    <div class="absolute right-4 bottom-5 flex flex-col items-end gap-4">
      <div class="bg-white p-5 rounded-lg shadow-md flex flex-col gap-3">
        <h2 class="text-xl font-bold my-2 flex gap-2 items-center">
          <BarChart3 />
          Statistics
        </h2>
        <InfoDisplay label="Boat" value={data?.features?.[0]?.properties?.Boat ?? 'N/A'} />
        <InfoDisplay label="First Sighting" value={earliestDate?.toLocaleString() ?? 'N/A'} />
        <InfoDisplay label="Latest Sighting" value={latestDate?.toLocaleString() ?? 'N/A'} />
        <InfoDisplay label="Approximate Travel Time" value={timeTaken ?? '0.0'} />
        <InfoDisplay
          label="Approximate Distance Travelled"
          value={`${totalDistance.toFixed(2)} km`}
        />
      </div>
    </div>
  {/if}
