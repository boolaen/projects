'use client';

import { useEffect, useState } from 'react';
import { Users, Video, Eye, Heart, Crown, Ticket, TrendingUp, Clock, Play } from 'lucide-react';
import { apiFetch, api } from '@/lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        videos: 0,
        views: 0,
        likes: 0,
        premiumUsers: 0,
        activeCoupons: 0
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentVideos, setRecentVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const headers = {};

        try {
            const [statsRes, usersRes, videosRes] = await Promise.all([
                apiFetch('/admin/stats', {
                    credentials: 'include', headers
                }),
                apiFetch('/admin/users?limit=5', {
                    credentials: 'include', headers
                }),
                apiFetch('/admin/videos?limit=5', {
                    credentials: 'include', headers
                }),
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (usersRes.ok) {
                const data = await usersRes.json();
                setRecentUsers(data.users || []);
            }
            if (videosRes.ok) {
                const data = await videosRes.json();
                setRecentVideos(data.videos || []);
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        { label: 'Toplam Kullanıcı', value: stats.users, icon: Users, color: 'from-blue-600 to-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Toplam Video', value: stats.videos, icon: Video, color: 'from-purple-600 to-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Toplam İzlenme', value: stats.views, icon: Eye, color: 'from-green-600 to-green-400', bg: 'bg-green-500/10' },
        { label: 'Toplam Beğeni', value: stats.likes, icon: Heart, color: 'from-red-600 to-red-400', bg: 'bg-red-500/10' },
        { label: 'Premium Üyeler', value: stats.premiumUsers, icon: Crown, color: 'from-amber-600 to-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Aktif Kuponlar', value: stats.activeCoupons, icon: Ticket, color: 'from-teal-600 to-teal-400', bg: 'bg-teal-500/10' },
    ];

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
                    <h1 className="text-3xl font-bold">Gösterge Paneli</h1>
                    <p className="text-muted-foreground mt-1">Platform genel durumu ve istatistikler</p>
                </div>
                <div className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((card) => (
                    <div key={card.label} className="relative overflow-hidden bg-card p-6 rounded-2xl border border-border shadow-sm group hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                                <p className="text-3xl font-bold">{card.value.toLocaleString('tr-TR')}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                                <card.icon className={`w-6 h-6 bg-gradient-to-r ${card.color} bg-clip-text`} style={{ color: 'transparent', background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                                <card.icon className={`w-6 h-6 text-current opacity-70`} style={{ position: 'absolute' }} />
                            </div>
                        </div>
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Son Kayıt Olan Kullanıcılar
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {recentUsers.length > 0 ? recentUsers.map((user: any) => (
                            <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                        {user.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{user.username}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' :
                                    user.role === 'PREMIUM' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-zinc-500/10 text-zinc-400'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Henüz kullanıcı yok</p>
                        )}
                    </div>
                </div>

                {/* Recent Videos */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Play className="w-5 h-5 text-purple-500" />
                            Son Yüklenen Videolar
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {recentVideos.length > 0 ? recentVideos.map((video: any) => (
                            <div key={video.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-9 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                                        {video.thumbnailUrl && (
                                            <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{video.title}</p>
                                        <p className="text-xs text-muted-foreground">{video.user?.username} • {video.views} izlenme</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {video.isPremium && (
                                        <Crown className="w-4 h-4 text-amber-500" />
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded-full ${video.status === 'READY' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                        {video.status === 'READY' ? 'Hazır' : 'İşleniyor'}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Henüz video yok</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
