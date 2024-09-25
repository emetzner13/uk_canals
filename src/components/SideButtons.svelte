<script>
  /* --------------------------------- IMPORTS -------------------------------- */

  import { Download, Plus } from 'lucide-svelte';
  import { buttonStyle, downloadUserData, handleFileUpload } from '../helpers/SideButtonsHelpers';
  import { UserDataStore } from '../store/store';

  /* -------------------------------- VARIABLES ------------------------------- */

  export let map;
  export let canal_geojsonData;
  export let resetStats;

  /* --------------------------------- HELPERS -------------------------------- */

  function setUserData(data) {
    UserDataStore.set(data);
  }
</script>

<div class="absolute right-4 top-[70px] flex flex-col items-end gap-4">
  <input
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
      Add sightings
    </div>
  </label>
  <button class={buttonStyle} on:click={() => downloadUserData($UserDataStore)}>
    <Download />
    Download
  </button>
</div>
