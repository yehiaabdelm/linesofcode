import { env } from '$env/dynamic/private';
import type { User } from '../db/schema';
import * as s3 from '../db/s3';
import { decrypt } from '../crypto';

async function getUserRepos(token: string) {
	const res = await fetch(`${env.GITHUB_API_URL}/user/repos?per_page=100`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json'
		}
	});
	if (!res.ok) throw new Error('Failed to fetch repos');
	return await res.json();
}

async function getRepoLanguages(owner: string, repo: string, token: string) {
	const res = await fetch(`${env.GITHUB_API_URL}/repos/${owner}/${repo}/languages`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json'
		}
	});
	if (!res.ok) throw new Error(`Failed to fetch languages for ${repo}`);
	return await res.json();
}

export async function updateUserMetrics(user: User): Promise<boolean> {
	if (!user?.access_token) {
		return false;
	}

	try {
		const accessToken = await decrypt(user.access_token);
		const repos = await getUserRepos(accessToken);
		const languageMetrics: Record<string, number> = {};

		for (const repo of repos) {
			if (repo.owner.id !== user.github_id) continue;

			try {
				const languages = await getRepoLanguages(repo.owner.login, repo.name, accessToken);
				for (const [language, bytes] of Object.entries(languages)) {
					languageMetrics[language] = (languageMetrics[language] || 0) + (bytes as number);
				}
			} catch (error) {
				continue;
			}
		}

		await s3.put('languageMetrics', {
			id: user.id,
			user_id: user.id,
			metrics: languageMetrics,
			updated_at: new Date()
		});

		return true;
	} catch (error) {
		console.error(`Error updating metrics for user ${user.id}`);
		return false;
	}
}

export async function updateAllUsersMetrics(): Promise<void> {
	try {
		const users = await s3.listObjects<User>('users', 'user.json');

		console.log(`Starting metrics update for ${users.length} users`);

		for (const user of users) {
			try {
				const success = await updateUserMetrics(user);
				if (!success) {
					console.error(`Failed to update metrics for user ${user.id}`);
				}
			} catch (error) {
				console.error(`Error processing user ${user.id}:`, error);
			}
		}

		console.log('Completed metrics update for all users');
	} catch (error) {
		console.error('Error updating metrics for all users:', error);
	}
}

export async function aggregateAllUsersMetrics(): Promise<boolean> {
	try {
		const allMetrics = await s3.listObjects<{
			id: string;
			user_id: string;
			metrics: Record<string, number>;
			updated_at: Date;
		}>('users', 'metrics.json');

		const aggregateMetrics = {
			id: 'global',
			metrics: {
				total_users: allMetrics.length,
				total_bytes_by_language: {} as Record<string, number>,
				users_by_language: {} as Record<string, number>,
				updated_at: new Date()
			}
		};

		for (const userMetrics of allMetrics) {
			for (const [language, bytes] of Object.entries(userMetrics.metrics)) {
				aggregateMetrics.metrics.total_bytes_by_language[language] =
					(aggregateMetrics.metrics.total_bytes_by_language[language] || 0) + bytes;

				aggregateMetrics.metrics.users_by_language[language] =
					(aggregateMetrics.metrics.users_by_language[language] || 0) + 1;
			}
		}

		await s3.put('aggregateMetrics', aggregateMetrics);

		return true;
	} catch (error) {
		console.error('Error aggregating metrics:', error);
		return false;
	}
}
