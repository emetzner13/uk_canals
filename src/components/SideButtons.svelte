<script>
	/* --------------------------------- IMPORTS -------------------------------- */

	import { Download, Plus } from 'lucide-svelte';
	import { buttonStyle, downloadUserData, handleFileUpload } from '../helpers/SideButtonsHelpers';
	import { UserDataStore } from '../store/store';

	/* -------------------------------- VARIABLES ------------------------------- */

	export let map;
	export let canal_geojsonData;

	/* --------------------------------- HELPERS -------------------------------- */

	function setUserData(data) {
		UserDataStore.set(data); // Directly set the store
	}
</script>

<div class="absolute right-4 top-5 z-10 flex flex-col items-end gap-5">
	<input
		type="file"
		accept=".xlsx"
		class="hidden"
		id="fileInput"
		on:change={(e) => handleFileUpload(e, canal_geojsonData, map, setUserData)}
	/>
	<label for="fileInput">
		<div class={buttonStyle}>
			<Plus />
			Add sightings
		</div>
	</label>
	<button class={buttonStyle} on:click={() => downloadUserData($UserDataStore)}>
		<Download />
		Download
	</button>
</div>
