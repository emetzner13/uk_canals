import * as turf from '@turf/turf';

/**
 * Calculates the time taken and total distance traveled based on sightings data and canal data.
 *
 * @param {Array} sightings - An array of GeoJSON features representing sightings.
 * @param {Array} canals - An array of GeoJSON features representing canals.
 * @returns {Object} An object containing the earliest date, latest date, total time taken, and total distance traveled.
 */
export function calculateTimeAndDistance(sightings, canals) {
	if (!Array.isArray(sightings) || !Array.isArray(canals)) {
		console.error('Invalid input data. Both sightings and canals should be arrays.');
		return {
			earliestDate: null,
			latestDate: null,
			timeTaken: '0.0',
			totalDistance: 0,
			canalDetails: []
		};
	}

	let earliestDate = null;
	let latestDate = null;
	let totalDistance = 0;
	let previousEndPoint = null;
	let currentCanal = null;
	let canalDetails = [];
	let addedCanals = new Set();

	// Parse dates and sort sightings
	sightings.forEach((sighting) => {
		const dateStr = sighting?.properties?.Date;
		if (typeof dateStr === 'string') {
			const date = parseDate(dateStr);
			sighting.properties.Date = date;
		}
	});

	sightings.sort((a, b) => a.properties.Date - b.properties.Date);

	sightings.forEach((sighting, index) => {
		const date = sighting?.properties?.Date;
		console.log('Date:', date);
		if (!isNaN(date?.getTime())) {
			if (!earliestDate || date < earliestDate) {
				earliestDate = date;
			}
			if (!latestDate || date > latestDate) {
				latestDate = date;
			}
		}

		const sapFuncLoc = sighting?.properties?.SAP_FUNC_LOC;
		const canal = canals.find((c) => c.properties.SAP_FUNC_LOC === sapFuncLoc);

		if (canal) {
			const coordinates = canal.geometry.coordinates;
			const startPoint = coordinates[0];
			const endPoint = coordinates[coordinates.length - 1];

			if (isValidCoordinate(startPoint) && isValidCoordinate(endPoint)) {
				if (currentCanal && currentCanal !== sapFuncLoc) {
					if (!addedCanals.has(currentCanal)) {
						totalDistance += canal.properties.Shape__Length / 1000; // Converting meters to kilometers
						canalDetails.push({
							name: canal.properties.SAP_NAME,
							length: canal.properties.Shape__Length / 1000
						});
						addedCanals.add(currentCanal);
					}

					if (previousEndPoint) {
						const pathDistance = findPathDistance(canals, previousEndPoint, startPoint);
						if (pathDistance !== null) {
							totalDistance += pathDistance;
							canalDetails.push({ name: 'Path Distance', length: pathDistance });
						} else {
							const directDistance = turf.distance(
								turf.point(previousEndPoint),
								turf.point(startPoint)
							);
							totalDistance += directDistance;
							canalDetails.push({ name: 'Direct Distance', length: directDistance });
						}
					}
					totalDistance += canal.properties.Shape__Length / 1000; // Converting meters to kilometers
					canalDetails.push({
						name: canal.properties.SAP_NAME,
						length: canal.properties.Shape__Length / 1000
					});
				} else if (
					!currentCanal ||
					(currentCanal === sapFuncLoc &&
						(index === 0 || sightings[index - 1]?.properties?.SAP_FUNC_LOC !== sapFuncLoc))
				) {
					if (!addedCanals.has(sapFuncLoc)) {
						totalDistance += canal.properties.Shape__Length / 1000; // Converting meters to kilometers
						canalDetails.push({
							name: canal.properties.SAP_NAME,
							length: canal.properties.Shape__Length / 1000
						});
						addedCanals.add(sapFuncLoc);
					}
				}

				currentCanal = sapFuncLoc;
				previousEndPoint = endPoint;
			} else {
				console.warn('Invalid coordinates in canal data:', { startPoint, endPoint });
			}
		} else {
			console.warn('No matching canal found for SAP_FUNC_LOC:', sapFuncLoc);
		}
	});

	let timeTaken = null;
	if (earliestDate && latestDate) {
		const timeDifference = Math.abs(latestDate.getTime() - earliestDate.getTime());
		timeTaken = millisecondsToTime(timeDifference);
	} else {
		console.warn('No valid dates found.');
	}

	console.log('Canal details:', canalDetails);

	return { earliestDate, latestDate, timeTaken, totalDistance, canalDetails };
}

