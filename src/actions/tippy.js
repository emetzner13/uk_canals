import { onDestroy } from 'svelte';
import tippy, { followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export function tooltip(node, options) {
	const instance = tippy(node, {
		...options,
		plugins: [followCursor],
		appendTo: () => document.body
	});

	onDestroy(() => {
		instance.destroy();
	});

	return {
		update(newOptions) {
			instance.setProps(newOptions);
		}
	};
}
