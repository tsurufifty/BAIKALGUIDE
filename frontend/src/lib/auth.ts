const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

export interface AuthUser {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  avatar?: { url?: string } | null;
}

interface AuthResponse {
  jwt: string;
  user: AuthUser;
}

async function authRequest(path: string, body: Record<string, string>): Promise<AuthResponse> {
  const res = await fetch(`${STRAPI_URL}/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? 'Authentication failed');
  }
  return json as AuthResponse;
}

export function login(identifier: string, password: string): Promise<AuthResponse> {
  return authRequest('local', { identifier, password });
}

export function register(username: string, email: string, password: string): Promise<AuthResponse> {
  return authRequest('local/register', { username, email, password });
}

export async function fetchMe(token: string): Promise<AuthUser> {
  // Custom self endpoint returns the user with avatar populated.
  const res = await fetch(`${STRAPI_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Session expired');
  const json = await res.json();
  return (json.data ?? json) as AuthUser;
}

/** Upload an avatar image, returns the created media file id. */
export async function uploadAvatar(token: string, file: File): Promise<number> {
  const form = new FormData();
  form.append('files', file);
  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  const arr = (await res.json()) as { id: number }[];
  return arr[0]!.id;
}

/** Update the current user's profile (username / email / avatar id). */
export async function updateProfile(
  token: string,
  data: { username?: string; email?: string; avatar?: number | null },
): Promise<AuthUser> {
  const res = await fetch(`${STRAPI_URL}/api/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? 'Update failed');
  return (json.data ?? json) as AuthUser;
}
