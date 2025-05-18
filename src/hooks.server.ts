import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth/session';
import schedule from 'node-schedule';
import { updateAllUsersMetrics, aggregateAllUsersMetrics } from '$lib/server/metrics/update';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expires_at);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

// Update all users metrics weekly
schedule.scheduleJob('0 0 * * 0', async function () {
	try {
		await updateAllUsersMetrics();
	} catch (error) {
		console.error('Weekly metrics update failed:', error);
	}
});

// Aggregate all users metrics every 30 minutes
schedule.scheduleJob('*/30 * * * *', async function () {
	try {
		await aggregateAllUsersMetrics();
	} catch (error) {
		console.error('Metrics aggregation update failed:', error);
	}
});

export const handle: Handle = handleAuth;
