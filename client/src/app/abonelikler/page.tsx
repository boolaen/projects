'use client';

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown, Shield, ShieldQuestion, Loader2, Package, Play, Flame, Heart, Sparkles, Gem } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiFetch } from '@/lib/api';

const getIconComponent = (iconName: string, className: string) => {
    switch (iconName?.toLowerCase()) {
        case 'star': return <Star className={className} />;
        case 'zap': return <Zap className={className} />;
        case 'crown': return <Crown className={className} />;
        case 'shield': return <Shield className={className} />;
        case 'package': return <Package className={className} />;
        case 'play': return <Play className={className} />;
        case 'flame': return <Flame className={className} />;
        case 'heart': return <Heart className={className} />;
        case 'sparkles': return <Sparkles className={className} />;
        case 'gem': return <Gem className={className} />;
        default: return <ShieldQuestion className={className} />;
    }
};

export default function SubscriptionsPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiFetch('/packages')
            .then(res => res.json())
            .then(data => {
                setPackages(data);
                setIsLoading(false);
            })
            .catch(err => {
                // Error handled silently
                setIsLoading(false);
            });
    }, []);

    const handlePurchase = (pkgName: string) => {
        window.open(`https://t.me/sofistikadam?text=Merhaba, ${pkgName} paketini satın almak istiyorum.`, '_blank');
    };

    return (
        <div className="h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Ambient cinematic background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-600/5 blur-[80px] rounded-[50%] pointer-events-none opacity-50 will-change-transform" />

            <Navbar />

            <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 pb-4 max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-center items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center mb-6 space-y-2"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                        <Crown className="w-3.5 h-3.5" />
                        Sınırları Kaldır
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground dark:text-white drop-shadow-2xl">
                        PREMIUM DÜNYASI
                    </h1>
                    <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
                        Size özel içeriklere, yüksek kaliteye ve ayrıcalıklı özelliklere reklamsız erişin.
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center my-20">
                        <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
                        <p className="text-muted-foreground font-medium">Paketler yükleniyor...</p>
                    </div>
                ) : packages.length === 0 ? (
                    <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border text-muted-foreground w-full max-w-3xl mx-auto">
                        Hiçbir aktif paket bulunamadı.
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center items-stretch gap-5 lg:gap-8 max-w-6xl mx-auto w-full">
                        {packages.map((pkg, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.4, 0, 0.2, 1] }}
                                key={pkg.id}
                                className={`relative bg-card/95 rounded-2xl p-5 md:p-6 border border-border/50 flex flex-col gap-4 shadow-xl transition-all duration-300 w-full sm:w-[calc(50%-1.25rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md ${pkg.color ? `hover:${pkg.color.split(' ')[1]} ${pkg.color.split(' ')[0]}` : 'border-zinc-800 hover:border-zinc-600'} hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl will-change-transform group ${pkg.glow || ''}`}
                            >
                                {/* Inner ambient light leak on hover */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                        EN POPÜLER
                                    </div>
                                )}

                                <div className="flex items-center justify-between relative z-10">
                                    <h3 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
                                        {getIconComponent(pkg.icon, 'w-6 h-6 text-foreground')} {pkg.name}
                                    </h3>
                                </div>

                                <div className="flex items-baseline gap-1 relative z-10 -mt-1">
                                    <span className="text-3xl md:text-4xl font-black text-foreground">{pkg.price}</span>
                                    <span className="text-xs md:text-sm text-muted-foreground font-medium">{pkg.duration}</span>
                                </div>

                                <div className="h-px bg-border/50 w-full relative z-10" />

                                <ul className="flex-1 space-y-3 relative z-10">
                                    {pkg.features.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3 text-xs md:text-sm text-foreground/80 font-medium leading-snug">
                                            <div className="mt-0.5 rounded-full bg-green-500/20 p-0.5 ring-1 ring-green-500/30 shrink-0">
                                                <Check className="w-3 h-3 text-green-400" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full py-4 text-sm font-black tracking-wide shadow-xl transition-all duration-300 relative z-10 rounded-xl mt-2 ${pkg.buttonColor || 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                                    onClick={() => handlePurchase(pkg.name)}
                                >
                                    SATIN AL
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="mt-6 text-center text-muted-foreground text-[10px] sm:text-xs relative z-10">
                    <p>Ödemeler güvenli bir şekilde işlenir. İstediğiniz zaman iptal edebilirsiniz.</p>
                    <p className="mt-0.5">
                        Sorularınız için <Link href="https://t.me/sofistikadam" className="text-red-500 hover:underline">tıklayın</Link>.
                    </p>
                </div>
            </main>
        </div>
    );
}

