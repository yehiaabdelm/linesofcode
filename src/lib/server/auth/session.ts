import type { RequestEvent } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import type { Session, User } from '$lib/server/db/schema';
import * as s3 from '$lib/server/db/s3';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: number): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		user_id: userId,
		expires_at: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await s3.put('session', session);
	return session;
}

export async function validateSessionToken(
	token: string
): Promise<{ session: Session | null; user: User | null }> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = await s3.get<Session>('session', sessionId);
	if (!session) return { session: null, user: null };

	if (Date.now() >= session.expires_at.getTime()) {
		await s3.remove('session', sessionId);
		return { session: null, user: null };
	}

	const user = await s3.get<User>('user', session.user_id);
	if (!user) return { session: null, user: null };

	const renew = Date.now() >= session.expires_at.getTime() - DAY_IN_MS * 15;
	if (renew) {
		session.expires_at = new Date(Date.now() + DAY_IN_MS * 30);
		await s3.put('session', session);
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await s3.remove('session', sessionId);
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
