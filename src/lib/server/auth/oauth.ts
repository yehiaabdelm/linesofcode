import { env } from '$env/dynamic/private';
import { GitHub } from 'arctic';
import { PUBLIC_BASE_URL } from '$env/static/public';

export const github = new GitHub(
	env.GITHUB_CLIENT_ID as string,
	env.GITHUB_CLIENT_SECRET,
	`${PUBLIC_BASE_URL}/login/github/callback`
);
