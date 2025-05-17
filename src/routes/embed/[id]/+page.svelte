<script lang="ts">
	import LanguageEmbed from '$lib/components/LanguageEmbed.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<LanguageEmbed
	metrics={data.metrics}
	updatedAt={data.updated_at}
	metric={data.metric}
	theme={data.theme}
/>
