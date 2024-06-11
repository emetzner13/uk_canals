export function isDate(value) {
	return !isNaN(Date.parse(value));
}

export function cleanData(data) {
	return data.map((entry) => {
		if (isDate(entry['Functional Location'])) {
			entry.Date = entry['Functional Location'];
			entry['Functional Location'] = null;
		}
		return entry;
	});
}
