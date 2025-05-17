import type { PageServerLoad } from './$types';
import { calculateMetrics } from '$lib/utils/languages';
import type { LanguageMetrics } from '$lib/server/db/schema';
import * as s3 from '$lib/server/db/s3';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	const user = locals.user;
	if (!user) {
		return {};
	}

	let languageMetrics = await s3.get<LanguageMetrics>('languageMetrics', user.id);

	if (!languageMetrics) {
		return {
			metrics: null,
			user
		};
	}

	const exclude = parseInt(url.searchParams.get('exclude') || '0');
	const metric = (url.searchParams.get('metric') || 'lines') as 'lines' | 'bytes';
	const limit = parseInt(url.searchParams.get('limit') || '100');
	const showOther = url.searchParams.get('other') === 'true';

	return {
		metrics: {
			data: calculateMetrics(languageMetrics.metrics, exclude, metric, limit, showOther),
			updated_at: languageMetrics.updated_at
		},
		metric,
		user
	};
};
