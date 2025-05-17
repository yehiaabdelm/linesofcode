<script lang="ts">
	import { page } from '$app/state';
</script>

<footer class=" p-4 text-sm text-gray-500">
	<div class="flex items-center justify-between">
		<div>
			<span>Lines of Code</span>
			<span class="mx-2">|</span>
			<a
				href="https://yehiaabdelm.com"
				class="cursor-pointer text-gray-500 transition-colors duration-300 ease-in-out hover:text-gray-900"
				target="_blank"
				rel="noopener noreferrer">yehiaabdelm.com</a
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