/**
 * Parses a date string in various formats into a Date object.
 *
 * @param {string} dateStr - The date string to parse.
 * @returns {Date} The parsed Date object.
 */
function parseDate(dateStr) {
	if (typeof dateStr !== 'string') {
		return new Date(NaN);
	}

	const parts = dateStr.split(/[\s/:-]+/);
	let day, month, year, hours, minutes, seconds;

	if (parts.length === 6) {
		[day, month, year, hours, minutes, seconds] = parts.map((part) => parseInt(part, 10));
		month -= 1; // JavaScript months are 0-based
		return new Date(year, month, day, hours, minutes, seconds);
	} else if (parts.length === 5) {
		[day, month, year, hours, minutes] = parts.map((part) => parseInt(part, 10));
		month -= 1; // JavaScript months are 0-based
		return new Date(year, month, day, hours, minutes, 0);
	} else {
		return new Date(NaN); // Return an invalid date if parsing fails
	}
}

/**
 * Converts a time duration in milliseconds to a readable format.
 *
 * @param {number} milliseconds - The time duration in milliseconds.
 * @returns {string} The time duration in a readable format.
 */
function millisecondsToTime(milliseconds) {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${days} days`;
	} else if (hours > 0) {
		return `${hours} hours`;
	} else if (minutes > 0) {
		return `${minutes} minutes`;
	} else {
		return `${seconds} seconds`;
	}
}

/**
 * Checks if the coordinate is valid (i.e., an array of two numbers).
 *
 * @param {Array} coordinate - The coordinate to validate.
 * @returns {boolean} True if the coordinate is valid, false otherwise.
 */
function isValidCoordinate(coordinate) {
	return (
		Array.isArray(coordinate) &&
		coordinate.length === 2 &&
		typeof coordinate[0] === 'number' &&
		typeof coordinate[1] === 'number'
	);
}

/**
 * Finds the path distance between two points if available.
 *
 * @param {Array} canals - An array of GeoJSON features representing canals.
 * @param {Array} startPoint - The starting point coordinates.
 * @param {Array} endPoint - The ending point coordinates.
 * @returns {number|null} The path distance or null if no path is found.
 */
function findPathDistance(canals, startPoint, endPoint) {
	const paths = findConnectingCanals(canals, startPoint, endPoint);
	if (paths.length > 0) {
		return paths.reduce((total, canal) => total + canal.properties.Shape__Length / 1000, 0); // Converting meters to kilometers
	}
	return null;
}

/**
 * Finds all connecting canals between two points if available.
 *
 * @param {Array} canals - An array of GeoJSON features representing canals.
 * @param {Array} startPoint - The starting point coordinates.
 * @param {Array} endPoint - The ending point coordinates.
 * @returns {Array} An array of found canals or an empty array if no connecting canals are found.
 */
function findConnectingCanals(canals, startPoint, endPoint) {
	const tolerance = 0.01; // Tolerance in degrees (~1km)
	const candidates = canals.filter((canal) => {
		const coordinates = canal.geometry.coordinates;
		const canalStartPoint = coordinates[0];
		const canalEndPoint = coordinates[coordinates.length - 1];

		return (
			isValidCoordinate(canalStartPoint) &&
			isValidCoordinate(canalEndPoint) &&
			(turf.distance(turf.point(canalStartPoint), turf.point(startPoint)) <= tolerance ||
				turf.distance(turf.point(canalEndPoint), turf.point(endPoint)) <= tolerance)
		);
	});

	return candidates.length > 0 ? candidates : [];
}
