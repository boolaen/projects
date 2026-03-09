'use client';

import { Navbar } from "@/components/navbar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, ThumbsUp, ThumbsDown, Share2, Clock, Eye,
    ChevronDown, ChevronUp, Maximize2, Minimize2, SkipForward,
    Volume2, VolumeX, Flag, Bookmark, BookmarkCheck, Play,
    UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { CommentSection } from "@/components/comment-section";
import { MovieInfo } from "@/components/movie-info";
import { apiFetch } from '@/lib/api';

/* ── Sidebar Video Card (vertical list on right) ── */
function SidebarCard({ video, isNext }: { video: any; isNext?: boolean }) {
    return (
        <Link href={`/watch/${video.id}`} className={`flex gap-3 group p-2 rounded-xl transition-all duration-200
            ${isNext
                ? 'bg-red-500/5 border border-red-500/10 hover:bg-red-500/10'
                : 'hover:bg-secondary/50'}`}>
            <div className="relative w-40 aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0">
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                {video.isPremium && (
                    <div className="absolute top-1 left-1 bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-md z-10">
                        PREMIUM
                    </div>
                )}
                {isNext && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white" />
                    </div>
                )}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                    {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                </div>
            </div>
            <div className="flex flex-col gap-1 overflow-hidden min-w-0 py-0.5">
                {isNext && (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Sıradaki</span>
                )}
                <h4 className="text-sm font-medium line-clamp-2 leading-snug text-foreground group-hover:text-red-500 transition-colors">
                    {video.title}
                </h4>
                <p className="text-xs text-muted-foreground">{video.user?.username || 'Anonim'}</p>
                <p className="text-xs text-muted-foreground">{video.views || 0} görüntüleme</p>
            </div>
        </Link>
    );
}

