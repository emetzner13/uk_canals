<script>
	/* --------------------------------- IMPORTS -------------------------------- */

	import { Download, Plus, Search } from 'lucide-svelte';
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
	<!-- <div class="relative">
		<Search class="absolute left-4 top-[10px] z-10" size={20} />
		<input
			type="search"
			placeholder="Search"
			class="w-56 h-10 shadow p-2 px-4 rounded-full pl-11 placeholder:text-gray-700"
		/>
	</div> -->
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
