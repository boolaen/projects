'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link';
import { Tv, Mail, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';
import { apiFetch, api } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await apiFetch('/auth/request-password-reset', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
            } else {
                setStatus('error');
                setMessage(data.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyin.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl border border-border shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-amber-500"></div>
                <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-red-600/10 rounded-full">
                        <Mail className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black text-center tracking-tight">Şifremi Unuttum</h1>
                    <p className="text-muted-foreground text-sm text-center">
                        E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
                    </p>
                </div>

                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-xl text-center space-y-4"
                    >
                        <p className="font-medium text-base">{message}</p>
                        <p className="text-muted-foreground text-xs">Ayrıca spam/gereksiz klasörünü kontrol etmeyi unutmayın.</p>
                        <div className="pt-4">
                            <Link href="/login">
                                <Button variant="outline" className="w-full font-bold">Tekrar Giriş Yap</Button>
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'error' && (
                            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md text-center">
                                {message}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Kayıtlı E-posta Adresiniz</Label>
                            <Input id="email" type="email" placeholder="ornek@email.com" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="bg-background border-input h-12"
                                disabled={status === 'loading'}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>Bağlantı Gönder <ArrowRight className="w-4 h-4 ml-1" /></>
                            )}
                        </Button>
                    </form>
                )}

                <div className="relative pt-2">
                    <p className="text-center text-sm text-muted-foreground">
                        Şifrenizi hatırladınız mı? <Link href="/login" className="text-red-500 hover:underline font-bold">Giriş Yapın</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
