<script>
	import '../app.css';
	import Spinner from '../components/Spinner.svelte';
	import Map from '../components/Map.svelte';
	import ToastProvider from '../providers/ToastProvider.svelte';
  	import { isCalculating } from '../store/store';

	let map;
	$isCalculating = isCalculating;
</script>

<div>
	<ToastProvider />
	<Spinner isSpinning={$isCalculating} />
	<Map {map} />
</div>
