'use client';

import { Navbar } from "@/components/navbar";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import { VideoOff, User } from "lucide-react";
import { apiFetch, api } from '@/lib/api';

export default function ProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const [user, setUser] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (username) {
            fetchProfile();
        }
    }, [username]);

    const fetchProfile = async () => {
        try {
            const res = await apiFetch(`/users/profile/${username}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                fetchUserVideos(data.id);
            } else {
                // Profile not found
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserVideos = async (userId: string) => {
        try {
            const res = await apiFetch(`/videos/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setVideos(data);
            }
        } catch (error) {
            // Error handled silently
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (isLoading) {
        return <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    if (!user) {
        return <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Kullanıcı Bulunamadı</h1>
            <Link href="/anasayfa">
                <Button>Anasayfaya Dön</Button>
            </Link>
        </div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pb-12 w-full">
                {/* Banner Background */}
                <div className="h-48 md:h-64 w-full bg-gradient-to-r dark:from-zinc-900 from-zinc-100 dark:via-red-900/40 via-red-100/40 dark:to-zinc-900 to-zinc-100 border-b dark:border-white/5 border-black/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10 space-y-12">
                    {/* Profile Header Area */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 pb-8">
                        {/* Avatar */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center dark:bg-zinc-800 bg-zinc-200 text-5xl md:text-7xl font-bold border-4 border-background ring-2 ring-red-500/20 shadow-2xl overflow-hidden relative group"
                        >
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                <span className="bg-gradient-to-br from-red-500 to-rose-600 bg-clip-text text-transparent">
                                    {user.username.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </motion.div>

                        {/* User Info & Stats */}
                        <div className="flex-1 flex flex-col md:flex-row items-center md:items-end justify-between w-full gap-8">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-center md:text-left space-y-3"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-3">
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{user.username}</h1>
                                    <div className="flex gap-2">
                                        {user.role === 'ADMIN' && (
                                            <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20 px-3 py-1 font-medium tracking-wide">
                                                YÖNETİCİ
                                            </Badge>
                                        )}
                                        {user.role === 'PREMIUM' && (
                                            <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 px-3 py-1 font-medium tracking-wide">
                                                PREMIUM
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm flex items-center justify-center md:justify-start gap-1.5">
                                    <User className="w-4 h-4" />
                                    <span>Üyelik tarihi {formatDate(user.createdAt)}</span>
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-6 md:gap-10 dark:bg-zinc-900/50 bg-zinc-100/50 backdrop-blur-md px-8 py-4 rounded-2xl border dark:border-white/5 border-black/5"
                            >
                                <div className="text-center">
                                    <div className="font-semibold text-2xl text-foreground">{user._count?.videos || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Video</div>
                                </div>
                                <div className="w-px h-10 dark:bg-white/10 bg-black/10"></div>
                                <div className="text-center">
                                    <div className="font-semibold text-2xl text-foreground">{user._count?.comments || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Yorum</div>
                                </div>
                                <div className="w-px h-10 dark:bg-white/10 bg-black/10"></div>
                                <div className="text-center">
                                    <div className="font-semibold text-2xl text-foreground">{user._count?.likes || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Beğeni</div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent dark:via-white/10 via-black/10 to-transparent"></div>

                    {/* User Videos Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                            <h2 className="text-2xl font-bold tracking-tight">İçerikler</h2>
                        </div>

                        {videos.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-center justify-center py-32 dark:bg-zinc-900/30 bg-zinc-100/50 rounded-3xl border dark:border-white/5 border-black/5 space-y-4"
                            >
                                <div className="w-16 h-16 rounded-full dark:bg-zinc-800 bg-zinc-200 flex items-center justify-center mb-2">
                                    <VideoOff className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-medium text-foreground">Henüz video yok</h3>
                                <p className="text-muted-foreground text-sm max-w-sm text-center">
                                    Bu kullanıcı kanalına henüz hiçbir video yüklememiş.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                {videos.map((video, index) => (
                                    <motion.div
                                        key={video.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                    >
                                        <Link href={`/watch/${video.id}`} className="block group">
                                            <VideoCard
                                                id={video.id}
                                                title={video.title}
                                                thumbnail={video.thumbnailUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"}
                                                views={`${video.views} izlenme`}
                                                duration={formatDuration(video.duration)}
                                                uploader={user.username}
                                                uploaderAvatar={user.avatarUrl}
                                                isPremium={video.isPremium}
                                                date={formatDate(video.createdAt)}
                                            />
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
