import mapboxgl from 'mapbox-gl';
import { CANAL_LAYER_COLOR, LOCK_LAYER_COLOR } from '../constants/layerColors.consants';

export const MAPBOX_ACCESS =
	'pk.eyJ1IjoiZW5kZWF2b3VyLWluYyIsImEiOiJja2I5b2d2cHgwZzFjMzJtZXI2eG9yNzZ0In0.OFUBzawh1tyy17EAC4MQMA';

export async function fetchGeoJSONData(url) {
	const response = await fetch(url);
	return response.json();
}

export function addCalculatedPathLayer(map, pathCoordinates) {
	if (!map) {
		console.error('Map object is not initialized');
		return;
	}

	if (!pathCoordinates || pathCoordinates.length === 0) {
		console.error('No path coordinates provided');
		return;
	}

	const pathGeoJSON = {
		type: 'FeatureCollection',
		features: pathCoordinates
	};

	if (map.getLayer('calculated-path-layer')) {
		map.removeLayer('calculated-path-layer');
		map.removeSource('calculated-path-source');
	}

	map.addSource('calculated-path-source', {
		type: 'geojson',
		data: pathGeoJSON
	});

	map.addLayer(
		{
			id: 'calculated-path-layer',
			type: 'line',
			source: 'calculated-path-source',
			layout: {
				'line-join': 'round',
				'line-cap': 'round'
			},
			paint: {
				'line-color': '#000000',
				'line-width': 8,
				'line-opacity': 0.3
			}
		},
		'user-joined-data-layer'
	);
}

export function addCanalsLayer(map, data) {
	map.addSource('canals', {
		type: 'geojson',
		data: data
	});

	map.addLayer({
		id: 'canals-layer',
		type: 'line',
		source: 'canals',
		layout: {
			'line-join': 'round',
			'line-cap': 'round'
		},
		paint: {
			'line-color': CANAL_LAYER_COLOR,
			'line-width': 1.5
		}
	});
}

export function addLocksLayer(map, data) {
	map.addSource('locks', {
		type: 'geojson',
		data: data
	});

	map.addLayer({
		id: 'locks-layer',
		type: 'circle',
		source: 'locks',
		layout: {
			visibility: 'none'
		},
		paint: {
			'circle-radius': 3,
			'circle-stroke-width': 0.5,
			'circle-color': LOCK_LAYER_COLOR,
			'circle-stroke-color': 'white'
		}
	});
}

export function addLayerClickHandlers(map) {
	map.on('click', 'canals-layer', (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['canals-layer']
		});
		if (!features.length) {
			return;
		}
		const feature = features[0];

		new mapboxgl.Popup({ offset: [0, -15] })
			.setLngLat(e.lngLat)
			.setHTML(
				`<h3>${feature.properties?.SAP_FUNC_LOC}</h3>
         <p>${feature.properties?.SAP_NAME}</p>
         <p>${feature.properties?.SAP_PLANT_NAME}</p>`
			)
			.addTo(map);
	});

	map.on('click', 'locks-layer', (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['locks-layer']
		});
		if (!features.length) {
			return;
		}
		const feature = features[0];

		new mapboxgl.Popup({ offset: [0, -15] })
			.setLngLat(e.lngLat)
			.setHTML(
				`<h3>${feature.properties?.SAP_FUNC_LOC}</h3>
         <p>${feature.properties?.SAP_DESCRIPTION}</p>`
			)
			.addTo(map);
	});

	map.on('mouseenter', 'canals-layer', () => {
		map.getCanvas().style.cursor = 'pointer';
	});

	map.on('mouseleave', 'canals-layer', () => {
		map.getCanvas().style.cursor = '';
	});

	map.on('mouseenter', 'locks-layer', () => {
		map.getCanvas().style.cursor = 'pointer';
	});

	map.on('mouseleave', 'locks-layer', () => {
		map.getCanvas().style.cursor = '';
	});
}
