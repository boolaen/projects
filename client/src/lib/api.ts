/**
 * Central API configuration for the Aduket client.
 * All API calls should use these helpers instead of hardcoded URLs.
 */

// Base URL for the backend API — read from env, fallback to localhost:3001
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Build a full API URL from a path.
 * @example api('/auth/login') => 'http://localhost:3001/auth/login'
 */
export function api(path: string): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Enhanced fetch wrapper with:
 * - Automatic base URL
 * - credentials: 'include' by default
 * - Better error messages
 * - Timeout support
 */
export async function apiFetch(
    path: string,
    options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
    const { timeout = 10000, ...fetchOptions } = options;

    const url = api(path);

    // Always include credentials for cookie-based auth
    const config: RequestInit = {
        credentials: 'include',
        ...fetchOptions,
    };

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...config,
            signal: controller.signal,
        });
        return response;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error(
                'Sunucu yanıt vermiyor. Lütfen backend sunucusunun çalıştığından emin olun (npm run start:dev).'
            );
        }
        throw new Error(
            'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı ve backend sunucusunun çalıştığını kontrol edin.'
        );
    } finally {
        clearTimeout(timeoutId);
    }
}
