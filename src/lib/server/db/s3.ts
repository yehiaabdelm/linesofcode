import { env } from '$env/dynamic/private';
import {
	S3Client,
	GetObjectCommand,
	PutObjectCommand,
	DeleteObjectCommand,
	ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { z } from 'zod';
import { UserSchema, SessionSchema, LanguageMetricsSchema } from './schema';

const s3 = new S3Client({
	forcePathStyle: false, // Configures to use subdomain/virtual calling format.
	region: 'us-east-1',
	endpoint: env.S3_ENDPOINT, // Replace with your DO Spaces endpoint
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY_ID || '',
		secretAccessKey: env.S3_SECRET_ACCESS_KEY || ''
	}
});

type KeyFn = (id: string | number) => string;

const schemaRegistry = {
	user: {
		schema: UserSchema,
		key: ((id: string | number) => `users/${id}/user.json`) as KeyFn
	},
	session: {
		schema: SessionSchema,
		key: ((id: string | number) => `sessions/${id}.json`) as KeyFn
	},
	languageMetrics: {
		schema: LanguageMetricsSchema,
		key: ((id: string | number) => `users/${id}/metrics.json`) as KeyFn
	}
};

export async function put<
	T extends
		| z.infer<typeof UserSchema>
		| z.infer<typeof SessionSchema>
		| z.infer<typeof LanguageMetricsSchema>
>(schemaName: keyof typeof schemaRegistry, data: T): Promise<void> {
	const { schema, key } = schemaRegistry[schemaName];
	schema.parse(data); // Validate
	const s3Key = key(data.id as any);
	await s3.send(
		new PutObjectCommand({
			Bucket: env.S3_BUCKET,
			Key: s3Key,
			Body: JSON.stringify(data),
			ContentType: 'application/json',
			ACL: 'private'
		})
	);
}

export async function get<
	T extends
		| z.infer<typeof UserSchema>
		| z.infer<typeof SessionSchema>
		| z.infer<typeof LanguageMetricsSchema>
>(schemaName: keyof typeof schemaRegistry, id: string | number): Promise<T | null> {
	const registry = schemaRegistry[schemaName];
	const path = registry.key(id as any);
	try {
		const res = await s3.send(new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: path }));
		const body = await res.Body?.transformToString();
		return registry.schema.parse(JSON.parse(body!)) as T;
	} catch (error) {
		console.error('Failed to get', schemaName, 'with id', id, ':', error);
		return null;
	}
}

export async function remove(
	schemaName: keyof typeof schemaRegistry,
	id: string | number
): Promise<void> {
	const { key } = schemaRegistry[schemaName];
	const s3Key = key(id as any);
	await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: s3Key }));
}

export async function listObjects<T>(directory: string, suffix: string): Promise<T[]> {
	const objects: T[] = [];
	let continuationToken: string | undefined;

	do {
		const command = new ListObjectsV2Command({
			Bucket: env.S3_BUCKET,
			Prefix: directory,
			ContinuationToken: continuationToken
		});

		const response = await s3.send(command);

		if (response.Contents) {
			for (const object of response.Contents) {
				if (object.Key?.endsWith(suffix)) {
					try {
						const data = await s3.send(
							new GetObjectCommand({
								Bucket: env.S3_BUCKET,
								Key: object.Key
							})
						);
						const body = await data.Body?.transformToString();
						if (body) {
							objects.push(JSON.parse(body));
						}
					} catch (error) {
						console.error(`Failed to get object ${object.Key}:`, error);
					}
				}
			}
		}

		continuationToken = response.NextContinuationToken;
	} while (continuationToken);

	return objects;
}
