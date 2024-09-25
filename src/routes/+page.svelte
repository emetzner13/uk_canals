<script>
	import '../app.css';
	import Loader from '../components/Loader.svelte';
	import Map from '../components/Map.svelte';
	import ToastProvider from '../providers/ToastProvider.svelte';

	let map;
</script>

<div>
	<ToastProvider />
	<Loader />
	<Map {map} />
</div>
