import type { PageServerLoad } from './$types';
import { calculateMetrics } from '$lib/utils/languages';
import type { AggregateMetrics, LanguageMetrics } from '$lib/server/db/schema';
import * as s3 from '$lib/server/db/s3';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	const user = locals.user;
	if (!user) {
		const aggregateMetrics = await s3.get<AggregateMetrics>('aggregateMetrics', 'global');
		return {
			metrics: aggregateMetrics?.metrics.total_bytes_by_language || {},
			number_of_users: aggregateMetrics?.metrics.total_users || 0,
			updatedAt: aggregateMetrics?.metrics.updated_at || new Date()
		};
	}

	let languageMetrics = await s3.get<LanguageMetrics>('languageMetrics', user.id);

		console.log('not signed in');

	if (!languageMetrics) {
		return {
			metrics: null,
			user
		};
	}


	return {
		metrics: languageMetrics.metrics,
		updatedAt: languageMetrics.updated_at,
		user
	};
};
