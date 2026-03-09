'use client';

import Link from 'next/link';
import { Tv, Send, ChevronRight, PlayCircle, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { useSiteSettings } from "@/components/site-settings-provider";

export function Footer() {
    const { siteName, logoUrl } = useSiteSettings();
    return (
        <footer className="relative mt-8 border-t border-border/30 overflow-hidden">
            {/* Cinematic Background Gradient & Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-black z-[-1]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-red-500/5 blur-[120px] rounded-full z-[-1]" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
                    {/* Brand & Intro (Col 1-4) */}
                    <div className="space-y-6 md:col-span-12 lg:col-span-4">
                        <Link href="/anasayfa" className="flex items-center gap-2.5 inline-block group">
                            {logoUrl ? (
                                <img src={logoUrl} alt={siteName} className="h-6 w-auto object-contain transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)] group-hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all">
                                    <Tv className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent uppercase font-black text-2xl tracking-tighter">
                                {siteName}
                            </span>
                        </Link>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm font-medium">
                            Sınırsız premium sinema arşivi. Yüksek çözünürlükte, reklamsız ve tamamen size özel kesintisiz seyir keyfini başlatın.
                        </p>

                        <div className="pt-2 flex items-center gap-3">
                            <a
                                href="https://t.me/sofistikadam"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-secondary/50 border border-border/50 text-foreground hover:bg-red-600 hover:border-red-500 hover:text-white transition-all shadow-sm"
                            >
                                <Send className="w-4 h-4 group-hover:-translate-y-[1px] group-hover:translate-x-[1px] transition-transform" />
                                <span className="text-sm font-bold tracking-wide">Destek Servisi</span>
                            </a>
                        </div>
                    </div>

                    {/* Links Column 1: Platform (Col 5-6) */}
                    <div className="space-y-5 md:col-span-4 lg:col-span-2 lg:col-start-6">
                        <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-red-500" /> Platform
                        </h4>
                        <nav className="flex flex-col gap-3.5">
                            <Link href="/anasayfa" className="text-sm text-muted-foreground hover:text-red-400 hover:translate-x-1 transition-all flex items-center gap-1.5 w-fit font-medium">
                                Anasayfa
                            </Link>
                            <Link href="/modeller" className="text-sm text-muted-foreground hover:text-red-400 hover:translate-x-1 transition-all flex items-center gap-1.5 w-fit font-medium">
                                Tüm Kategoriler
                            </Link>
                            <Link href="/premium" className="text-sm text-amber-500/80 hover:text-amber-500 hover:translate-x-1 transition-all flex items-center gap-1.5 w-fit font-medium">
                                Premium Ayrıcalıklar <Sparkles className="w-3 h-3" />
                            </Link>
                        </nav>
                    </div>

                    {/* Links Column 2: Account (Col 7-8) */}
                    <div className="space-y-5 md:col-span-4 lg:col-span-2">
                        <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                            <Tv className="w-4 h-4 text-red-500" /> Üyelik
                        </h4>
                        <nav className="flex flex-col gap-3.5">
                            <Link href="/abonelikler" className="text-sm text-muted-foreground hover:text-white hover:translate-x-1 transition-all w-fit font-medium">Üyelik Planları</Link>
                            <Link href="/profile/me" className="text-sm text-muted-foreground hover:text-white hover:translate-x-1 transition-all w-fit font-medium">Hesabım</Link>
                            <Link href="/ayarlar" className="text-sm text-muted-foreground hover:text-white hover:translate-x-1 transition-all w-fit font-medium">Ayarlar</Link>
                        </nav>
                    </div>

                    {/* Links Column 3: Legal & Corporate (Col 9-12) */}
                    <div className="space-y-5 md:col-span-4 lg:col-span-3">
                        <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-red-500" /> Kurumsal
                        </h4>
                        <nav className="flex flex-col gap-3.5">
                            <Link href="/hakkimizda" className="text-sm text-muted-foreground hover:text-white hover:translate-x-1 transition-all w-fit font-medium">Hakkımızda</Link>
                            <Link href="/gizlilik" className="text-sm text-muted-foreground hover:text-white hover:translate-x-1 transition-all w-fit font-medium">Gizlilik Politikası</Link>
                            <Link href="/kurallar" className="text-sm text-muted-foreground hover:text-white hover:translate-x-1 transition-all w-fit font-medium">Kullanım Şartları</Link>
                        </nav>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs md:text-sm text-muted-foreground/60 font-medium">
                        © {new Date().getFullYear()} <span className="text-foreground/80 font-bold">{siteName}</span>. Tüm hakları saklıdır.
                    </p>

                    <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium bg-black/50 px-4 py-2 rounded-full border border-white/5 shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-red-500" />
                        <span className="hidden md:block">Güvenli ve Reklamsız İzleme Deneyimi</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
