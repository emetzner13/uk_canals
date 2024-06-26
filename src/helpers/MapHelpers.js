import mapboxgl from 'mapbox-gl';

export const MAPBOX_ACCESS =
	'pk.eyJ1IjoiZW5kZWF2b3VyLWluYyIsImEiOiJja2I5b2d2cHgwZzFjMzJtZXI2eG9yNzZ0In0.OFUBzawh1tyy17EAC4MQMA';

export async function fetchGeoJSONData(url) {
	const response = await fetch(url);
	return response.json();
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
			'line-color': 'rgb(48, 142, 230)',
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
			'visibility': 'none'
		},
		paint: {
			'circle-radius': 3,
			'circle-stroke-width': .5,
			'circle-color': 'rgba(27, 9, 158, .8)',
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
