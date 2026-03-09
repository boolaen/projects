'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Wait for hydration and check if the user has already consented
        const hasConsented = localStorage.getItem('cookieConsent');
        if (!hasConsented) {
            // Small delay to make the entrance look more natural
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        setIsVisible(false);
        localStorage.setItem('cookieConsent', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 z-[9999] sm:max-w-md w-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="relative overflow-hidden rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl p-5 sm:p-6 group">
                {/* Visual Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 opacity-50"></div>

                <button
                    onClick={handleAccept}
                    className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-inner">
                            <Cookie className="w-5 h-5 text-red-500" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-sm font-bold text-white mb-1">Çerez Kullanımı</h3>
                        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                            Sizlere daha iyi bir deneyim sunabilmek, site içi analizler yapabilmek ve tercihlerini hatırlayabilmek için çerezleri kullanıyoruz. Sitemizi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                onClick={handleAccept}
                                size="sm"
                                className="w-full bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs"
                            >
                                Tümünü Kabul Et
                            </Button>
                            <Button
                                onClick={handleAccept}
                                variant="outline"
                                size="sm"
                                className="w-full border-white/10 hover:bg-white/5 text-zinc-300 font-medium rounded-lg text-xs"
                            >
                                Gerekli Olanlar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .animate-in {
                    animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideUpFade {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
