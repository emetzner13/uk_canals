<script>
	/* --------------------------------- IMPORTS -------------------------------- */
	import mapboxgl from 'mapbox-gl';
	import { onMount } from 'svelte';
	import SideButtons from './SideButtons.svelte';
	import VisibilityControl from './VisibilityControl.svelte';
	import {
		fetchGeoJSONData,
		addCanalsLayer,
		addLocksLayer,
		addLayerClickHandlers,
		MAPBOX_ACCESS
	} from '../helpers/MapHelpers';

	/* -------------------------------- VARIABLES ------------------------------- */

	export let map;
	let mapContainer;
	let lng, lat, zoom;
	let canal_geojsonData;
	let locks_geojsonData;

	lng = -1.6224;
	lat = 52.9033;
	zoom = 6;

	/* -------------------------------- ON MOUNT -------------------------------- */

	onMount(async () => {
		const initialState = { lng: lng, lat: lat, zoom: zoom };

		map = new mapboxgl.Map({
			container: mapContainer,
			accessToken: MAPBOX_ACCESS,
			style: `mapbox://styles/endeavour-inc/ckbaw8xld02sy1iqyigmvnr75`,
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom
		});

		try {
			/* ------------------------ Fetching data from files ------------------------ */

			canal_geojsonData = await fetchGeoJSONData('/data/canals_data.geojson');
			locks_geojsonData = await fetchGeoJSONData('/data/locks_data.geojson');

			/* ------------------------ Adding layers to the map ------------------------ */

			addCanalsLayer(map, canal_geojsonData);
			addLocksLayer(map, locks_geojsonData);

			/* ------------------- Adding click handlers to the layers ------------------ */

			addLayerClickHandlers(map);
		} catch (error) {
			console.error('Error fetching GeoJSON data:', error);
		}
	});

	/* ----------------------------------- UI ----------------------------------- */
</script>

<div>
	<div class="absolute w-screen h-screen" bind:this={mapContainer} />
	<p class="text-xl text-center w-full z-10 absolute top-0 mr-auto font-semibold p-2">
		UK Canal Route Builder
	</p>
	<SideButtons {map} {canal_geojsonData} />
	<VisibilityControl {map} />
</div>
