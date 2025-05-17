import languages from '$lib/utils/languages.json';

interface LanguageEntry {
	language: string;
	lines: number;
	percentage: number;
	color: string;
}

const bytesPerLineEstimate = {
	programming: 55,
	markup: 85,
	data: 90,
	prose: 100
};

export function getLanguageColor(language: string): string {
	return (languages as Record<string, { color?: string }>)[language]?.color || '#8B8B8B';
}

function getLinesOfCode(languageType: string, bytes: number): number {
	return Math.round(
		bytes / bytesPerLineEstimate[languageType as keyof typeof bytesPerLineEstimate]
	);
}

export function formatNumber(num: number): string {
	if (num >= 1_000_000) {
		return (num / 1_000_000).toFixed(1) + 'M';
	}
	if (num >= 1_000) {
		return (num / 1_000).toFixed(1) + 'K';
	}
	return num.toString();
}

export function calculateMetrics(
	metrics: Record<string, number>,
	exclude: number = 0,
	metric: 'lines' | 'bytes' = 'lines',
	limit: number = 100,
	showOther: boolean = false
) {
	const convertedMetrics = Object.entries(metrics).reduce(
		(acc, [language, value]) => {
			acc[language] =
				metric === 'lines' ? getLinesOfCode(languages[language]['type'], value) : value;
			return acc;
		},
		{} as Record<string, number>
	);

	const total = Object.values(convertedMetrics).reduce((sum, val) => sum + val, 0);

	let entries = Object.entries(convertedMetrics)
		.map(
			([language, value]): LanguageEntry => ({
				language,
				lines: value,
				percentage: 0, // Will be calculated later
				color: getLanguageColor(language)
			})
		)
		.filter((entry) => {
			const percentage = (entry.lines / total) * 100;
			return percentage >= exclude;
		})
		.sort((a, b) => b.lines - a.lines);

	const filteredTotal = entries.reduce((sum, entry) => sum + entry.lines, 0);
	entries = entries.map((entry) => ({
		...entry,
		percentage: Number(((entry.lines / filteredTotal) * 100).toFixed(1))
	}));

	if (showOther && entries.length > limit) {
		const mainEntries = entries.slice(0, limit);
		const otherEntries = entries.slice(limit);

		const otherLines = otherEntries.reduce((sum, entry) => sum + entry.lines, 0);
		const otherPercentage = Number(((otherLines / filteredTotal) * 100).toFixed(1));

		entries = [
			...mainEntries,
			{
				language: 'Other',
				lines: otherLines,
				percentage: otherPercentage,
				color: '#8B8B8B'
			}
		];
	} else {
		entries = entries.slice(0, limit);
	}

	const filteredTotalAfterOther = entries.reduce((sum, entry) => sum + entry.lines, 0);

	return entries.map((entry) => ({
		...entry,
		percentage: Number(((entry.lines / filteredTotalAfterOther) * 100).toFixed(1))
	}));
}
