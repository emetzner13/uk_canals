// StatsHelpers.js
import * as turf from '@turf/turf';

export function calculateFurthestDistance(features) {
	let furthestDistance = 0;
	let endpoints = [];

	features?.forEach((feature) => {
		const coordinates = feature?.geometry?.coordinates;
		if (Array.isArray(coordinates) && coordinates.length > 1) {
			endpoints.push(coordinates[0]); // Start point
			endpoints.push(coordinates[coordinates.length - 1]); // End point
		}
	});

	for (let i = 0; i < endpoints.length; i++) {
		for (let j = i + 1; j < endpoints.length; j++) {
			const startCoord = endpoints[i];
			const endCoord = endpoints[j];
			if (
				Array.isArray(startCoord) &&
				startCoord.length >= 2 &&
				Array.isArray(endCoord) &&
				endCoord.length >= 2 &&
				typeof startCoord[0] === 'number' &&
				typeof startCoord[1] === 'number' &&
				typeof endCoord[0] === 'number' &&
				typeof endCoord[1] === 'number'
			) {
				const distance = turf.distance(turf.point(startCoord), turf.point(endCoord));
				if (distance > furthestDistance) {
					furthestDistance = distance;
				}
			}
		}
	}

	return furthestDistance;
}

export function calculateTimeTaken(features) {
	let earliestDate = null;
	let latestDate = null;

	features?.forEach((feature) => {
		const dateStr = feature?.properties?.Date;
		if (!isNaN(dateStr)) {
			return;
		}
		if (dateStr) {
			const parts = dateStr.split(/[\s/:-]+/);
			if (parts.length === 6) {
				const day = parseInt(parts[0], 10);
				const month = parseInt(parts[1], 10) - 1;
				const year = parseInt(parts[2], 10);
				const hours = parseInt(parts[3], 10);
				const minutes = parseInt(parts[4], 10);
				const seconds = parseInt(parts[5], 10);

				const date = new Date(year, month, day, hours, minutes, seconds);

				if (!isNaN(date.getTime())) {
					if (!earliestDate || date < earliestDate) {
						earliestDate = date;
					}
					if (!latestDate || date > latestDate) {
						latestDate = date;
					}
				}
			}
		}
	});

	let timeTaken = null;
	if (earliestDate && latestDate) {
		const timeDifference = Math.abs(latestDate.getTime() - earliestDate.getTime());
		timeTaken = millisecondsToTime(timeDifference);
	} else {
		console.warn('No valid dates found.');
	}

	return { earliestDate, latestDate, timeTaken };
}

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
