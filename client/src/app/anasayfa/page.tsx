'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Flame, Layers, Crown, ArrowRight, Clock, Play, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { useSiteSettings } from "@/components/site-settings-provider";
import { apiFetch, api } from '@/lib/api';
import { useRef } from 'react';
import { DraggableRow } from "@/components/draggable-row";

export default function DashboardPage() {
    const { siteName } = useSiteSettings();
    const router = useRouter();
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [user, setUser] = useState<any>(null);
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() => {
        apiFetch('/users/me')
            .then(async res => {
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setIsAuthed(true);
                }
                else router.push('/login');
            })
            .catch(() => router.push('/login'));
    }, [router]);

    useEffect(() => {
        if (isAuthed) fetchVideos();
    }, [selectedCategory, isAuthed]);



    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            let url = api('/videos');
            if (selectedCategory === 'Trending') url = api('/videos/trending');
            else if (selectedCategory !== 'All') url = api(`/videos?category=${selectedCategory}`);

            const res = await fetch(url, { credentials: 'include' });
            if (res.ok) setVideos(await res.json());
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

    const [categories, setCategories] = useState([
        { label: 'Tümü', value: 'All', icon: Layers },
        { label: 'Trendler', value: 'Trending', icon: Flame },
    ]);

    useEffect(() => {
        apiFetch('/videos/categories')
            .then(res => res.json())
            .then((data: any[]) => {
                const dynamic = data.map(c => ({
                    label: c.name,
                    value: c.slug || c.name,
                    icon: null as any,
                }));
                setCategories(prev => [
                    { label: 'Tümü', value: 'All', icon: Layers },
                    { label: 'Trendler', value: 'Trending', icon: Flame },
                    ...dynamic,
                ]);
            })
            .catch(() => { });
    }, []);

    const sectionTitle = useMemo(() => {
        switch (selectedCategory) {
            case 'All': return 'Keşfet';
            case 'Premium': return 'Premium İçerik';
            case 'Trending': return 'Trendler';
            case 'New': return 'Yeni Eklenenler';
            default: return categories.find(c => c.value === selectedCategory)?.label || selectedCategory;
        }
    }, [selectedCategory, categories]);

    const topViewedIds = useMemo(() => {
        if (!videos || videos.length === 0) return [];
        const sorted = [...videos].sort((a, b) => b.views - a.views);
        return sorted.slice(0, 5).map(v => v.id);
    }, [videos]);

    // Group videos for the Netflix-style layout
    const videoGroups = useMemo(() => {
        if (!videos || videos.length === 0) return [];

        const popular = [...videos].sort((a, b) => b.views - a.views).slice(0, 10);
        const newest = [...videos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
        const premium = videos.filter(v => v.isPremium).slice(0, 10);

        // Everything else or specific category if not 'All'
        const rest = selectedCategory === 'All'
            ? videos.filter(v => !popular.find(p => p.id === v.id) && !newest.find(n => n.id === v.id))
            : videos;

        return [
            { id: 'popular', title: 'Popüler İçerikler', items: popular, showRank: true },
            { id: 'newest', title: 'Yeni Eklenenler', items: newest },
            { id: 'premium', title: 'Sadece Premium', items: premium, icon: Crown },
            { id: 'rest', title: selectedCategory === 'All' ? 'Önerilenler' : sectionTitle, items: rest }
        ].filter(group => group.items.length > 0);
    }, [videos, selectedCategory, sectionTitle]);

    const scrollRow = (rowId: string, direction: 'left' | 'right') => {
        const container = document.getElementById(`row-${rowId}`);
        if (container) {
            const scrollAmount = window.innerWidth > 768 ? window.innerWidth * 0.7 : window.innerWidth * 0.9;
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (!isAuthed) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-[1800px] mx-auto w-full space-y-8">

                {/* Hero Banner (Lag oluşturmayan, donanım hızlandırmalı CSS, Netflix benzeri tasarım) */}
                <div className="relative w-full h-[50vh] min-h-[350px] max-h-[480px] rounded-2xl overflow-hidden border border-border/50 group transform-gpu shadow-2xl">
                    <div className="absolute inset-0 w-full h-full bg-secondary/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop"
                            alt="Featured Banner"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-[1200ms] ease-out"
                            fetchPriority="high"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-background xl:via-background/90 md:via-background/70 to-transparent w-full md:w-[85%] z-10 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10 pointer-events-none"></div>
                    </div>

                    <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-12 md:px-16 w-full md:w-[70%] xl:w-[60%]">
                        <div className="animate-fade-in-up space-y-5">
                            <span className="px-3 py-1.5 text-[11px] sm:text-xs font-bold tracking-wider text-red-600 dark:text-red-500 bg-red-500/10 dark:bg-red-500/10 rounded-full border border-red-500/20 backdrop-blur-md w-fit flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5" />
                                YENİ VE POPÜLER
                            </span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-[1.15] drop-shadow-sm dark:drop-shadow-2xl">
                                En Kaliteli <span className="bg-gradient-to-r from-red-600 to-amber-600 dark:from-red-500 dark:to-amber-500 bg-clip-text text-transparent">Premium</span> İçeriklere Göz Atın
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground md:text-gray-700 dark:md:text-gray-300 max-w-lg font-medium drop-shadow-sm dark:drop-shadow-md leading-relaxed hidden sm:block">
                                Kesintisiz, yüksek çözünürlüklü ve tamamen size özel yepyeni içerikler. Sınırları kaldıran reklamsız izleme deneyimini hemen keşfetmeye başlayın.
                            </p>
                            <p className="text-sm text-muted-foreground md:text-gray-700 dark:md:text-gray-300 max-w-lg font-medium drop-shadow-sm dark:drop-shadow-md sm:hidden">
                                Kesintisiz ve reklamsız içerikleri hemen keşfedin.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Link href="/premium">
                                    <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-xl font-bold px-6 sm:px-8 h-12 flex items-center gap-2 shadow-xl shadow-foreground/10 shrink-0">
                                        <Play className="w-5 h-5 fill-background" />
                                        Hemen Keşfet
                                    </Button>
                                </Link>
                                <Link href="/hakkimizda">
                                    <Button variant="secondary" size="lg" className="bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 backdrop-blur-md rounded-xl font-bold px-6 sm:px-8 h-12 flex items-center gap-2 transition-colors shrink-0">
                                        <Info className="w-5 h-5" />
                                        Daha Fazla Bilgi
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Welcome + Category Bar */}
                <section className="w-full pt-2 pb-2 animate-fade-in-up space-y-4">
                    {/* Top Row: Welcome + Quick Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-foreground tracking-tight">Keşfet</h1>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                {videos.length > 0 && <span>— {videos.length} video listeleniyor</span>}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/premium" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold hover:from-amber-500/20 hover:to-orange-500/20 transition-all">
                                <Crown className="w-3.5 h-3.5" />
                                Premium
                            </Link>
                            <Link href="/modeller" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary/60 border border-border/50 text-muted-foreground text-xs font-semibold hover:text-foreground hover:bg-secondary transition-all">
                                <Layers className="w-3.5 h-3.5" />
                                Kategoriler
                                <ArrowRight className="w-3 h-3 opacity-50" />
                            </Link>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {categories.map(cat => {
                            const isActive = selectedCategory === cat.value;
                            return (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-all duration-200 rounded-lg shrink-0 ${isActive
                                        ? 'bg-red-500 text-white shadow-sm'
                                        : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border/50'
                                        }`}
                                >
                                    {cat.icon && <cat.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />}
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Promotional Banner */}
                {(!user || (user.role !== 'PREMIUM' && user.role !== 'ADMIN')) && (
                    <section className="relative w-full overflow-hidden rounded-2xl border border-red-500/20 bg-secondary/40 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent pointer-events-none" />
                        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
                            <Crown className="w-48 h-48 text-amber-500 rotate-12" />
                        </div>

                        <div className="relative p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                            <div className="flex flex-col space-y-3 w-full md:max-w-2xl text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2.5">
                                    <Crown className="w-7 h-7 text-amber-500 fill-amber-500/20" />
                                    Premium Ayrıcalıklarını Keşfet
                                </h3>
                                <p className="text-muted-foreground font-medium text-sm md:text-base leading-relaxed">
                                    Sinema salonunu evinize getirin. Yüksek çözünürlük, tamamen reklamsız ve kesintisiz izleme deneyimi için hemen <span className="text-amber-600 dark:text-amber-500 font-bold">Premium'a</span> geçiş yapın.
                                </p>
                            </div>
                            <div className="shrink-0 w-full md:w-auto flex items-center">
                                <Link href="/premium" className="w-full md:w-auto">
                                    <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-bold px-8 h-12 rounded-xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                                        Premium'a Katıl
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Video Rows (Netflix Style) */}
                <section className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    {isLoading ? (
                        <div className="space-y-8">
                            {[...Array(3)].map((_, rowIndex) => (
                                <div key={rowIndex} className="space-y-4">
                                    <div className="w-48 h-6 bg-secondary/50 rounded animate-pulse" />
                                    <div className="flex gap-4 overflow-hidden">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-[280px] shrink-0 space-y-3">
                                                <div className="aspect-video bg-secondary rounded-xl animate-pulse" />
                                                <div className="h-4 bg-secondary rounded w-3/4 animate-pulse" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-secondary/30 rounded-2xl border border-border/30 space-y-3">
                            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                                <Sparkles className="w-7 h-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Kategori Boş</h3>
                            <p className="text-muted-foreground text-sm max-w-xs text-center">
                                Bu kategoride henüz içerik bulunmuyor.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8 md:gap-12 pb-10">
                            {videoGroups.map((group) => (
                                <div key={group.id} className="relative group/row flex flex-col pt-2">
                                    {/* Row Header */}
                                    <div className="flex items-center justify-between mb-3 px-1 md:px-0">
                                        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 tracking-tight text-foreground/90 hover:text-foreground transition-colors cursor-pointer">
                                            {group.icon && <group.icon className="w-5 h-5 text-amber-500" />}
                                            {group.title}
                                            <ChevronRight className="w-5 h-5 opacity-0 -ml-2 group-hover/row:opacity-100 group-hover/row:ml-0 transition-all text-red-500" />
                                        </h2>
                                    </div>

                                    {/* Carousel Container */}
                                    <div className="relative w-full">
                                        {/* Navigation Arrows (Desktop Only) */}
                                        <button
                                            onClick={() => scrollRow(group.id, 'left')}
                                            className="absolute left-0 top-[40%] -translate-y-1/2 z-40 p-2 opacity-0 group-hover/row:opacity-100 transition-opacity max-md:hidden -ml-6"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:scale-110 hover:bg-black transition-all">
                                                <ChevronLeft className="w-6 h-6 text-white" />
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => scrollRow(group.id, 'right')}
                                            className="absolute right-0 top-[40%] -translate-y-1/2 z-40 p-2 opacity-0 group-hover/row:opacity-100 transition-opacity max-md:hidden -mr-6"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:scale-110 hover:bg-black transition-all">
                                                <ChevronRight className="w-6 h-6 text-white" />
                                            </div>
                                        </button>

                                        {/* Scrollable Container with Drag Support */}
                                        <DraggableRow
                                            id={`row-${group.id}`}
                                            className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
                                        >
                                            {group.items.map((video, index) => (
                                                <Link
                                                    href={`/watch/${video.id}`}
                                                    key={video.id}
                                                    className="block shrink-0 w-[260px] sm:w-[280px] md:w-[320px] snap-start hover:z-30 relative"
                                                >
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
                                                        isTopViewed={topViewedIds.includes(video.id)}
                                                        layout={group.showRank ? 'trending' : 'default'}
                                                        rank={group.showRank ? index + 1 : undefined}
                                                    />
                                                </Link>
                                            ))}
                                        </DraggableRow>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>

            <Footer />
        </div >
    );
}
