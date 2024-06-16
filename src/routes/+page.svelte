<script>
	import { FlatToast, ToastContainer } from 'svelte-toasts';
	import '../app.css';
	import Map from '../components/Map.svelte';
	import ToastProvider from '../providers/ToastProvider.svelte';

	let map;
</script>

<div>
	<ToastProvider />
	<Map {map} />
</div>
