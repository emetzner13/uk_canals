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

		const funcLocCounts = {};
		const currentDate = new Date();
		const data_dicts = sightingsData.map((entry) => {
			const funcLoc = entry[2];
			const sightingDate = new Date(entry[1]);
			if (funcLocCounts[funcLoc]) {
				funcLocCounts[funcLoc]++;
			} else {
				funcLocCounts[funcLoc] = 1;
			}
			return {
				Boat: entry[0],
				Date: sightingDate,
				FUNC_LOC: entry[2],
				FUNC_LOC_DESC: entry[3],
				WaterWay: entry[4]
			};
		});

		const filtered_data = data_dicts
			.map((sighting) => {
				const canal = canal_geojsonData.features.find(
					(canal) => canal.properties?.SAP_FUNC_LOC === sighting.FUNC_LOC
				);
				if (canal) {
					const daysOld = Math.floor((currentDate - sighting.Date) / (1000 * 60 * 60 * 24));
					return {
						type: 'Feature',
						geometry: canal.geometry,
						properties: {
							...sighting,
							SAP_FUNC_LOC: canal.properties?.SAP_FUNC_LOC,
							SAP_FUNC_LOC_DESC: canal.properties?.SAP_FUNC_LOC_DESC,
							Count: funcLocCounts[sighting.FUNC_LOC], // Add count property
							DaysOld: daysOld // Add days old property
						}
					};
				}
			})
			.filter((entry) => entry);

		// Sort features by DaysOld in ascending order (newer sightings first)
		filtered_data.sort((a, b) => a.properties.DaysOld - b.properties.DaysOld);

		const userJoinedData = {
			type: 'FeatureCollection',
			features: filtered_data
		};

		setUserJoinedData(userJoinedData);

		if (map.getSource('user-joined-data')) {
			map.getSource('user-joined-data').setData(userJoinedData);
		} else {
			map.addSource('user-joined-data', {
				type: 'geojson',
				data: userJoinedData
			});
		}

		if (map.getLayer('user-joined-data-layer')) {
			map.removeLayer('user-joined-data-layer');
		}

		map.addLayer({
			id: 'user-joined-data-layer',
			type: 'line',
			source: 'user-joined-data',
			layout: {
				'line-join': 'round',
				'line-cap': 'round'
			},
			paint: {
				'line-color': [
					'interpolate',
					['linear'],
					['get', 'DaysOld'],
					0,
					'rgba(102, 255, 51, 1)', // Newer sightings are darker green
					365,
					'rgba(102, 255, 51, 0.3)' // Older sightings are lighter green
				],
				'line-width': ['get', 'Count']
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
					<p>${feature.properties?.Date.toISOString().split('T')[0]}</p>`
				)
				.addTo(map);
		});

		map.on('mouseenter', 'user-joined-data-layer', () => {
			map.getCanvas().style.cursor = 'pointer';
		});

		map.on('mouseleave', 'user-joined-data-layer', () => {
			map.getCanvas().style.cursor = '';
		});

		// Collect all coordinates
		const coordinates = [];
		filtered_data.forEach((feature) => {
			if (feature.geometry.type === 'LineString') {
				coordinates.push(...feature.geometry.coordinates);
			} else if (feature.geometry.type === 'MultiLineString') {
				feature.geometry.coordinates.forEach((line) => coordinates.push(...line));
			}
		});

		// Compute bounding box
		const bounds = coordinates.reduce(
			(bounds, coord) => {
				return bounds.extend(coord);
			},
			new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
		);

		// Fit map to bounds
		map.fitBounds(bounds, { padding: 20 });
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
