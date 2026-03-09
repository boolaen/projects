'use client';

import { Navbar } from "@/components/navbar";
import { VideoCard } from "@/components/video-card";
import { useEffect, useState, use } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, FolderSearch } from "lucide-react";
import { apiFetch, api } from '@/lib/api';

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unwrappedParams, setUnwrappedParams] = useState<{ category: string } | null>(null);

    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    useEffect(() => {
        if (unwrappedParams) {
            fetchVideos();
        }
    }, [unwrappedParams]);

    const fetchVideos = async () => {
        if (!unwrappedParams) return;
        setIsLoading(true);
        const category = decodeURIComponent(unwrappedParams.category);

        try {
            const res = await apiFetch(`/videos?category=${category}`);
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

    const categoryName = unwrappedParams ? decodeURIComponent(unwrappedParams.category) : '';
    const displayTitles: Record<string, string> = {
        'All': 'Tümü',
        'Premium': 'Premium İçerik',
        'Trending': 'Trendler',
        'New': 'Yeni Eklenenler',
        'Amateur': 'Amatör',
        'Virtual Reality': 'Sanal Gerçeklik',
        'Live Cams': 'Canlı Yayın Tekrarları'
    };
    const displayTitle = displayTitles[categoryName] || categoryName;

    // Framer Motion variants for staggered grid
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Ambient Background Lights */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

            <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-[1800px] mx-auto w-full space-y-10 relative z-10">

                {/* Cinematic Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-3 bg-zinc-100/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-2xl dark:shadow-black/20"
                >
                    <Link href="/modeller" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 font-medium">
                        <Sparkles className="w-5 h-5 text-red-500" />
                        Kategoriler
                    </Link>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground dark:text-white drop-shadow-md">
                        {displayTitle}
                    </h1>
                </motion.div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-video bg-secondary/80 rounded-2xl animate-pulse ring-1 ring-white/5 shadow-lg" />
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary/80 animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-secondary/80 rounded animate-pulse w-3/4" />
                                        <div className="h-3 bg-secondary/80 rounded animate-pulse w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-32 space-y-6 text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center border border-zinc-200 dark:border-white/10 shadow-lg dark:shadow-2xl backdrop-blur-md">
                            <FolderSearch className="w-12 h-12 text-red-600/50" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-foreground dark:text-white">İçerik Bulunamadı</h2>
                            <p className="text-zinc-500 font-medium text-lg max-w-md mx-auto">
                                Bu kategoride henüz video yok. Daha sonra tekrar ziyaret edin veya diğer kategorileri keşfedin.
                            </p>
                        </div>
                        <Link href="/modeller" className="inline-block mt-4 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-105">
                            Kategorilere Dön
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
                    >
                        {videos.map((video) => (
                            <motion.div variants={itemVariants} key={video.id}>
                                <Link href={`/watch/${video.id}`} className="block group">
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
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
}
