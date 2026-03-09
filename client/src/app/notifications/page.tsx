'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Bell, Check, CheckCheck, Crown, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch, api } from '@/lib/api';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await apiFetch('/users/notifications', {
                credentials: 'include',
                headers: { },
            });
            if (res.ok) setNotifications(await res.json());
        } catch { }
        finally { setIsLoading(false); }
    };

    const markAsRead = async (id: string) => {
        await apiFetch(`/users/notifications/${id}/read`, {
                credentials: 'include',
            method: 'PUT',
            headers: { },
        });
        fetchNotifications();
    };

    const markAllAsRead = async () => {
        await apiFetch('/users/notifications/read-all', {
                credentials: 'include',
            method: 'PUT',
            headers: { },
        });
        fetchNotifications();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'premium': return <Crown className="w-5 h-5 text-amber-500" />;
            case 'success': return <Sparkles className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBg = (type: string) => {
        switch (type) {
            case 'premium': return 'bg-amber-500/10';
            case 'success': return 'bg-green-500/10';
            case 'warning': return 'bg-amber-500/10';
            default: return 'bg-blue-500/10';
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-2xl mx-auto w-full space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Bell className="w-8 h-8 text-blue-500" />
                            Bildirimler
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={markAllAsRead}
                            className="rounded-xl border-border text-sm"
                        >
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Tümünü Okundu İşaretle
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Henüz bildiriminiz yok</p>
                    </div>
                ) : (
                    <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
                        {notifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`px-6 py-4 flex items-start gap-4 transition-colors ${!notif.isRead ? 'bg-secondary/30' : 'hover:bg-secondary/10'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl ${getBg(notif.type)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm ${!notif.isRead ? 'font-bold' : 'font-medium'}`}>{notif.title}</p>
                                        {!notif.isRead && (
                                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {new Date(notif.createdAt).toLocaleDateString('tr-TR', {
                                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                {!notif.isRead && (
                                    <button
                                        onClick={() => markAsRead(notif.id)}
                                        className="text-xs text-muted-foreground hover:text-foreground flex-shrink-0 mt-1 p-2 rounded-lg hover:bg-secondary transition-colors"
                                        title="Okundu olarak işaretle"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
