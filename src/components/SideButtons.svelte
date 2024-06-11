<script>
	/* --------------------------------- IMPORTS -------------------------------- */

	import { Download, Plus } from 'lucide-svelte';
	import {
		buttonStyle,
		downloadUserJoinedData,
		handleFileUpload
	} from '../helpers/SideButtonsHelpers';

	/* -------------------------------- VARIABLES ------------------------------- */

	export let map;
	export let canal_geojsonData;
	let userJoinedData;

	/* --------------------------------- HELPERS -------------------------------- */

	function setUserJoinedData(data) {
		userJoinedData = data;
	}
</script>

<div class="absolute right-4 top-5 z-10 flex flex-col items-end gap-5">
	<input
		type="file"
		accept=".xlsx"
		class="hidden"
		id="fileInput"
		on:change={(e) => handleFileUpload(e, canal_geojsonData, map, setUserJoinedData)}
	/>
	<label for="fileInput">
		<div class={buttonStyle}>
			<div>
				<Plus />
			</div>
			Add sightings
		</div>
	</label>
	<button class={buttonStyle} on:click={() => downloadUserJoinedData(userJoinedData)}>
		<div>
			<Download />
		</div>
		Download data
	</button>
</div>
