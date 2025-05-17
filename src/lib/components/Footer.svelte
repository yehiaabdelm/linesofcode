<script lang="ts">
	import { page } from '$app/state';
</script>

<footer class="p-4 text-sm text-gray-500">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
		<div class="flex flex-wrap items-center gap-2">
			<span>Lines of Code</span>
			<span class="hidden sm:inline">|</span>
			<a
				href="https://yehiaabdelm.com"
				class="cursor-pointer text-gray-500 transition-colors duration-300 ease-in-out hover:text-gray-900"
				target="_blank"
				rel="noopener noreferrer">yehiaabdelm.com</a
			>
			<span class="hidden sm:inline">|</span>
			<a
				href="https://buy.stripe.com/4gM7sK8k17US5gf9OnefC00"
				class="cursor-pointer text-gray-500 transition-colors duration-300 ease-in-out hover:text-gray-900"
				target="_blank"
				rel="noopener noreferrer">Donate</a
			>
		</div>
		{#if page.data.user}
			<a
				href="/logout"
				class="cursor-pointer text-gray-500 transition-colors duration-300 ease-in-out hover:text-gray-900"
			>
				Log out
			</a>
		{:else}
			<a
				href="/login/github"
				class="cursor-pointer text-gray-500 transition-colors duration-300 ease-in-out hover:text-gray-900"
			>
				Sign in with GitHub
			</a>
		{/if}
	</div>
</footer>
