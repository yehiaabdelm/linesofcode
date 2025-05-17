<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Lines of Code</title>
</svelte:head>

<div class="container mx-auto flex min-h-screen flex-col">
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
