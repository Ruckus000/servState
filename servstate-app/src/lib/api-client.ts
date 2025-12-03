/**
 * Centralized API client with CSRF protection and idempotency support
 */

// CSRF token cache
let csrfToken: string | null = null;
let csrfTokenExpiry: number = 0;
const CSRF_TOKEN_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch a fresh CSRF token from the server
 */
async function fetchCsrfToken(): Promise<string> {
  const response = await fetch('/api/auth/csrf');
  if (!response.ok) {
    throw new Error('Failed to fetch CSRF token');
  }
  const data = await response.json();
  return data.csrfToken;
}

/**
 * Get a CSRF token, using cached value if still valid
 */
export async function getCsrfToken(): Promise<string> {
  const now = Date.now();
  if (csrfToken && csrfTokenExpiry > now) {
    return csrfToken;
  }

  csrfToken = await fetchCsrfToken();
  csrfTokenExpiry = now + CSRF_TOKEN_TTL;
  return csrfToken;
}

/**
 * Clear the cached CSRF token (e.g., on logout)
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  csrfTokenExpiry = 0;
}

/**
 * Generate a unique idempotency key
 * Format: timestamp-random
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Options for API requests
 */
interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /** Request body (will be JSON stringified) */
  body?: unknown;
  /** Include idempotency key header (required for transactions) */
  idempotencyKey?: string;
  /** Skip CSRF token (for GET requests or public endpoints) */
  skipCsrf?: boolean;
}

/**
 * Make an API request with automatic CSRF token handling
 * @param url - The API endpoint URL
 * @param options - Request options
 * @returns The parsed JSON response
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, idempotencyKey, skipCsrf = false, ...fetchOptions } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add CSRF token for state-changing requests
  if (!skipCsrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      const token = await getCsrfToken();
      headers['x-csrf-token'] = token;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      throw new Error('Security token unavailable. Please try again.');
    }
  }

  // Add idempotency key if provided
  if (idempotencyKey) {
    headers['idempotency-key'] = idempotencyKey;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle CSRF token expiry
  if (response.status === 403) {
    const data = await response.json().catch(() => ({}));
    if (data.error?.includes('CSRF')) {
      // Clear token and retry once
      clearCsrfToken();
      const newToken = await getCsrfToken();
      headers['x-csrf-token'] = newToken;

      const retryResponse = await fetch(url, {
        ...fetchOptions,
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!retryResponse.ok) {
        const retryData = await retryResponse.json().catch(() => ({}));
        throw new Error(retryData.error || 'Request failed');
      }

      return retryResponse.json();
    }
    throw new Error(data.error || 'Forbidden');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Request failed');
  }

  return response.json();
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(url: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, { ...options, method: 'GET', skipCsrf: true }),

  post: <T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, { ...options, method: 'POST', body }),

  put: <T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, { ...options, method: 'PUT', body }),

  patch: <T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, { ...options, method: 'PATCH', body }),

  delete: <T>(url: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }),
};
