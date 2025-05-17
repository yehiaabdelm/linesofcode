<script lang="ts">
	import { formatNumber } from '$lib/utils/languages';
	import Link from '$lib/icons/Link.svelte';
	import { PUBLIC_BASE_URL } from '$env/static/public';
	let {
		metric,
		theme,
		metrics,
		updatedAt
	}: {
		metric: 'lines' | 'bytes';
		theme: 'light' | 'dark';
		metrics: {
			language: string;
			lines: number;
			percentage: number;
			color: string;
		}[];
		updatedAt: Date;
	} = $props();
	let hovered: string | null = $state(null);

	const getOrdinal = (n: number) => {
		const s = ['th', 'st', 'nd', 'rd'];
		const v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	};

	const formatDate = (date: Date | null) => {
		if (!date) return 'Unknown';
		const day = date.getDate();
		return `${getOrdinal(day)} of ${date.toLocaleString('en-US', {
			month: 'long',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})}`;
	};
</script>

<div class="font-sans {theme === 'dark' ? 'text-white' : 'text-black'}">
	<div class="mb-3 flex items-baseline gap-2">
		<p class="text-md font-semibold">
			{metric === 'lines' ? 'Lines' : 'Bytes'} of Code
		</p>
		<span class="text-sm opacity-60">
			{formatNumber(metrics.reduce((sum, m) => sum + m.lines, 0))}
		</span>
	</div>
	<div class="relative w-full">
		<div class="flex h-6 w-full overflow-hidden rounded-lg">
			{#each metrics as metric, i}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="group relative h-full cursor-pointer transition-all duration-300 hover:brightness-90"
					class:opacity-30={hovered && hovered !== metric.language}
					style:width="{metric.percentage}%"
					style:background-color={metric.color}
					onmouseenter={() => (hovered = metric.language)}
					onmouseleave={() => (hovered = null)}
				>
					<div class="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 group-hover:block">
						<div class="rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white">
							{metric.language}: {formatNumber(metric.lines)}
						</div>
					</div>
				</div>
			{/each}
		</div>
		<div class="relative flex flex-wrap text-xs {theme === 'dark' ? 'text-white' : 'text-black'}">
			{#each metrics as metric}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="flex cursor-pointer items-center gap-1.5 pt-2 pr-3 transition-opacity duration-300 ease-in-out"
					class:opacity-30={hovered && hovered !== metric.language}
					onmouseenter={() => (hovered = metric.language)}
					onmouseleave={() => (hovered = null)}
				>
					<div class="h-2.5 w-2.5 rounded-sm" style:background-color={metric.color}></div>
					<span>
						{metric.language}
						<span class="opacity-60">({metric.percentage}%)</span>
					</span>
				</div>
			{/each}
		</div>
	</div>
	<div class="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center">
		<p class="text-xs opacity-60">
			Last Updated {formatDate(updatedAt)}
		</p>
		<a href={PUBLIC_BASE_URL} target="_blank" class="flex items-center gap-0.75 text-xs opacity-60"
			><span class="hidden sm:inline">•</span> Lines of Code Tool
			<div class="inline-block pb-[0.0625rem]"><Link size={13.4} /></div></a
		>
	</div>
</div>
