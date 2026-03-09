'use client';

import { Navbar } from "@/components/navbar";
import NextLink from "next/link";
import { Compass, Layers, ArrowRight, Sparkles, TrendingUp, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from '@/lib/api';

/* ── Color palette for category cards ── */
const gradients = [
    { bg: 'from-rose-500/20 to-pink-500/10', border: 'hover:border-rose-500/30', text: 'text-rose-500', glow: 'group-hover:shadow-rose-500/10' },
    { bg: 'from-amber-500/20 to-orange-500/10', border: 'hover:border-amber-500/30', text: 'text-amber-500', glow: 'group-hover:shadow-amber-500/10' },
    { bg: 'from-blue-500/20 to-indigo-500/10', border: 'hover:border-blue-500/30', text: 'text-blue-500', glow: 'group-hover:shadow-blue-500/10' },
    { bg: 'from-emerald-500/20 to-teal-500/10', border: 'hover:border-emerald-500/30', text: 'text-emerald-500', glow: 'group-hover:shadow-emerald-500/10' },
    { bg: 'from-purple-500/20 to-violet-500/10', border: 'hover:border-purple-500/30', text: 'text-purple-500', glow: 'group-hover:shadow-purple-500/10' },
    { bg: 'from-cyan-500/20 to-sky-500/10', border: 'hover:border-cyan-500/30', text: 'text-cyan-500', glow: 'group-hover:shadow-cyan-500/10' },
    { bg: 'from-pink-500/20 to-fuchsia-500/10', border: 'hover:border-pink-500/30', text: 'text-pink-500', glow: 'group-hover:shadow-pink-500/10' },
    { bg: 'from-orange-500/20 to-red-500/10', border: 'hover:border-orange-500/30', text: 'text-orange-500', glow: 'group-hover:shadow-orange-500/10' },
];

export default function ModelsPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiFetch('/videos/categories')
            .then(res => res.json())
            .then((data) => {
                setCategories(data);
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                {/* Hero Header */}
                <div className="relative mb-12">
                    {/* Background deco */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/15 text-red-500 text-xs font-bold uppercase tracking-wider">
                            <Compass className="w-3.5 h-3.5" />
                            Keşfet
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                            Kategoriler
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                            İlgi alanınıza en uygun içerikleri keşfedin ve öğrenmeye başlayın.
                        </p>
                    </div>
                </div>

                {/* Quick Access Row */}
                <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    <NextLink
                        href="/modeller/All"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors shrink-0 shadow-sm shadow-red-500/20"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Tümünü Gör
                    </NextLink>
                    <NextLink
                        href="/modeller/Trending"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/80 border border-border transition-colors shrink-0"
                    >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Trendler
                    </NextLink>
                </div>

                {/* Categories Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-44 rounded-2xl bg-secondary/50 animate-pulse" />
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                            <Layers className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <p className="text-lg font-semibold text-foreground">Henüz kategori eklenmemiş</p>
                        <p className="text-sm text-muted-foreground mt-1">Admin panelden kategori ekleyebilirsiniz.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat, idx) => {
                            const colors = gradients[idx % gradients.length];
                            return (
                                <NextLink href={`/ara?q=${cat.slug || cat.name}`} key={cat.id} className="block group">
                                    <div className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.border} ${colors.glow}`}>
                                        {/* Gradient background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        {/* Content */}
                                        <div className="relative z-10">
                                            {/* Icon + Arrow */}
                                            <div className="flex items-start justify-between mb-5">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center border border-border/50 text-xl group-hover:scale-110 transition-transform duration-300`}>
                                                    {cat.icon?.[0] || '📁'}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-secondary transition-colors">
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h2 className={`text-lg font-bold tracking-tight mb-1.5 group-hover:${colors.text} transition-colors duration-200`}>
                                                {cat.name}
                                            </h2>

                                            {/* Description */}
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                                                {cat.description || 'Bu kategorideki içerikleri keşfedin.'}
                                            </p>

                                            {/* Footer */}
                                            <div className="flex items-center gap-2">
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary/60 ${colors.text} border border-border/30`}>
                                                    <Play className="w-3 h-3" />
                                                    Keşfet
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </NextLink>
                            );
                        })}
                    </div>
                )}

                {/* Bottom CTA */}
                {categories.length > 0 && (
                    <div className="mt-12 text-center">
                        <div className="inline-flex flex-col items-center gap-3 p-8 rounded-2xl bg-gradient-to-b from-secondary/50 to-transparent border border-border/30">
                            <p className="text-sm text-muted-foreground font-medium">
                                Aradığınızı bulamadınız mı?
                            </p>
                            <NextLink
                                href="/modeller/All"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors"
                            >
                                Tüm içerikleri görüntüle
                                <ArrowRight className="w-4 h-4" />
                            </NextLink>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
