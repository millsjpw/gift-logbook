import { getAccessToken, clearTokens } from './tokens';
import { refreshAccessToken } from './auth';

type ApiError = {
    error: string;
};

export async function apiFetch(path: string, options: RequestInit = {}) {
    let accessToken = getAccessToken();

    let res = await fetch(`/api${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
            ...options.headers,
        },
    });

    if (res.status === 401) {
        try {
            accessToken = await refreshAccessToken();

            res = await fetch(`/api${path}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
                    ...options.headers,
                },
            });
        } catch (error) {
            clearTokens();
            window.location.href = '/login';
            throw new Error('Authentication failed. Please log in again.');
        }
    }


    if (!res.ok) {
        const errorData: ApiError = await res.json();
        throw new Error(errorData.error || 'API request failed');
    }

    // If 204 No Content, return null
    if (res.status === 204) return null;

    // Otherwise parse JSON
    return res.json();
}