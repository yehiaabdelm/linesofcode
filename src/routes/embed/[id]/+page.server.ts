import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get } from '$lib/server/db/s3';
import { calculateMetrics } from '$lib/utils/languages';
import type { LanguageMetrics } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, url }) => {
	const userId = parseInt(params.id);
	if (isNaN(userId)) {
		throw error(400, 'Invalid user ID');
	}

	const languageMetrics = await get<LanguageMetrics>('languageMetrics', userId);

	if (!languageMetrics) {
		throw error(404, 'Metrics not found');
	}

	const exclude = parseInt(url.searchParams.get('exclude') || '0');
	const metric = (url.searchParams.get('metric') || 'lines') as 'lines' | 'bytes';
	const limit = parseInt(url.searchParams.get('limit') || '100');
	const showOther = url.searchParams.get('other') === 'true';
	const theme: 'light' | 'dark' = (url.searchParams.get('theme') || 'light') as 'light' | 'dark';

	return {
		metrics: languageMetrics.metrics,
		exclude,
		limit,
		other: showOther,
		metric,
		theme,
		updatedAt: languageMetrics.updated_at
	};
};
