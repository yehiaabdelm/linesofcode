import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth/session';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, cookies }) => {
	if (locals.session) {
		await invalidateSession(locals.session.id);
	}
	deleteSessionTokenCookie({ cookies } as any);
	redirect(302, '/');
};
