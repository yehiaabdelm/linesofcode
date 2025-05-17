import type { RequestEvent } from '@sveltejs/kit';
import * as s3 from '$lib/server/db/s3';
import { deleteSessionTokenCookie } from '$lib/server/auth/session';

export async function DELETE(event: RequestEvent): Promise<Response> {
	const user = event.locals.user;
	const session = event.locals.session;

	if (!user || !session) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		await s3.remove('user', user.id);
		await s3.remove('session', session.id);
		await s3.remove('languageMetrics', user.id);
		deleteSessionTokenCookie(event);
		return new Response(null, {
			status: 200
		});
	} catch (error) {
		console.error('Failed to delete account:', error);
		return new Response('Failed to delete account', { status: 500 });
	}
}
