'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Shield, Ticket, Trash2, CheckCircle, AlertCircle, Crown, Bell, X, Camera } from "lucide-react";
import { apiFetch, api } from '@/lib/api';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const [verificationLoading, setVerificationLoading] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchProfile();
        fetchNotifications();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await apiFetch('/users/me', { credentials: 'include', headers: {} });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setUsername(data.username);
                setEmail(data.email || '');
                setBio(data.bio || '');
                setAvatarUrl(data.avatarUrl || '');
            } else {
                router.push('/login');
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await apiFetch('/users/notifications', { credentials: 'include', headers: {} });
            if (res.ok) setNotifications(await res.json());
        } catch { }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            const res = await apiFetch('/users/me', {
                credentials: 'include', method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username, bio,
                    email: email !== user?.email ? email : undefined,
                    avatarUrl: avatarUrl || undefined,
                })
            });
            if (res.ok) {
                setMessage({ text: 'Profil güncellendi.', type: 'success' });
                fetchProfile();
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage({ text: 'Güncelleme başarısız.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Bir hata oluştu.', type: 'error' });
        }
    };

    const handleResendVerification = async () => {
        if (verificationLoading) return;
        setVerificationLoading(true);
        try {
            const res = await apiFetch('/auth/resend-verification', { credentials: 'include', method: 'POST', headers: {} });
            const data = await res.json();
            if (res.ok) toast.success(data.message || 'Onay e-postası gönderildi.');
            else toast.error(data.message || 'E-posta gönderilemedi.');
        } catch (error) {
            toast.error('Bağlantı hatası.');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!currentPassword || !newPassword) {
            setMessage({ text: 'Lütfen tüm alanları doldurun.', type: 'error' });
            return;
        }
        try {
            const res = await apiFetch('/users/password', {
                credentials: 'include', method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current: currentPassword, new: newPassword })
            });
            if (res.ok) {
                setMessage({ text: 'Şifre başarıyla değiştirildi.', type: 'success' });
                setCurrentPassword(''); setNewPassword('');
            } else {
                setMessage({ text: 'Mevcut şifre hatalı.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Bir hata oluştu.', type: 'error' });
        }
    };

    const handleRedeemCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const res = await apiFetch('/users/redeem-coupon', {
                credentials: 'include', method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: `🎉 ${data.message}`, type: 'success' });
                setCouponCode(''); fetchProfile(); fetchNotifications();
            } else {
                setMessage({ text: data.message || 'Geçersiz kupon kodu', type: 'error' });
            }
        } catch {
            setMessage({ text: 'Bir hata oluştu.', type: 'error' });
        } finally {
            setCouponLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;
        try {
            const res = await apiFetch('/users/me', { credentials: 'include', method: 'DELETE', headers: {} });
            if (res.ok) window.location.href = '/login';
            else toast.error('Hesap silinemedi.');
        } catch (error) {
            toast.error('Bir hata oluştu.');
        }
    };

    const markNotificationRead = async (id: string) => {
        await apiFetch(`/users/notifications/${id}/read`, { credentials: 'include', method: 'PUT', headers: {} });
        fetchNotifications();
    };

    if (isLoading) {
        return <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    const isPremium = user?.role === 'PREMIUM' || user?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-3xl mx-auto w-full space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center text-white text-xl font-bold">
                                {user?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="w-4 h-4 text-white" />
                            <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => setAvatarUrl(ev.target?.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Ayarlar</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2 flex-wrap">
                            {user?.email}
                            {isPremium && (
                                <>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
                                        <Crown className="w-3 h-3" /> Premium
                                    </span>
                                    {user?.subscriptions?.[0]?.currentPeriodEnd && (
                                        <span className="text-xs text-muted-foreground">
                                            (Bitiş: {new Date(user.subscriptions[0].currentPeriodEnd).toLocaleDateString('tr-TR')})
                                        </span>
                                    )}
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Message Banner */}
                {message && (
                    <div className={`p-3 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/15' : 'bg-red-500/10 text-red-500 border border-red-500/15'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                        {message.text}
                        <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
                    </div>
                )}

                {/* Notifications */}
                {notifications.filter(n => !n.isRead).length > 0 && (
                    <section className="bg-card border border-border rounded-xl p-5 space-y-3">
                        <h2 className="text-base font-bold flex items-center gap-2">
                            <Bell className="w-4 h-4 text-blue-500" /> Bildirimler
                        </h2>
                        <div className="space-y-2">
                            {notifications.filter(n => !n.isRead).map(notif => (
                                <div key={notif.id} className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${notif.type === 'premium' ? 'bg-amber-500/5 border-amber-500/15' : 'bg-secondary/50 border-border'}`}>
                                    <div>
                                        <p className="font-semibold text-sm">{notif.title}</p>
                                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                                    </div>
                                    <button onClick={() => markNotificationRead(notif.id)} className="text-xs text-muted-foreground hover:text-foreground shrink-0">Okundu</button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Profile */}
                <section className="bg-card border border-border rounded-xl p-5 space-y-5">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <h2 className="text-base font-bold">Profil Bilgileri</h2>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Kullanıcı Adı</Label>
                            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-secondary/50 border-border rounded-lg h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50 border-border rounded-lg h-10" />
                            {user && !user.isVerified && (
                                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/15 rounded-lg flex items-center justify-between gap-3 flex-wrap">
                                    <p className="text-xs text-red-500 font-medium flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" /> E-posta adresiniz henüz doğrulanmadı.</p>
                                    <Button type="button" variant="outline" size="sm" className="h-8 text-xs border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={handleResendVerification} disabled={verificationLoading}>
                                        {verificationLoading ? <div className="w-3 h-3 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : "Doğrulama Gönder"}
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Hakkımda</Label>
                            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={200} placeholder="Kısa bir biyografi yazın..."
                                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                            <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
                        </div>
                        <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white rounded-lg">Kaydet</Button>
                    </form>
                </section>

                {/* Coupon */}
                {!isPremium && (
                    <section id="coupon" className="bg-card border border-amber-500/15 rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-amber-500" />
                            <h2 className="text-base font-bold">Kupon Kodu Kullan</h2>
                        </div>
                        <p className="text-xs text-muted-foreground">Bir kupon kodunuz varsa buraya girerek premium üyeliğe geçiş yapabilirsiniz.</p>
                        <form onSubmit={handleRedeemCoupon} className="flex gap-3">
                            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="ADUKET-XXXXXXXX" className="bg-secondary/50 border-amber-500/15 rounded-lg font-mono h-10" />
                            <Button type="submit" disabled={couponLoading || !couponCode.trim()} className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg shrink-0">
                                {couponLoading ? 'Kontrol...' : 'Kullan'}
                            </Button>
                        </form>
                    </section>
                )}

                {/* Security */}
                <section className="bg-card border border-border rounded-xl p-5 space-y-5">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <h2 className="text-base font-bold">Güvenlik</h2>
                    </div>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Mevcut Şifre</Label>
                            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-secondary/50 border-border rounded-lg h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Yeni Şifre</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-secondary/50 border-border rounded-lg h-10" />
                        </div>
                        <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white rounded-lg">Şifreyi Güncelle</Button>
                    </form>
                </section>

                {/* Danger Zone */}
                <section className="bg-card border border-destructive/15 rounded-xl p-5 space-y-3">
                    <h2 className="text-base font-bold text-destructive flex items-center gap-2"><Trash2 className="w-4 h-4" /> Tehlikeli Bölge</h2>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="font-medium text-sm text-destructive">Hesabı Sil</h3>
                            <p className="text-xs text-muted-foreground">Bu işlem geri alınamaz. Tüm verileriniz silinir.</p>
                        </div>
                        <Button variant="destructive" onClick={handleDeleteAccount} className="rounded-lg shrink-0 text-sm">Hesabı Sil</Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
