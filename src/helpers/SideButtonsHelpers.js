import mapboxgl from 'mapbox-gl';
import { cleanData } from './DataHelpers';
import * as XLSX from 'xlsx';
import { toasts } from 'svelte-toasts';

export const buttonStyle = 'cursor-pointer bg-white shadow p-2 px-4 rounded-full flex gap-2  group';

export async function handleFileUpload(event, canal_geojsonData, map, setUserJoinedData) {
	const file = event.target.files[0];
	const reader = new FileReader();
	reader.onload = (e) => {
		const data = new Uint8Array(e.target.result);
		const workbook = XLSX.read(data, { type: 'array' });
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];

		let sightingsData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
		sightingsData.shift();
		sightingsData = cleanData(sightingsData);

		const data_dicts = sightingsData.map((entry) => ({
			Boat: entry[0],
			Date: entry[1],
			FUNC_LOC: entry[2],
			FUNC_LOC_DESC: entry[3],
			WaterWay: entry[4]
		}));

		const filtered_data = data_dicts
			.map((sighting) => {
				const canal = canal_geojsonData.features.find(
					(canal) => canal.properties?.SAP_FUNC_LOC === sighting.FUNC_LOC
				);
				if (canal) {
					return {
						type: 'Feature',
						geometry: canal.geometry,
						properties: {
							...sighting,
							SAP_FUNC_LOC: canal.properties?.SAP_FUNC_LOC,
							SAP_FUNC_LOC_DESC: canal.properties?.SAP_FUNC_LOC_DESC
						}
					};
				}
			})
			.filter((entry) => entry);

		const userJoinedData = {
			type: 'FeatureCollection',
			features: filtered_data
		};

		setUserJoinedData(userJoinedData);

		map.addSource('user-joined-data', {
			type: 'geojson',
			data: userJoinedData
		});

		map.addLayer({
			id: 'user-joined-data-layer',
			type: 'line',
			source: 'user-joined-data',
			layout: {
				'line-join': 'round',
				'line-cap': 'round'
			},
			paint: {
				'line-color': 'green',
				'line-width': 1.5
			}
		});

		map.on('click', 'user-joined-data-layer', (e) => {
			const features = map.queryRenderedFeatures(e.point, {
				layers: ['user-joined-data-layer']
			});
			if (!features.length) {
				return;
			}
			const feature = features[0];

			new mapboxgl.Popup({ offset: [0, -15] })
				.setLngLat(e.lngLat)
				.setHTML(
					`<p>${feature.properties?.Boat}</p>
          <h3>${feature.properties?.SAP_FUNC_LOC}</h3>
          <p>${feature.properties?.FUNC_LOC_DESC}</p>
          <p>${feature.properties?.WaterWay}</p>
          <p>${feature.properties?.Date}</p>`
				)
				.addTo(map);
		});

		map.on('mouseenter', 'user-joined-data-layer', () => {
			map.getCanvas().style.cursor = 'pointer';
		});

		map.on('mouseleave', 'user-joined-data-layer', () => {
			map.getCanvas().style.cursor = '';
		});
	};
	reader.readAsArrayBuffer(file);

	toasts.success('Data uploaded successfully');
}

export function downloadUserJoinedData(userJoinedData) {
	const blob = new Blob([JSON.stringify(userJoinedData)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'userJoinedData.geojson';
	a.click();
	URL.revokeObjectURL(url);
	toasts.success('Data downloaded successfully');
}
