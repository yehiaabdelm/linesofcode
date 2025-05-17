import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth/session';
import schedule from 'node-schedule';
import { updateAllUsersMetrics } from '$lib/server/metrics/update';

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

const job = schedule.scheduleJob('0 0 * * 0', async function () {
	console.log('Starting weekly metrics update job');
	try {
		await updateAllUsersMetrics();
		console.log('Weekly metrics update completed successfully');
	} catch (error) {
		console.error('Weekly metrics update failed:', error);
	}
});

// Log job registration and next invocation
console.log('Metrics update job registered. Next run at:', job.nextInvocation());

export const handle: Handle = handleAuth;
