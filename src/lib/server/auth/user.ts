import * as s3 from '$lib/server/db/s3';
import { type User } from '../db/schema';

export async function createUser(
	githubId: number,
	email: string,
	username: string,
	encryptedToken: string
): Promise<User> {
	const user: User = {
		id: githubId,
		github_id: githubId,
		email,
		username,
		access_token: encryptedToken
	};
	await s3.put('user', user);
	return user;
}

export async function getUserFromGitHubId(githubId: number): Promise<User | null> {
	return await s3.get<User>('user', githubId);
}
