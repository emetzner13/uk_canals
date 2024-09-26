<script>
	import '../app.css';
	import Spinner from '../components/General/Spinner.svelte';
	import Map from '../components/Map.svelte';
	import ToastProvider from '../providers/ToastProvider.svelte';
	import { isCalculating } from '../store/store';
	import Modal from '../components/General/Modal.svelte';

	let map;
</script>

<div class="max-h-screen max-w-screen">
	<ToastProvider />
	<Modal isOpen={$isCalculating} hideActions={true}>
		<div class="flex flex-col items-center gap-2">
			<span class="text-black text-[10px]">Calculating Path...</span>
			<Spinner isSpinning={true} />
		</div>
	</Modal>

	<Map {map} />
</div>
