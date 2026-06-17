/**
 * In-memory JWT store (research.md: in-memory avoids the XSS blast radius of
 * localStorage). The API client reads the token here; AuthContext writes it.
 * Cleared on logout. Not persisted — a page reload requires re-authentication.
 */
let token: string | null = null;

export function getToken(): string | null {
  return token;
}

export function setToken(next: string | null): void {
  token = next;
}

export function clearToken(): void {
  token = null;
}
