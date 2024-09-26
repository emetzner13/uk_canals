<script>
  import mapboxgl from 'mapbox-gl';
  import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
  import { onMount } from 'svelte';
  import { isCalculating } from '../store/store'; // Import the store
  import SideButtons from './SideButtons.svelte';
  import VisibilityControl from './VisibilityControl.svelte';
  import {
    fetchGeoJSONData,
    addCanalsLayer,
    addLocksLayer,
    addLayerClickHandlers,
    MAPBOX_ACCESS
  } from '../helpers/MapHelpers';
  import Stats from './Stats.svelte';

  let map;
  let mapContainer;
  let canal_geojsonData;
  let locks_geojsonData;

  let lng = -1.6224;
  let lat = 52.9033;
  let zoom = 6;

  function resetStats() {
    const statsComponent = document.querySelector('stats-component');
    if (statsComponent) {
      statsComponent.resetStats();
    }
  }

  onMount(async () => {
    const initialState = { lng: lng, lat: lat, zoom: zoom };

    map = new mapboxgl.Map({
      container: mapContainer,
      accessToken: MAPBOX_ACCESS,
      style: `mapbox://styles/endeavour-inc/ckbaw8xld02sy1iqyigmvnr75`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });

    map.once('load', async () => {
      try {
        const geocoder = new MapboxGeocoder({
          accessToken: MAPBOX_ACCESS,
          mapboxgl: mapboxgl
        });
        map.addControl(geocoder, 'top-right');

        canal_geojsonData = await fetchGeoJSONData('/data/canals_data.geojson');
        locks_geojsonData = await fetchGeoJSONData('/data/locks_data.geojson');

        addCanalsLayer(map, canal_geojsonData);
        addLocksLayer(map, locks_geojsonData);

        addLayerClickHandlers(map);
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
      }
    });
  });
</script>

<div>
  <div class="absolute w-screen h-screen" bind:this={mapContainer} />

  <p class="text-xl text-center w-full absolute top-0 mr-auto font-semibold p-2">
    UK Canal Route Builder
  </p>
  <SideButtons {map} {canal_geojsonData} {resetStats} />
  <VisibilityControl {map} />
  <Stats {canal_geojsonData} map={map} />
</div>

<style>
  @import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

</style>
