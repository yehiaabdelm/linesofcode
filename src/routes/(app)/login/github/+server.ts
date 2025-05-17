import type { RequestEvent } from './$types';
import { github } from '$lib/server/auth/oauth';
import { generateState } from 'arctic';

export function GET(event: RequestEvent): Response {
	const state = generateState();
	const url = github.createAuthorizationURL(state, ['user:email', 'repo']);

	event.cookies.set('github_oauth_state', state, {
		httpOnly: true,
		maxAge: 60 * 10,
		secure: import.meta.env.PROD,
		path: '/',
		sameSite: 'lax'
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}
