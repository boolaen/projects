'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tv, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { apiFetch } from '@/lib/api';
import { useSiteSettings } from "@/components/site-settings-provider";

export default function RegisterPage() {
    const router = useRouter();
    const { siteName, logoUrl } = useSiteSettings();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await apiFetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password }),
            });
            if (res.ok) {
                router.push('/login');
            } else {
                const data = await res.json();
                setError(data.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
            }
        } catch (err: any) {
            setError(err.message || 'Bağlantı hatası veya sunucu yanıt vermiyor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-zinc-950 overflow-hidden selection:bg-red-500/30 font-sans">
            {/* Optimized Cinematic Background Elements */}
            <div className="absolute inset-0 z-0 opacity-80">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                <div className="absolute left-[20%] top-[10%] -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/15 blur-[80px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] -z-10 h-[400px] w-[400px] rounded-full bg-red-900/15 blur-[100px]"></div>
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="relative z-10 w-full max-w-[28rem] p-6 sm:p-0 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                {/* Premium Glass Card with optimized backdrop map */}
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/70 p-8 shadow-2xl backdrop-blur-md sm:p-12">
                    {/* Subtle top glare */}
                    <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    <div className="flex flex-col items-center gap-4 mb-10">
                        {logoUrl ? (
                            <img src={logoUrl} alt={siteName || "Logo"} className="h-20 w-auto object-contain drop-shadow-lg" />
                        ) : (
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/30 ring-1 ring-white/20 group">
                                <Tv className="h-8 w-8 text-white transition-transform duration-500 group-hover:scale-110" />
                            </div>
                        )}
                        <div className="text-center space-y-1 mt-2">
                            {(!logoUrl || siteName) && (
                                <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                                    {siteName || "ADUKET"}
                                </h1>
                            )}
                            <p className="text-sm font-medium text-zinc-400">Yeni bir hesap oluşturun.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 shadow-inner animate-in fade-in zoom-in-95 duration-300">
                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0"></div>
                            <p className="leading-snug">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Kullanıcı Adı</Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-red-400" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Kullanıcı adınız"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-14 bg-white/5 border-white/10 pl-12 pr-4 text-white placeholder:text-zinc-600 rounded-2xl focus:bg-white/10 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus-visible:ring-offset-0 transition-all duration-300 text-base"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">E-posta Adresi</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-red-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ornek@email.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-14 bg-white/5 border-white/10 pl-12 pr-4 text-white placeholder:text-zinc-600 rounded-2xl focus:bg-white/10 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus-visible:ring-offset-0 transition-all duration-300 text-base"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pb-2">
                            <div className="flex justify-between items-center ml-1">
                                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Şifre</Label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-red-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`h-14 bg-white/5 border-white/10 pl-12 pr-12 text-white placeholder:text-zinc-600 rounded-2xl focus:bg-white/10 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus-visible:ring-offset-0 transition-all duration-300 ${showPassword ? 'text-base font-normal tracking-normal' : 'text-lg font-medium tracking-widest'} `}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-400 transition-colors focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full h-14 mt-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-base rounded-2xl shadow-[0_8px_30px_-4px_rgba(220,38,38,0.4)] hover:shadow-[0_8px_40px_-4px_rgba(220,38,38,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden border border-red-400/20"
                        >
                            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                <div className="relative h-full w-12 bg-white/20"></div>
                            </div>
                            <span className="relative flex items-center justify-center gap-2 w-full">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Kayıt yapılıyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Kayıt Ol</span>
                                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                                    </>
                                )}
                            </span>
                        </Button>
                    </form>

                    <div className="mt-8 flex flex-col items-center justify-center gap-2 text-sm text-zinc-400">
                        <div className="flex items-center w-full gap-4 mb-3 opacity-50">
                            <div className="h-px w-full bg-gradient-to-r from-transparent to-white/40"></div>
                            <span className="text-[10px] uppercase font-bold tracking-widest shrink-0">YADA</span>
                            <div className="h-px w-full bg-gradient-to-l from-transparent to-white/40"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Zaten hesabınız var mı?</span>
                            <Link href="/login" className="font-bold text-white hover:text-red-400 hover:underline underline-offset-4 transition-all">
                                Giriş Yap
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="text-center text-[10px] text-zinc-600 mt-6 font-bold tracking-widest uppercase opacity-70">
                    © {new Date().getFullYear()} {siteName || "Aduket"}. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    );
}
