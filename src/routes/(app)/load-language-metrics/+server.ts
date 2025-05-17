import type { RequestHandler } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { updateUserMetrics } from '$lib/server/metrics/update';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Not authenticated');
	}

	const success = await updateUserMetrics(user);
	if (!success) {
		throw error(500, 'Failed to update metrics');
	}

	return redirect(302, '/');
};
