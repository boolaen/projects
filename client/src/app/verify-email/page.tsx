'use client';
import { useState, Suspense, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';

const attemptedTokens = new Set<string>();

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('E-postanız doğrulanıyor, lütfen bekleyin...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Geçersiz veya eksik doğrulama bağlantısı.');
            return;
        }

        // Prevent double execution in strict mode
        if (attemptedTokens.has(token)) return;
        attemptedTokens.add(token);

        const verifyToken = async () => {
            try {
                const res = await apiFetch(`/auth/verify-email?token=${token}`);
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message || 'E-posta adresiniz başarıyla doğrulandı.');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Doğrulama başarısız. Bağlantı süresi dolmuş olabilir.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyin.');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
            {status === 'loading' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold">Doğrulanıyor...</h2>
                    <p className="text-muted-foreground">{message}</p>
                </motion.div>
            )}

            {status === 'success' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-green-500">Doğrulama Başarılı!</h2>
                    <p className="text-muted-foreground px-4">
                        {message} Artık hesabınızı tüm premium özellikleri ile kullanmaya başlayabilirsiniz.
                    </p>

                    <div className="w-full pt-6 border-t border-border mt-6">
                        <Link href="/login" className="block w-full">
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02]">
                                Hesabına Giriş Yap
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            )}

            {status === 'error' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black text-red-500">Doğrulama Başarısız</h2>
                    <p className="text-muted-foreground px-4">
                        {message}
                    </p>

                    <div className="w-full pt-6 border-t border-border mt-6">
                        <Link href="/" className="block w-full">
                            <Button variant="outline" className="w-full font-bold h-12">
                                Anasayfaya Dön
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="w-full max-w-md p-8 bg-card rounded-xl border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>

                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Yükleniyor...</p>
                    </div>
                }>
                    <VerifyEmailContent />
                </Suspense>

            </div>
        </div>
    );
}
