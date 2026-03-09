'use client';

import { Navbar } from "@/components/navbar";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Send, Sparkles } from "lucide-react";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, api } from '@/lib/api';

export default function PremiumPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        Promise.allSettled([
            apiFetch('/users/me', { credentials: 'include' }).then(res => {
                if (!res.ok) throw new Error('Not logged in');
                return res.json();
            }),
            apiFetch('/videos?category=Premium').then(res => res.json())
        ]).then(([userResult, videosResult]) => {
            if (userResult.status === 'fulfilled') {
                setUserRole(userResult.value.role);
            } else {
                router.push('/login');
                return;
            }

            if (videosResult.status === 'fulfilled') {
                setVideos(videosResult.value);
            } else {
                setVideos([]);
            }
        }).finally(() => {
            setIsLoading(false);
        });
    }, [router]);

    const isPremiumUser = userRole === 'PREMIUM' || userRole === 'ADMIN' || userRole === 'CREATOR';

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-8 flex flex-col">
                {/* Hero */}
                <section className="shrink-0">
                    <div className="max-w-3xl mx-auto text-center px-4 py-4 space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/15 text-amber-500 text-xs font-bold uppercase tracking-widest">
                            <Crown className="w-3.5 h-3.5" />
                            PREMIUM
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                                {isPremiumUser ? 'Premium İçerikler' : 'Üyeliğinizi Yükseltin'}
                            </span>
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto font-medium">
                            {isPremiumUser
                                ? 'Size özel premium içeriklerin keyfini çıkarın.'
                                : 'Sınırsız erişim, özel içerikler ve ayrıcalıklı deneyim.'}
                        </p>

                        {!isPremiumUser && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                                <Link href="/abonelikler">
                                    <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold px-6 py-5 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all h-auto">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Abonelik Planları
                                    </Button>
                                </Link>
                                <a href="https://t.me/sofistikadam" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="font-semibold px-8 py-5 rounded-xl border-amber-500/20 hover:bg-amber-500/10 h-auto text-base min-w-[160px]">
                                        <Send className="w-4 h-4 mr-2" />
                                        İletişim
                                    </Button>
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                {/* Content */}
                <section className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-4 flex-1 overflow-y-auto w-full mt-4">
                    {isPremiumUser ? (
                        <>
                            <div className="flex items-center gap-2 mb-5">
                                <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
                                <h2 className="text-xl font-bold">Premium Videolar</h2>
                            </div>

                            {videos.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    Henüz premium video bulunmuyor.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
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
                        </>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { icon: '🎬', title: 'Özel İçerikler', desc: 'Sadece üyelere özel videolar' },
                                    { icon: '⚡', title: 'Erken Erişim', desc: 'Yeni içeriklere ilk siz erişin' },
                                    { icon: '🏆', title: 'HD Kalite', desc: '4K Ultra HD izleme deneyimi' }
                                ].map((feature) => (
                                    <div key={feature.title} className="text-center p-5 rounded-xl bg-card border border-border hover:border-amber-500/20 transition-colors">
                                        <div className="text-2xl mb-2">{feature.icon}</div>
                                        <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
                                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {videos.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-xs font-bold text-center text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Lock className="w-3.5 h-3.5" />
                                        Premium Kilitli İçerikler
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-40 pointer-events-none blur-[1px]">
                                        {videos.slice(0, 3).map((video) => (
                                            <div key={video.id}>
                                                <VideoCard
                                                    id={video.id}
                                                    title={video.title}
                                                    thumbnail={video.thumbnailUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"}
                                                    views={`${video.views} görüntüleme`}
                                                    duration={formatDuration(video.duration)}
                                                    uploader={video.user?.username || 'Anonim'}
                                                    uploaderAvatar={video.user?.avatarUrl}
                                                    isPremium={true}
                                                    date={formatDate(video.createdAt)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
