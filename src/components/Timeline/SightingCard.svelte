<script>
	import { tooltip } from '../../actions/tippy';

	export let sighting;
	export let className = '';
	export let animated = true;
	export let bordered = true;

	const MAX_DESCRIPTION_LENGTH = 20;

	$: fullDescription = sighting?.properties?.FUNC_LOC_DESC || '';
	$: truncatedDescription =
		fullDescription.length > MAX_DESCRIPTION_LENGTH
			? fullDescription.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
			: fullDescription;
</script>

<div
	use:tooltip={{
		content: fullDescription,
		theme: 'dark',
		arrow: true,
		placement: 'top'
	}}
	class={`card bg-white p-4 rounded-md ${className} ${
		animated ? 'transition transform hover:scale-105 hover:shadow-lg cursor-pointer' : ''
	} ${bordered ? 'border border-gray-200 shadow-sm' : ''}`}
>
	{#if sighting?.properties}
		<div class="flex flex-col gap-1 text-[10px]">
			<span>
				({sighting.properties.SAP_FUNC_LOC}) - {truncatedDescription}
			</span>
			<span>
				{new Date(sighting.properties.Date).toLocaleDateString('en-GB', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				})}
			</span>
		</div>
	{/if}
</div>

<style>
	.card {
		min-width: 150px;
		max-width: 200px;
		position: relative;
	}
</style>
