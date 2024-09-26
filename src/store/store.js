import { writable } from 'svelte/store';

export const UserDataStore = writable({});
export const isCalculating = writable(false);
export const currentIndex = writable(0);
