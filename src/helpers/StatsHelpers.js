// StatsHelpers.js
import * as turf from '@turf/turf';

/**
 * Calculates the furthest distance between any two endpoints in the provided features.
 *
 * @param {Array} features - An array of GeoJSON features.
 * @returns {number} The furthest distance between any two endpoints.
 */
export function calculateFurthestDistance(features) {
	let furthestDistance = 0; // Initialize the furthest distance to 0
	let endpoints = []; // Array to store all endpoints

	// Iterate over each feature
	features?.forEach((feature) => {
		const coordinates = feature?.geometry?.coordinates; // Get the coordinates of the feature
		if (Array.isArray(coordinates) && coordinates.length > 1) {
			endpoints.push(coordinates[0]); // Add the start point to endpoints
			endpoints.push(coordinates[coordinates.length - 1]); // Add the end point to endpoints
		}
	});

	// Calculate the distance between each pair of endpoints
	for (let i = 0; i < endpoints.length; i++) {
		for (let j = i + 1; j < endpoints.length; j++) {
			const startCoord = endpoints[i];
			const endCoord = endpoints[j];
			// Check if the coordinates are valid
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
				// Calculate the distance between the two points
				const distance = turf.distance(turf.point(startCoord), turf.point(endCoord));
				if (distance > furthestDistance) {
					furthestDistance = distance; // Update the furthest distance if a greater distance is found
				}
			}
		}
	}

	return furthestDistance; // Return the furthest distance found
}

/**
 * Calculates the time taken between the earliest and latest dates in the provided features.
 *
 * @param {Array} features - An array of GeoJSON features.
 * @returns {Object} An object containing the earliest date, latest date, and time taken.
 */
export function calculateTimeTaken(features) {
	let earliestDate = null; // Initialize the earliest date to null
	let latestDate = null; // Initialize the latest date to null

	// Iterate over each feature
	features?.forEach((feature) => {
		const dateStr = feature?.properties?.Date; // Get the date string from the feature properties
		if (!isNaN(dateStr)) {
			return; // Skip if the date string is not valid
		}
		if (dateStr) {
			// Split the date string into its components
			const parts = dateStr.split(/[\s/:-]+/);
			if (parts.length === 6) {
				const day = parseInt(parts[0], 10);
				const month = parseInt(parts[1], 10) - 1; // Months are zero-indexed in JavaScript
				const year = parseInt(parts[2], 10);
				const hours = parseInt(parts[3], 10);
				const minutes = parseInt(parts[4], 10);
				const seconds = parseInt(parts[5], 10);

				const date = new Date(year, month, day, hours, minutes, seconds); // Create a Date object

				if (!isNaN(date.getTime())) {
					if (!earliestDate || date < earliestDate) {
						earliestDate = date; // Update the earliest date
					}
					if (!latestDate || date > latestDate) {
						latestDate = date; // Update the latest date
					}
				}
			}
		}
	});

	let timeTaken = null;
	if (earliestDate && latestDate) {
		const timeDifference = Math.abs(latestDate.getTime() - earliestDate.getTime()); // Calculate the time difference
		timeTaken = millisecondsToTime(timeDifference); // Convert the time difference to a readable format
	} else {
		console.warn('No valid dates found.');
	}

	return { earliestDate, latestDate, timeTaken }; // Return the earliest date, latest date, and time taken
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
