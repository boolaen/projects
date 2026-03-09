'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Video, Ticket, LogOut, Shield, ArrowLeft, Bell, Megaphone, Settings, Mail, Package, FolderOpen } from 'lucide-react';
import { useSiteSettings } from "@/components/site-settings-provider";
import { apiFetch } from '@/lib/api';

const navItems = [
    { label: 'Gösterge Paneli', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Kullanıcılar', href: '/admin/users', icon: Users },
    { label: 'Videolar', href: '/admin/videos', icon: Video },
    { label: 'Kategoriler', href: '/admin/categories', icon: FolderOpen },
    { label: 'Kupon Kodları', href: '/admin/coupons', icon: Ticket },
    { label: 'Bildirimler', href: '/admin/notifications', icon: Megaphone },
    { label: 'Site Ayarları', href: '/admin/settings', icon: Settings },
    { label: 'SMTP Ayarları', href: '/admin/smtp', icon: Mail },
    { label: 'Abonelik Paketleri', href: '/admin/packages', icon: Package },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<any>(null);
    const { siteName, logoUrl } = useSiteSettings();

    useEffect(() => {
        if (pathname === '/admin/login') {
            setIsLoading(false);
            return;
        }

        const checkAdmin = async () => {
            try {
                const res = await apiFetch('/users/me');

                if (res.ok) {
                    const user = await res.json();
                    if (user.role === 'ADMIN') {
                        setIsAdmin(true);
                        setAdminUser(user);
                    } else {
                        router.push('/');
                    }
                } else {
                    router.push('/admin/login');
                }
            } catch (error) {
                router.push('/admin/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAdmin();
    }, [pathname]);

    const handleLogout = () => {
        router.push('/login');
    };

    if (isLoading) {
        return <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-background text-foreground flex">
                {/* Sidebar */}
                <aside className="w-72 border-r border-border bg-card flex flex-col">
                    {/* Brand */}
                    <div className="p-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            {logoUrl ? (
                                <img src={logoUrl} alt={siteName} className="w-10 h-10 rounded-xl object-contain drop-shadow-lg" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-lg font-bold">{siteName}</h1>
                                <p className="text-xs text-muted-foreground">Yönetim Paneli</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map(item => {
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname.startsWith(item.href);

                            return (
                                <Link href={item.href} key={item.href}>
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`}>
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-border space-y-2">
                        <Link href="/anasayfa">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer">
                                <ArrowLeft className="w-5 h-5" />
                                Siteye Dön
                            </div>
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all">
                            <LogOut className="w-5 h-5" />
                            Çıkış Yap
                        </button>
                    </div>

                    {/* Admin info */}
                    {adminUser && (
                        <div className="p-4 border-t border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                    {adminUser.username?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{adminUser.username}</p>
                                    <p className="text-xs text-muted-foreground truncate">{adminUser.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-background">
                    {/* Top Bar */}
                    <div className="sticky top-0 z-10 bg-background/95 border-b border-border px-8 py-4 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground">
                            {navItems.find(i => i.exact ? pathname === i.href : pathname.startsWith(i.href))?.label || 'Admin'}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
                                <Bell className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        );
    }

    return null;
}
