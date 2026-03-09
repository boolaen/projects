'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VideoCard } from '@/components/video-card';
import { Plus, Search, Upload, Edit2, X } from 'lucide-react';
import { apiFetch, api } from '@/lib/api';

export default function AdminVideosPage() {
    const [videos, setVideos] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [editingVideo, setEditingVideo] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({ title: '', description: '', category: '', isPremium: false });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, [page, search]);

    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '12', // Grid layout fits better with 3/4 cols
                search
            });
            const res = await apiFetch(`/admin/videos?${query}`, {
                credentials: 'include',
                headers: {}
            });
            if (res.ok) {
                const data = await res.json();
                setVideos(data.videos);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleFeature = async (videoId: string, isFeatured: boolean) => {
        try {
            const res = await apiFetch(`/admin/videos/${videoId}/feature`, {
                credentials: 'include',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isFeatured })
            });
            if (res.ok) fetchVideos();
        } catch (error) {
            // Error handled silently
        }
    };

    const handleDelete = async (videoId: string) => {
        if (!confirm('Videoyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;

        try {
            const res = await apiFetch(`/admin/videos/${videoId}`, {
                credentials: 'include',
                method: 'DELETE',
                headers: {}
            });
            if (res.ok) fetchVideos();
        } catch (error) {
            // Error handled silently
        }
    };

    const handleEditClick = (video: any) => {
        setEditingVideo(video);
        setEditFormData({
            title: video.title || '',
            description: video.description || '',
            category: video.category || '',
            isPremium: video.isPremium || false,
        });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVideo) return;
        setIsSaving(true);
        try {
            const res = await apiFetch(`/admin/videos/${editingVideo.id}`, {
                credentials: 'include',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData),
            });
            if (res.ok) {
                setEditingVideo(null);
                fetchVideos();
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Video Yönetimi</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Video ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-background border-input pl-9"
                        />
                    </div>
                    <Link href="/yukle">
                        <Button className="bg-red-600 hover:bg-red-700 text-white shrink-0">
                            <Upload className="w-4 h-4 mr-2" />
                            Video Yükle
                        </Button>
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">Yükleniyor...</div>
            ) : videos.length === 0 ? (
                <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border text-muted-foreground">
                    Video bulunamadı.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <div key={video.id} className="relative group">
                            <VideoCard
                                id={video.id}
                                title={video.title}
                                thumbnail={video.thumbnailUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"}
                                views={`${video.views} görüntüleme`}
                                duration="00:00" // We don't have duration in this simple view properly formatted yet
                                uploader={video.user?.username}
                                uploaderAvatar={video.user?.avatarUrl}
                                isPremium={video.isPremium}
                                date={new Date(video.createdAt).toLocaleDateString()}
                            />
                            {/* Admin Overlays */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="sm"
                                    variant={video.isFeatured ? "default" : "secondary"}
                                    onClick={(e) => { e.preventDefault(); handleToggleFeature(video.id, !video.isFeatured); }}
                                    className={video.isFeatured ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}
                                >
                                    {video.isFeatured ? '★' : '☆'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => { e.preventDefault(); handleEditClick(video); }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => { e.preventDefault(); handleDelete(video.id); }}
                                >
                                    🗑
                                </Button>
                            </div>
                            {video.isFeatured && (
                                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow-lg pointer-events-none">
                                    ÖNE ÇIKAN
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center gap-2 mt-8">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                >
                    Önceki
                </Button>
                <div className="flex items-center px-4 text-zinc-400">
                    Sayfa {page} / {totalPages}
                </div>
                <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                >
                    Sonraki
                </Button>
            </div>

            {/* Edit Modal */}
            {editingVideo && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-card border border-border rounded-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold text-lg">Videoyu Düzenle</h3>
                            <button onClick={() => setEditingVideo(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-4 space-y-4 overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Video Başlığı</label>
                                <Input
                                    required
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Açıklama</label>
                                <textarea
                                    className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kategori</label>
                                <Input
                                    value={editFormData.category}
                                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPremiumEdit"
                                    checked={editFormData.isPremium}
                                    onChange={(e) => setEditFormData({ ...editFormData, isPremium: e.target.checked })}
                                    className="rounded border-zinc-700 bg-zinc-900"
                                />
                                <label htmlFor="isPremiumEdit" className="text-sm font-medium text-amber-500">Premium İçerik</label>
                            </div>
                        </form>
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-muted/30">
                            <Button type="button" variant="outline" onClick={() => setEditingVideo(null)}>İptal</Button>
                            <Button type="submit" className="bg-red-600 hover:bg-red-700" onClick={handleEditSubmit} disabled={isSaving}>
                                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
