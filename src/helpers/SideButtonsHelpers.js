import mapboxgl from 'mapbox-gl';
import { cleanData } from './DataHelpers';
import * as XLSX from 'xlsx';
import { toasts } from 'svelte-toasts';

export const buttonStyle = 'cursor-pointer bg-white shadow p-2 px-4 rounded-full flex gap-2 group';

export async function handleFileUpload(event, canal_geojsonData, map, setUserData) {
	const file = event.target.files[0];
	const reader = new FileReader();
	reader.onload = (e) => {
		const data = new Uint8Array(e.target.result);
		const workbook = XLSX.read(data, { type: 'array' });
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		let sightingsData = XLSX.utils.sheet_to_json(worksheet, {
			header: 1,
			raw: true,
			rawNumbers: false // Ensure we get raw string values of the dates
		});
		sightingsData.shift();
		sightingsData = cleanData(sightingsData);

		const funcLocCounts = {};
		const data_dicts = [];

		sightingsData.forEach((entry) => {
			let dateStr = entry[1];
			const dateParts = dateStr.split(' ');
			const date = dateParts[0].split('/');
			const time = dateParts[1] ? dateParts[1].split(':') : ['00', '00', '00'];

			// Correct the year if it's in two digits
			if (date[2] && date[2].length === 2) {
				date[2] = `20${date[2]}`;
			}

			// Correct the month and day if they're in single digits
			date[0] = date[0].padStart(2, '0');
			date[1] = date[1].padStart(2, '0');

			// Add missing seconds if not present
			if (time.length === 2) {
				time.push('00');
			}

			//Correct hours if they are in single digits
			time[0] = time[0].padStart(2, '0');

			// Reconstruct the date string
			const formattedDateStr = `${date[2]}-${date[1]}-${date[0]}T${time.join(':')}`;
			const dateObj = new Date(formattedDateStr);

			if (dateObj.toString() === 'Invalid Date') {
				console.error(`Invalid Date: ${entry[1]} after correction.`);
			}

			const funcLoc = entry[2];
			if (funcLocCounts[funcLoc]) {
				funcLocCounts[funcLoc]++;
			} else {
				funcLocCounts[funcLoc] = 1;
			}

			const bsightings_Obj = {
				Boat: entry[0],
				Date: dateObj,
				FUNC_LOC: entry[2],
				FUNC_LOC_DESC: entry[3],
				WaterWay: entry[4]
			};

			data_dicts.push(bsightings_Obj);
		});

		console.table(data_dicts);
		let currentDate = new Date();
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

		const userData = {
			type: 'FeatureCollection',
			features: filtered_data
		};

		setUserData(userData);

		if (map.getSource('user-joined-data')) {
			map.getSource('user-joined-data').setData(userData);
		} else {
			map.addSource('user-joined-data', {
				type: 'geojson',
				data: userData
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
					'rgb(196, 55, 53)', // Newer sightings are brighter red
					365,
					'rgb(252, 177, 3)' // Older sightings are softer red
				],
				'line-width': ['+', 1, ['*', 2, ['get', 'Count']]]
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
					<p>${feature.properties?.Date?.toString()?.split('T')?.[0]}</p>`
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
		map.fitBounds(bounds, { padding: 100 });
	};
	reader.readAsArrayBuffer(file);

	toasts.success('Data uploaded successfully');
}

export function downloadUserData(userData) {
	const blob = new Blob([JSON.stringify(userData)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'userData.geojson';
	a.click();
	URL.revokeObjectURL(url);
	toasts.success('Data downloaded successfully');
}
