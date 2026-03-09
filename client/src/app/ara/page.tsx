'use client';

import { Navbar } from "@/components/navbar";
import { VideoCard } from "@/components/video-card";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { apiFetch, api } from '@/lib/api';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (query) {
            fetchVideos();
        }
    }, [query]);

    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch(`/videos?search=${query}`);
            if (res.ok) {
                const data = await res.json();
                setVideos(data);
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsLoading(false);
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-[1800px] mx-auto w-full space-y-6">
                <h1 className="text-2xl font-bold">
                    "{query}" için arama sonuçları
                </h1>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        Sonuç bulunamadı.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {videos.map((video) => (
                            <Link href={`/watch/${video.id}`} key={video.id} className="block group">
                                <VideoCard
                                    id={video.id}
                                    title={video.title}
                                    thumbnail={video.thumbnailUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"}
                                    views={`${video.views} görüntüleme`}
                                    duration={formatDuration(video.duration)}
                                    uploader={video.user?.username || 'Anonim'}
                                    uploaderAvatar={video.user?.avatarUrl}
                                    isPremium={video.isPremium}
                                    date={formatDate(video.createdAt)}
                                />
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
