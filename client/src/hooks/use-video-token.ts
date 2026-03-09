
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

/**
 * Custom hook to handle video token fetching and URL construction.
 * 
 * @param videoId - The ID of the video.
 * @param isPremium - Whether the video is premium content.
 */
export function useVideoToken(videoId: string, isPremium: boolean = false) {
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If not premium, we can resolve the URL immediately.
    useEffect(() => {
        if (!isPremium) {
            setStreamUrl(api(`/videos/stream/${videoId}`));
        } else {
            // Reset if premium changes (unlikely for same id, but good practice)
            setStreamUrl(null);
        }
    }, [videoId, isPremium]);

    const fetchToken = useCallback(async () => {
        if (!isPremium) return; // No need
        if (streamUrl) return; // Already have it

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(api(`/videos/${videoId}/preview`));
            if (res.ok) {
                const data = await res.json();
                setStreamUrl(api(`/videos/stream/${videoId}?token=${data.token}`));
            } else {
                setError('Failed to fetch preview token');
            }
        } catch (e) {
            // Error handled silently
            setError('Error fetching preview');
        } finally {
            setIsLoading(false);
        }
    }, [isPremium, streamUrl, videoId]);

    return {
        streamUrl,
        isLoading,
        error,
        fetchToken
    };
}
