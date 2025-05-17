import { ENCRYPTION_SECRET } from '$env/static/private';

const secret = Uint8Array.from(atob(ENCRYPTION_SECRET), (c) => c.charCodeAt(0));

export async function encrypt(text: string): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encoded = new TextEncoder().encode(text);
	const key = await crypto.subtle.importKey('raw', secret, 'AES-GCM', false, ['encrypt']);
	const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
	const buffer = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
	return btoa(String.fromCharCode(...buffer));
}

export async function decrypt(ciphertext: string): Promise<string> {
	const buffer = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
	const iv = buffer.slice(0, 12);
	const data = buffer.slice(12);
	const key = await crypto.subtle.importKey('raw', secret, 'AES-GCM', false, ['decrypt']);
	const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
	return new TextDecoder().decode(decrypted);
}
