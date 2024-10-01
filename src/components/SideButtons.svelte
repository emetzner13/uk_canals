<script>
	/* --------------------------------- IMPORTS -------------------------------- */

	import { Download, Plus } from 'lucide-svelte';
	import { downloadUserData, handleFileUpload } from '../helpers/SideButtonsHelpers';
	import { sightingsData, calculatedPath } from '../store/store';

	/* -------------------------------- VARIABLES ------------------------------- */
	export const buttonStyle =
		'cursor-pointer bg-white shadow p-2 px-4 rounded-full flex gap-2 group w-44 sm&down:w-full flex flex-row  hover:scale-105 transiation-all duration-200 hover:bg-gray-100';

	export let map;
	export let canal_geojsonData;
	export let resetStats;

	/* --------------------------------- HELPERS -------------------------------- */

	function setUserData(data) {
		sightingsData.set(data);
	}
</script>

<div class="absolute right-4 top-[100px] flex flex-col items-end gap-4">
	<input
		title="Upload Sightings"
		type="file"
		accept=".xlsx"
		class="hidden"
		id="fileInput"
		on:change={(e) => {
			resetStats();
			handleFileUpload(e, canal_geojsonData, map, setUserData);
		}}
	/>
	<label for="fileInput">
		<div class={buttonStyle}>
			<Plus />
			<span class="sm&down:hidden"> Add sightings </span>
		</div>
	</label>

	<button
		title="Download Sightings"
		class={buttonStyle}
		on:click={() => downloadUserData($sightingsData, $calculatedPath)}
	>
		<Download />
		<span class="sm&down:hidden">Download</span>
	</button>
</div>
