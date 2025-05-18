<script lang="ts">
	import LanguageEmbed from '$lib/components/LanguageEmbed.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<LanguageEmbed
	metrics={data.metrics}
	updatedAt={data.updatedAt}
	metric={data.metric}
	theme={data.theme}
	exclude={data.exclude}
	limit={data.limit}
	other={data.other}
/>
