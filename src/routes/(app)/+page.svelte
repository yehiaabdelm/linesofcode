<script lang="ts">
	import LanguageEmbed from '$lib/components/LanguageEmbed.svelte';
	import type { PageData } from './$types';
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import Link from '$lib/icons/Link.svelte';
	let { data }: { data: PageData } = $props();

	let iframe: HTMLIFrameElement | null = $state(null);
</script>

{#snippet queryParams()}
	<ul class="list-disc space-y-2 pl-4.5">
		<li>
			exclude [number]: excludes languages with a percentage lower than the specified value (e.g.,
			exclude=5 hides languages below 5%)
		</li>
		<li>
			metric [string]: choose what to display 'bytes' for bytes of code or 'lines' for lines of code
			(default: lines)
		</li>
		<li>theme [string]: visual theme for the embed: 'light' (default) or 'dark'</li>
		<li>limit [number]: maximum number of languages to display (default: shows all)</li>
		<li>
			other [boolean]: combine remaining languages into an "Other" category (default: false), pair
			with limit to show only the top N languages and combine the rest into "Other"
		</li>
	</ul>
{/snippet}

{#snippet link(href: string, text: string)}
	<a
		{href}
		class="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600"
		target="_blank"
	>
		{text}
		<Link />
	</a>
{/snippet}

<div class="container mx-auto p-4">
	{#if data.user}
		<h1 class="mb-4 text-lg font-semibold">Welcome, {data.user?.username}!</h1>
		{#if data.metrics}
			<LanguageEmbed
				metric={'lines'}
				metrics={data.metrics}
				updatedAt={data.updatedAt}
				theme={'light'}
			/>
		{:else}
			<p>
				<a href="/load-language-metrics" class="text-blue-500 hover:text-blue-600"
					>Click here to load your language metrics.</a
				> This may take a minute. Let it run in the background.
			</p>
		{/if}
		<div class="mt-6">
			<p class="text-md mb-3 font-semibold">Embed Code</p>
			<div class="space-y-4">
				<div>
					<p class="mb-1 text-sm">Basic embed (default settings):</p>
					<pre
						class="overflow-x-auto rounded-lg bg-gray-100 p-2 text-xs break-all whitespace-pre-wrap"><code
							class="block"
							>&lt;iframe src="{PUBLIC_BASE_URL}/embed/{data.user
								?.id}" width="100%" height="200" frameborder="0"&gt;&lt;/iframe&gt;</code
						></pre>
				</div>
				<div>
					<p class="mb-1 text-sm">Show top 5 languages, excluding those below 1%:</p>
					<pre
						class="overflow-x-auto rounded-lg bg-gray-100 p-2 text-xs break-all whitespace-pre-wrap"><code
							class="block"
							>&lt;iframe src="{PUBLIC_BASE_URL}/embed/{data.user
								?.id}?limit=5&exclude=1" width="100%" height="200" frameborder="0"&gt;&lt;/iframe&gt;</code
						></pre>
				</div>
			</div>
		</div>
		<div class="mt-6">
			<p class="text-md mb-3 font-semibold">Query Parameters</p>
			{@render queryParams()}
		</div>
		<div class="mt-6">
			<p class="text-md mb-3 font-semibold">Account</p>
			<p>ID: {data.user?.github_id}</p>
			<p>Username: {data.user?.username}</p>
			<p>Email: {data.user?.email}</p>
			<button
				onclick={async () => {
					if (
						confirm('Are you sure you want to delete your account? This action cannot be undone.')
					) {
						const response = await fetch('/delete-account', { method: 'DELETE' });
						if (response.ok) {
							window.location.href = '/';
						} else {
							alert('Failed to delete account. Please try again.');
						}
					}
				}}
				class="mt-3 cursor-pointer text-red-500 hover:text-red-600"
			>
				Delete Account
			</button>
		</div>
		he
	{:else}
		<div class="mx-auto">
			<h1 class="mb-4 text-lg font-bold">Lines of Code</h1>
			<p class="mb-4">
				Show the number of lines of code you've written in each language with a beautiful,
				embeddable widget.
				{@render link('/login/github', 'Sign up with GitHub')}
			</p>
			<LanguageEmbed
				metric={'lines'}
				metrics={data.metrics}
				limit={15}
				other={false}
				updatedAt={data.updatedAt}
				theme={'light'}
				title={`Aggregate Lines of Code`}
			/>
			<p class="mt-2 mb-3 text-xs text-black opacity-60">
				Based on data from {data.number_of_users} developers. Refreshed hourly.
			</p>
			<p class="mt-3 mb-3">Hint: hover over the graph for a cool effect</p>
			<p class="mb-2">You can customize the widget using the following query parameters:</p>
			{@render queryParams()}
			<p class="mt-4 block">
				We refresh the data automatically every week. The code is open source and available on
				{@render link('https://github.com/yehiaabdelm/linesofcode', 'GitHub')}
			</p>
			<p class="mt-4 block">
				If you find any bugs or have any suggestions, please
				{@render link('https://github.com/yehiaabdelm/linesofcode/issues', 'open an issue')}
			</p>
			<p class="mt-4 block">
				Disclaimer: the number of lines is an estimate, see
				{@render link(
					'https://github.com/yehiaabdelm/linesofcode/blob/0c3228cd37c5579058c9ee87d893753214189126/src/lib/utils/languages.ts#L10',
					'here'
				)}
			</p>
		</div>
	{/if}
</div>
