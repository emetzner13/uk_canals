import * as turf from '@turf/turf';
import rbush from 'rbush';

/**
 * A class responsible for calculating the time taken, total distance traveled, and other statistics based on sightings and canal data.
 */
class PathStatsCalculator {
	constructor(sightings, canals) {
		if (!Array.isArray(sightings) || !Array.isArray(canals)) {
			throw new Error('Invalid input data. Both sightings and canals should be arrays.');
		}
		this.sightings = sightings;
		this.canals = canals;

		this.TOLERANCE = 1e-6; // 1 meter
		this.earliestDate = null;
		this.latestDate = null;
		this.totalDistance = 0;

		this.canalLengths = {};
		this.pathCoordinates = [];
		this.adjacencyList = {};
	}

	/**
	 * Calculates the total distance and time based on the sightings and canal data.
	 */
	async calculateTimeAndDistance() {
		this._parseAndSortSightings();
		this._groupSightings();

		if (Object.keys(this.canalLengths).length === 0) {
			this.adjacencyList = this._buildAdjacencyList(this.canals);
		}

		this.sightings.forEach((sighting, index) => {
			const originFuncLoc = sighting?.properties?.SAP_FUNC_LOC;

			if (index < this.sightings.length - 1) {
				const nextSighting = this.sightings[index + 1];
				const destinationFuncLoc = nextSighting?.properties?.SAP_FUNC_LOC;

				if (originFuncLoc && destinationFuncLoc) {
					if (originFuncLoc !== destinationFuncLoc) {
						const path = this._findPath(this.adjacencyList, originFuncLoc, destinationFuncLoc);

						if (path) {
							// Calculate the distance for this path segment
							const segmentDistance = this._calculatePathLength(path, originFuncLoc);
							this.totalDistance += segmentDistance;

							// Collect path coordinates for visualization
							this._collectPathCoordinates(path);
						} else {
							console.warn(`No path found from ${originFuncLoc} to ${destinationFuncLoc}`);
						}
					} else {
						console.info(`Already at ${originFuncLoc}, no movement required.`);
					}
				}
			}
		});

		const timeTaken = this._calculateTimeTaken();

		return {
			earliestDate: this.earliestDate,
			latestDate: this.latestDate,
			timeTaken: timeTaken,
			totalDistance: this.totalDistance,
			canalDetails: this.canalDetails,
			pathCoordinates: this.pathCoordinates
		};
	}

	_parseAndSortSightings() {
		this.sightings.forEach((sighting) => {
			const dateStr = sighting?.properties?.Date;
			if (typeof dateStr === 'string') {
				const date = this._parseDate(dateStr);
				sighting.properties.Date = date;
			}
		});

		this.sightings.sort((a, b) => a.properties.Date - b.properties.Date);
	}

	_updateEarliestAndLatestDate(date) {
		if (!this.earliestDate || date < this.earliestDate) {
			this.earliestDate = date;
		}
		if (!this.latestDate || date > this.latestDate) {
			this.latestDate = date;
		}
	}

	_calculateTimeTaken() {
		if (this.earliestDate && this.latestDate) {
			const timeDifference = Math.abs(this.latestDate.getTime() - this.earliestDate.getTime());
			return this._millisecondsToTime(timeDifference);
		} else {
			console.warn('No valid dates found.');
			return '0.0';
		}
	}