/* ── Watch Page ── */
export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [video, setVideo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ likes: 0, dislikes: 0 });
    const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
    const [premiumError, setPremiumError] = useState<string | null>(null);
    const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
    const [descExpanded, setDescExpanded] = useState(false);

    // Enhanced features state
    const [isTheater, setIsTheater] = useState(false);
    const [autoplay, setAutoplay] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [userLikeState, setUserLikeState] = useState<'like' | 'dislike' | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (id) {
            fetchVideo();
            fetchStats();
            incrementView();
            fetchRelatedVideos();
        }
    }, [id]);

    /* ── Keyboard shortcuts ── */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    if (videoRef.current) {
                        videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
                    }
                    break;
                case 'f':
                    e.preventDefault();
                    if (videoRef.current) {
                        if (document.fullscreenElement) {
                            document.exitFullscreen();
                        } else {
                            videoRef.current.requestFullscreen?.();
                        }
                    }
                    break;
                case 't':
                    e.preventDefault();
                    setIsTheater(p => !p);
                    break;
                case 'm':
                    e.preventDefault();
                    if (videoRef.current) {
                        videoRef.current.muted = !videoRef.current.muted;
                        setIsMuted(videoRef.current.muted);
                    }
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    if (videoRef.current) videoRef.current.currentTime -= 5;
                    break;
                case 'arrowright':
                    e.preventDefault();
                    if (videoRef.current) videoRef.current.currentTime += 5;
                    break;
                case 'arrowup':
                    e.preventDefault();
                    if (videoRef.current) videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    if (videoRef.current) videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
                    break;
                case 'n':
                    if (autoplay && relatedVideos.length > 0) {
                        router.push(`/watch/${relatedVideos[0].id}`);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [autoplay, relatedVideos, router]);

    const fetchVideo = async () => {
        try {
            const res = await apiFetch(`/videos/${id}`);
            if (res.ok) {
                const data = await res.json();
                setVideo(data);
                if (data.isPremium) {
                    checkPremiumAccess(data.id);
                } else {
                    setPlaybackUrl(data.hlsUrl);
                }
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsLoading(false);
        }
    };

    const checkPremiumAccess = async (videoId: string) => {
        try {
            const res = await apiFetch(`/videos/${videoId}/access`);
            if (res.ok) {
                const data = await res.json();
                setPlaybackUrl(data.playbackUrl);
            } else {
                setPremiumError("Bu videoyu izlemek için PREMIUM üye olmalısınız.");
            }
        } catch {
            setPremiumError("Erişim hatası.");
        }
    };

    const fetchStats = async () => {
        try {
            const res = await apiFetch(`/interactions/stats/${id}`);
            if (res.ok) setStats(await res.json());
        } catch { }
    };

    const incrementView = async () => {
        try {
            await apiFetch(`/interactions/view/${id}`, { method: 'POST' });
        } catch { }
    };

    const fetchRelatedVideos = async () => {
        try {
            const res = await apiFetch('/videos');
            if (res.ok) {
                const data = await res.json();
                setRelatedVideos(data.filter((v: any) => v.id !== id));
            }
        } catch { }
    };

    const handleLike = async (isLike: boolean) => {
        try {
            const res = await apiFetch(`/interactions/like/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLike })
            });
            if (res.status === 401 || res.status === 403) {
                return toast.error("Lütfen giriş yapın.");
            }
            if (res.ok) {
                fetchStats();
                setUserLikeState(isLike ? 'like' : 'dislike');
                toast.success(isLike ? 'Beğenildi!' : 'Geri bildirim alındı.');
            } else {
                const err = await res.json();
                toast.error(`Hata: ${err.message}`);
            }
        } catch {
            toast.error("Bir hata oluştu.");
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/watch/${id}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: video?.title || 'Video', url });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success('Link kopyalandı!');
            }
        } catch {
            try {
                await navigator.clipboard.writeText(url);
                toast.success('Link kopyalandı!');
            } catch {
                toast.error('Paylaşılamadı.');
            }
        }
    };

    const handleVideoEnd = () => {
        if (autoplay && relatedVideos.length > 0) {
            toast.info('Sıradaki videoya geçiliyor...', { duration: 2000 });
            setTimeout(() => router.push(`/watch/${relatedVideos[0].id}`), 2000);
        }
    };

    const formatDate = (d: string) => {
        return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatNumber = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(1)}B`;
        return n.toString();
    };

    /* ── Loading ── */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    /* ── Not Found ── */
    if (!video) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <Play className="w-10 h-10 text-red-500/50" />
                </div>
                <p className="text-xl font-semibold">Video bulunamadı</p>
                <p className="text-sm text-muted-foreground">Bu video silinmiş veya erişiminiz yok olabilir.</p>
                <Link href="/anasayfa"><Button>Anasayfaya Dön</Button></Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar hideSidebar />

            <main className={`flex-1 pt-16 w-full mx-auto pb-12 transition-all duration-300
                ${isTheater ? 'max-w-full px-0' : 'max-w-[1400px] px-4 sm:px-6'}`}>

                {/* Back button */}
                {!isTheater && (
                    <Link href="/anasayfa" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-3">
                        <ArrowLeft className="w-4 h-4" />
                        Geri
                    </Link>
                )}

                {/* ── 2-Column Grid ── */}
                <div className={`grid gap-6 ${isTheater ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>

                    {/* LEFT: Video + Info + Comments */}
                    <div className={`space-y-4 ${isTheater ? '' : 'lg:col-span-2'}`}>

                        {/* Video Player Container */}
                        <div className={`relative bg-black overflow-hidden group/player
                            ${isTheater ? 'w-full aspect-[21/9]' : 'w-full aspect-video rounded-xl'}`}>
                            {premiumError ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-black to-zinc-900 text-center p-6 gap-5">
                                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <span className="text-4xl">🔒</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Premium İçerik</h2>
                                        <p className="text-zinc-400 mt-1 text-sm">{premiumError}</p>
                                    </div>
                                    <Link href="/abonelikler">
                                        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-8 py-3 rounded-full shadow-lg shadow-amber-500/20">
                                            Premium'a Yükselt
                                        </Button>
                                    </Link>
                                </div>
                            ) : playbackUrl ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        controls
                                        autoPlay
                                        preload="metadata"
                                        className="w-full h-full object-contain"
                                        style={{ colorScheme: 'normal' }}
                                        poster={video.thumbnailUrl || undefined}
                                        onContextMenu={(e) => e.preventDefault()}
                                        controlsList="nodownload"
                                        onEnded={handleVideoEnd}
                                    >
                                        <source src={playbackUrl} type="video/mp4" />
                                    </video>

                                    {/* Theater mode & extra controls overlay */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => setIsMuted(m => { if (videoRef.current) videoRef.current.muted = !m; return !m; })}
                                            className="p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg text-white transition-colors"
                                            title={isMuted ? 'Sesi aç (M)' : 'Sessize al (M)'}
                                        >
                                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => setIsTheater(t => !t)}
                                            className="p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg text-white transition-colors"
                                            title={isTheater ? 'Normal mod (T)' : 'Sinema modu (T)'}
                                        >
                                            {isTheater ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Title + Actions */}
                        <div className={`space-y-3 ${isTheater ? 'max-w-[1400px] mx-auto px-4 sm:px-6' : ''}`}>
                            <h1 className="text-xl sm:text-2xl font-bold leading-tight">{video.title}</h1>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                {/* Professional Meta Info */}
                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide">
                                    <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-md">4K ULTRA HD</span>
                                    <span className="bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 px-2.5 py-1 rounded-md">YÜKSEK KALİTE</span>
                                    {video.category && (
                                        <Link href={`/modeller/${video.category}`} className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 px-2.5 py-1 rounded-md transition-colors">
                                            {video.category.toUpperCase()}
                                        </Link>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* Like/Dislike pill */}
                                    <div className="flex items-center bg-secondary rounded-full overflow-hidden">
                                        <button
                                            onClick={() => handleLike(true)}
                                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-r border-border
                                                ${userLikeState === 'like' ? 'bg-red-500/10 text-red-500' : 'hover:bg-secondary/70'}`}
                                        >
                                            <ThumbsUp className={`w-4 h-4 ${userLikeState === 'like' ? 'fill-current' : ''}`} />{formatNumber(stats.likes)}
                                        </button>
                                        <button
                                            onClick={() => handleLike(false)}
                                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors
                                                ${userLikeState === 'dislike' ? 'bg-zinc-500/10 text-zinc-400' : 'hover:bg-secondary/70'}`}
                                        >
                                            <ThumbsDown className={`w-4 h-4 ${userLikeState === 'dislike' ? 'fill-current' : ''}`} />{formatNumber(stats.dislikes)}
                                        </button>
                                    </div>

                                    {/* Share */}
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-secondary rounded-full hover:bg-secondary/70 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />Paylaş
                                    </button>

                                    {/* Bookmark */}
                                    <button
                                        onClick={() => { setIsBookmarked(!isBookmarked); toast.success(isBookmarked ? 'Kaydedilenlerden kaldırıldı' : 'Kaydedildi!'); }}
                                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-colors
                                            ${isBookmarked ? 'bg-amber-500/10 text-amber-500' : 'bg-secondary hover:bg-secondary/70'}`}
                                    >
                                        {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                    </button>

                                    {/* Report */}
                                    <button
                                        onClick={() => toast.info('Raporlama özelliği yakında eklenecek.')}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-secondary rounded-full hover:bg-secondary/70 transition-colors"
                                    >
                                        <Flag className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Uploader Card */}
                        <div className={`${isTheater ? 'max-w-[1400px] mx-auto px-4 sm:px-6' : ''}`}>
                            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                                <Link href={`/profile/${video.user?.username || ''}`} className="flex items-center gap-3 group">
                                    {video.user?.avatarUrl ? (
                                        <img src={video.user.avatarUrl} alt={video.user.username} className="w-10 h-10 rounded-full object-cover ring-2 ring-border group-hover:ring-red-500/30 transition-all" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center text-white font-bold text-sm ring-2 ring-border">
                                            {video.user?.username?.[0]?.toUpperCase() || <UserCircle className="w-5 h-5" />}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-sm group-hover:text-red-500 transition-colors">{video.user?.username || 'Anonim'}</p>
                                        <p className="text-xs text-muted-foreground">İçerik üreticisi</p>
                                    </div>
                                </Link>
                                <Link href={`/profile/${video.user?.username || ''}`}>
                                    <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold">
                                        Profili Gör
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Movie Info Component */}
                        <div className={`${isTheater ? 'max-w-[1400px] mx-auto px-4 sm:px-6' : ''}`}>
                            <MovieInfo
                                title={video.title}
                                category={video.category}
                                views={video.views || 0}
                            />
                        </div>

                        {/* Keyboard shortcuts hint */}
                        <div className={`${isTheater ? 'max-w-[1400px] mx-auto px-4 sm:px-6' : ''}`}>
                            <div className="hidden md:flex items-center gap-4 text-[11px] text-muted-foreground/50 px-1">
                                <span><kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono text-[10px]">Space</kbd> Oynat/Duraklat</span>
                                <span><kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono text-[10px]">T</kbd> Sinema modu</span>
                                <span><kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono text-[10px]">F</kbd> Tam ekran</span>
                                <span><kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono text-[10px]">M</kbd> Sessize al</span>
                                <span><kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono text-[10px]">←→</kbd> 5sn atla</span>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className={`pt-4 border-t border-border ${isTheater ? 'max-w-[1400px] mx-auto px-4 sm:px-6' : ''}`}>
                            <CommentSection videoId={id} />
                        </div>
                    </div>

                    {/* RIGHT: Related Videos */}
                    {!isTheater && (
                        <div className="lg:col-span-1">
                            {/* Autoplay toggle */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold">Sıradaki Videolar</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Otomatik</span>
                                    <button
                                        onClick={() => setAutoplay(!autoplay)}
                                        className={`relative w-9 h-5 rounded-full transition-colors duration-200
                                            ${autoplay ? 'bg-red-500' : 'bg-zinc-600'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                                            ${autoplay ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                {relatedVideos.length > 0 ? (
                                    relatedVideos.map((rv: any, idx: number) => (
                                        <SidebarCard key={rv.id} video={rv} isNext={idx === 0 && autoplay} />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center py-10 text-center">
                                        <Play className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">Başka video bulunamadı</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
