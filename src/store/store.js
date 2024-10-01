import { writable } from 'svelte/store';

export const sightingsData = writable({});
export const calculatedPath = writable([]);
export const isCalculating = writable(false);
export const currentIndex = writable(0);
