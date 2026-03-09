'use client';
import { useState, Suspense, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from 'framer-motion';
import { apiFetch, api } from '@/lib/api';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Geçersiz veya eksik şifre sıfırlama bağlantısı. Lütfen e-postanızı kontrol edin.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Şifreler eşleşmiyor. Lütfen kontrol edin.');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Şifreniz en az 6 karakter olmalıdır.');
            return;
        }

        setStatus('loading');
        try {
            const res = await apiFetch('/auth/reset-password', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'Şifreniz başarıyla yenilendi.');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Bir hata oluştu. Bağlantı süresi dolmuş olabilir.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyin.');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-4 py-8"
            >
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-center">Şifre Yenilendi</h2>
                <p className="text-muted-foreground text-center">{message}</p>
                <p className="text-sm text-zinc-500 animate-pulse mt-4">Giriş sayfasına yönlendiriliyorsunuz...</p>
                <Link href="/login" className="w-full mt-6">
                    <Button className="w-full font-bold">Hemen Giriş Yap</Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-3 mb-8">
                <div className="p-4 bg-amber-500/10 rounded-full">
                    <KeyRound className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-3xl font-black text-center tracking-tight">Yeni Şifre</h1>
                <p className="text-muted-foreground text-sm text-center">
                    Hesabınız için yeni ve güvenli bir şifre belirleyin.
                </p>
            </div>

            {status === 'error' && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md text-center">
                    {message}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Yeni Şifre</Label>
                    <Input id="password" type="password" placeholder="••••••••" required
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="bg-background border-input h-12"
                        disabled={status === 'loading' || !token}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" required
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-background border-input h-12"
                        disabled={status === 'loading' || !token}
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={status === 'loading' || !token}
                className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold h-12 shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
                {status === 'loading' ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                    <>Şifreyi Güncelle <ArrowRight className="w-4 h-4 ml-1" /></>
                )}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-card rounded-xl border border-border shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-red-600"></div>

                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Doğrulanıyor...</p>
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>

            </motion.div>
        </div>
    );
}
