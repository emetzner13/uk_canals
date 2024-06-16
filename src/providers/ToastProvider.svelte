<script>
	import { ToastContainer, FlatToast } from 'svelte-toasts';
</script>

<ToastContainer placement="bottom-right" let:data>
	<FlatToast {data} />
</ToastContainer>