	_parseDate(dateStr) {
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

	_millisecondsToTime(milliseconds) {
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

	_isValidDate(date) {
		return !isNaN(date?.getTime());
	}

	_collectPathCoordinates(path) {
		path.forEach((featureId) => {
			const featureData = this.canalLengths[featureId];
			if (featureData) {
				const geometry = featureData.canal.geometry;
				// Push the geometry to pathCoordinates
				this.pathCoordinates.push({
					type: 'Feature',
					properties: { featureId },
					geometry
				});
			} else {
				console.warn(`Feature ID ${featureId} not found in canal lengths.`);
			}
		});
	}

	_calculatePathLength(path, originFeatureId) {
		let totalLength = 0;
		let visitedCanals = new Set();

		path.forEach((featureId) => {
			if (originFeatureId) {
				if (featureId === originFeatureId) return; // Skip the origin because it was already included in the previous calculation
			}
			if (!visitedCanals.has(featureId)) {
				const featureData = this.canalLengths[featureId];
				if (featureData) {
					totalLength += featureData.length;
					visitedCanals.add(featureId);
				} else {
					console.warn(`Feature ID ${featureId} not found in canal lengths.`);
				}
			}
		});
		return totalLength;
	}

	_getFeatureLengthInKm(canal) {
		const lengthInKm = canal.properties.Shape__Length / 1000; // Converting meters to kilometers
		return lengthInKm;
	}

	_groupSightings() {
		const grouped = [];
		let previousFuncLoc = null;

		for (const sighting of this.sightings) {
			const dateStr = sighting?.properties?.Date;

			// Parse date
			let date = sighting?.properties?.Date;
			if (typeof dateStr === 'string') {
				date = this._parseDate(dateStr);
				sighting.properties.Date = date;
			}

			// Update earliest and latest dates
			if (this._isValidDate(date)) {
				this._updateEarliestAndLatestDate(date);
			}

			const currentFuncLoc = sighting?.properties?.SAP_FUNC_LOC;

			if (currentFuncLoc !== previousFuncLoc) {
				grouped.push(sighting);
				previousFuncLoc = currentFuncLoc;
			}
		}

		this.sightings = grouped;
	}

	_buildAdjacencyList(features, tolerance = this.TOLERANCE) {
		const adjacencyList = {};
		const index = rbush();

		const featureItems = features.map((feature) => {
			const featureId = feature.properties.SAP_FUNC_LOC;
			const featureLength = this._getFeatureLengthInKm(feature);

			this.canalLengths[featureId] = {
				length: featureLength,
				canal: feature
			};

			const bbox = turf.bbox(feature);
			const [minX, minY, maxX, maxY] = bbox;

			return {
				minX,
				minY,
				maxX,
				maxY,
				featureId,
				feature
			};
		});

		index.load(featureItems);

		featureItems.forEach((item) => {
			const { featureId, feature } = item;

			if (!adjacencyList[featureId]) {
				adjacencyList[featureId] = new Set();
			}

			const potentialIntersects = index.search({
				minX: item.minX,
				minY: item.minY,
				maxX: item.maxX,
				maxY: item.maxY
			});

			potentialIntersects.forEach((otherItem) => {
				const otherFeatureId = otherItem.featureId;
				if (featureId === otherFeatureId) return;

				// Buffer features to account for small gaps
				const bufferedFeature = turf.buffer(feature, tolerance, { units: 'meters' });
				const bufferedOtherFeature = turf.buffer(otherItem.feature, tolerance, {
					units: 'meters'
				});

				const intersects = turf.booleanIntersects(bufferedFeature, bufferedOtherFeature);

				if (intersects) {
					adjacencyList[featureId].add(otherFeatureId);

					if (!adjacencyList[otherFeatureId]) {
						adjacencyList[otherFeatureId] = new Set();
					}
					adjacencyList[otherFeatureId].add(featureId);
				}
			});
		});

		// Convert sets to arrays
		Object.keys(adjacencyList).forEach((key) => {
			adjacencyList[key] = Array.from(adjacencyList[key]);
		});

		return adjacencyList;
	}

	_extractEndpoints(feature, featureId) {
		const endpoints = [];
		const geometry = feature.geometry;

		if (geometry.type === 'LineString') {
			const coords = geometry.coordinates;
			endpoints.push({ coord: coords[0], featureId });
			endpoints.push({ coord: coords[coords.length - 1], featureId });
		} else if (geometry.type === 'MultiLineString') {
			geometry.coordinates.forEach((line) => {
				endpoints.push({ coord: line[0], featureId });
				endpoints.push({ coord: line[line.length - 1], featureId });
			});
		} else {
			console.warn('Unsupported geometry type:', geometry.type);
		}

		return endpoints;
	}

	_buildEndpointIndex(endpoints) {
		const index = rbush();

		const items = endpoints.map((endpoint) => {
			const [x, y] = endpoint.coord;
			return {
				minX: x,
				minY: y,
				maxX: x,
				maxY: y,
				endpoint
			};
		});

		index.load(items);
		return index;
	}

	_findPath(adjacencyList, startFeatureId, endFeatureId) {
		//* queue for BFS and a set to keep track of visited nodes
		const queue = [];
		const visited = new Set();

		//* Object to keep track of predecessors to reconstruct the path
		const predecessors = {};

		//* Start the BFS from the startFeatureId
		queue.push(startFeatureId);
		visited.add(startFeatureId);

		while (queue.length > 0) {
			const currentFeatureId = queue.shift();

			//* If we've reached the endFeatureId, reconstruct the path
			if (currentFeatureId === endFeatureId) {
				const path = [];
				let node = endFeatureId;
				while (node !== undefined) {
					path.unshift(node);
					node = predecessors[node];
				}
				return path;
			}

			//* Get neighbors from the adjacency list
			const neighbors = adjacencyList[currentFeatureId] || [];

			for (const neighbor of neighbors) {
				if (!visited.has(neighbor)) {
					visited.add(neighbor);
					predecessors[neighbor] = currentFeatureId;
					queue.push(neighbor);
				}
			}
		}

		return null; // No path found
	}
}

export default PathStatsCalculator;
