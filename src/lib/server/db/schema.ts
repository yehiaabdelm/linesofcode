import { z } from 'zod';

export const UserSchema = z.object({
	id: z.number(),
	email: z.string().email(),
	github_id: z.number(),
	username: z.string(),
	access_token: z.string().optional()
});

export const SessionSchema = z.object({
	id: z.string(),
	expires_at: z.coerce.date(),
	user_id: z.number()
});

export const LanguageMetricsSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	metrics: z.record(z.string(), z.number()),
	updated_at: z.coerce.date()
});

export const AggregateMetricsSchema = z.object({
	id: z.string(),
	metrics: z.object({
		total_users: z.number(),
		total_bytes_by_language: z.record(z.string(), z.number()),
		users_by_language: z.record(z.string(), z.number()),
		updated_at: z.coerce.date()
	})
});

export type User = z.infer<typeof UserSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type LanguageMetrics = z.infer<typeof LanguageMetricsSchema>;
export type AggregateMetrics = z.infer<typeof AggregateMetricsSchema>;
