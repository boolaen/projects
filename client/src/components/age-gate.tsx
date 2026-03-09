'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export function AgeGate({ children }: { children: React.ReactNode }) {
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verified = localStorage.getItem('age-verified');
        if (verified === 'true') setIsVerified(true);
        setIsLoading(false);
    }, []);

    const handleVerify = () => {
        localStorage.setItem('age-verified', 'true');
        setIsVerified(true);
    };

    const handleExit = () => {
        window.location.href = 'https://google.com';
    };

    if (isLoading) {
        return <div className="min-h-screen bg-background" />;
    }

    return (
        <>
            <AnimatePresence>
                {!isVerified && (
                    <motion.div
                        key="age-gate-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.4 } }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                            className="relative max-w-md w-full space-y-8 text-center border border-white/10 p-10 rounded-2xl bg-zinc-900/90 shadow-2xl"
                        >
                            <div className="flex justify-center">
                                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                    <ShieldAlert className="w-7 h-7 text-red-500" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-3xl font-black tracking-tight text-white">
                                    Yaş Doğrulama
                                </h1>
                                <p className="text-base text-zinc-400 font-medium leading-relaxed">
                                    Bu platform yalnızca 18 yaş ve üzeri bireyler içindir. Devam etmek için yaşınızı doğrulayın.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <Button
                                    size="lg"
                                    className="w-full bg-white hover:bg-zinc-100 text-black font-bold py-6 text-base rounded-xl transition-all duration-200 hover:scale-[1.01]"
                                    onClick={handleVerify}
                                >
                                    EVET, 18 YAŞINDAN BÜYÜĞÜM
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full border-white/10 hover:bg-white/5 text-zinc-400 font-medium py-5 text-sm rounded-xl transition-all duration-200"
                                    onClick={handleExit}
                                >
                                    Hayır, Çıkış Yap
                                </Button>
                            </div>

                            <p className="text-xs text-zinc-600 font-medium">
                                Giriş yaparak kullanım şartlarını kabul etmiş olursunuz.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={false}
                animate={{ opacity: isVerified ? 1 : 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className={!isVerified ? "h-screen overflow-hidden pointer-events-none" : ""}
            >
                {children}
            </motion.div>
        </>
    );
}
