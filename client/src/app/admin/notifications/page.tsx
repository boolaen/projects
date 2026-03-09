'use client';

import { useEffect, useState } from 'react';
import { Bell, Send, CheckCircle, AlertCircle, Info, Megaphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch, api } from '@/lib/api';

interface SentNotification {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
}

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<SentNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create form
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ text: string; success: boolean } | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await apiFetch('/admin/notifications', {
                credentials: 'include',
                headers: { },
            });
            if (res.ok) setNotifications(await res.json());
        } catch { }
        finally { setIsLoading(false); }
    };

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) return;
        setSending(true);
        setResult(null);

        try {
            const res = await apiFetch('/admin/notifications', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ title, message, type }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult({ text: data.message, success: true });
                setTitle('');
                setMessage('');
                setType('info');
                fetchNotifications();
                setTimeout(() => setShowCreateModal(false), 1500);
            } else {
                setResult({ text: 'Bildirim gönderilemedi', success: false });
            }
        } catch {
            setResult({ text: 'Bir hata oluştu', success: false });
        } finally {
            setSending(false);
        }
    };

    const typeOptions = [
        { value: 'info', label: 'Bilgi', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { value: 'success', label: 'Başarı', color: 'text-green-500', bg: 'bg-green-500/10' },
        { value: 'warning', label: 'Uyarı', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { value: 'premium', label: 'Premium', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    const getTypeInfo = (t: string) => typeOptions.find(o => o.value === t) || typeOptions[0];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-blue-500" />
                        Bildirim Yönetimi
                    </h1>
                    <p className="text-muted-foreground mt-1">Tüm kullanıcılara bildirim gönder</p>
                </div>
                <Button
                    onClick={() => { setShowCreateModal(true); setResult(null); }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl px-6"
                >
                    <Send className="w-4 h-4 mr-2" />
                    Yeni Bildirim
                </Button>
            </div>

            {/* Sent Notifications */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-secondary/30">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gönderilen Bildirimler</h2>
                </div>
                <div className="divide-y divide-border">
                    {notifications.length === 0 ? (
                        <div className="px-6 py-12 text-center text-muted-foreground">
                            Henüz bildirim gönderilmemiş
                        </div>
                    ) : notifications.map(notif => {
                        const typeInfo = getTypeInfo(notif.type);
                        return (
                            <div key={notif.id} className="px-6 py-4 flex items-start gap-4 hover:bg-secondary/20 transition-colors">
                                <div className={`w-10 h-10 rounded-xl ${typeInfo.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <Bell className={`w-5 h-5 ${typeInfo.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm">{notif.title}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.bg} ${typeInfo.color} font-medium`}>
                                            {typeInfo.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                                </div>
                                <p className="text-xs text-muted-foreground flex-shrink-0">
                                    {new Date(notif.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-lg space-y-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Bildirim Gönder</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {result && (
                            <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${result.success ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {result.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Başlık</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    placeholder="Bildirim başlığı..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Açıklama</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={3}
                                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    placeholder="Bildirim mesajı..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Bildirim Türü</label>
                                <div className="flex gap-2">
                                    {typeOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setType(opt.value)}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${type === opt.value
                                                ? `${opt.bg} ${opt.color} border-current`
                                                : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl border-border">
                                İptal
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={sending || !title.trim() || !message.trim()}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl"
                            >
                                {sending ? 'Gönderiliyor...' : 'Tüm Kullanıcılara Gönder'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
