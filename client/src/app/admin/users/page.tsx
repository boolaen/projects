'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Ban, Trash2, CheckCircle, Search, Mail, Calendar, EyeOff, MoreVertical, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, api } from '@/lib/api';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        username: '',
        password: '',
        role: 'FREE'
    });

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const meRes = await apiFetch('/users/me', { credentials: 'include' });
            if (meRes.ok) {
                const meUser = await meRes.json();
                setCurrentUserId(meUser.id);
            }
        } catch (e) { /* Error handled silently */ }
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search
            });
            const res = await apiFetch(`/admin/users?${query}`, {
                credentials: 'include',
                headers: {}
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`Kullanıcı rolünü ${newRole} olarak değiştirmek istiyor musunuz?`)) return;

        try {
            const res = await apiFetch(`/admin/users/${userId}/role`, {
                credentials: 'include',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                toast.success('Rol güncellendi.');
                fetchUsers();
            } else {
                const err = await res.text();
                toast.error('Rol güncellenemedi: ' + err);
            }
        } catch (error) {
            // Error handled silently
            toast.error('Bir hata oluştu.');
        }
    };

    const handleBan = async (userId: string, isBanned: boolean) => {
        if (!confirm(`Kullanıcıyı ${isBanned ? 'YASAKLAMAK' : 'YASAĞINI KALDIRMAK'} istiyor musunuz?`)) return;

        try {
            const res = await apiFetch(`/admin/users/${userId}/ban`, {
                credentials: 'include',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isBanned })
            });
            if (res.ok) {
                toast.success(`Kullanıcı ${isBanned ? 'yasaklandı' : 'yasağı kaldırıldı'}.`);
                fetchUsers();
            } else {
                toast.error('İşlem başarısız.');
            }
        } catch (error) {
            // Error handled silently
            toast.error('Bir hata oluştu.');
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingUser(true);
        try {
            const res = await apiFetch('/admin/users', {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                toast.success('Yeni kullanıcı başarıyla eklendi.');
                setIsAddModalOpen(false);
                setNewUser({ email: '', username: '', password: '', role: 'FREE' });
                fetchUsers();
            } else {
                const errData = await res.json().catch(() => null);
                toast.error(errData?.message || 'Kullanıcı eklenirken bir hata oluştu.');
            }
        } catch (err) {
            // Error handled silently
            toast.error('Bağlantı hatası.');
        } finally {
            setIsAddingUser(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Kullanıcı ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-background border-input pl-9"
                        />
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white shrink-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Üye Ekle
                    </Button>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-zinc-100 dark:bg-zinc-900/50 text-muted-foreground border-b border-border">
                        <tr>
                            <th className="p-4 font-semibold text-sm">Kullanıcı Adı</th>
                            <th className="p-4 font-semibold text-sm">E-posta</th>
                            <th className="p-4 font-semibold text-sm">Rol</th>
                            <th className="p-4 font-semibold text-sm">Durum</th>
                            <th className="p-4 font-semibold text-sm text-center">Video</th>
                            <th className="p-4 font-semibold text-sm">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Yükleniyor...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Kullanıcı bulunamadı.</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-4 font-medium text-sm">{user.username}</td>
                                    <td className="p-4 text-muted-foreground text-sm">{user.email}</td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 ring-1 ring-purple-500/30' :
                                            user.role === 'PREMIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-500/30' :
                                                user.role === 'CREATOR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-500/30' :
                                                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 ring-1 ring-zinc-500/30'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {user.isBanned ? (
                                            <span className="text-red-500 font-bold flex items-center gap-1.5"><Ban className="w-3.5 h-3.5" /> YASAKLI</span>
                                        ) : (
                                            <span className="text-green-500 font-medium flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Aktif</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-center font-medium">{user._count?.videos || 0}</td>
                                    <td className="p-4 flex gap-2 items-center">
                                        {user.id !== currentUserId ? (
                                            <>
                                                <select
                                                    className="bg-background text-foreground text-xs p-1.5 rounded-lg border border-input cursor-pointer hover:border-zinc-400 transition-colors outline-none focus:ring-2 focus:ring-red-500/20"
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                >
                                                    <option value="FREE">FREE</option>
                                                    <option value="PREMIUM">PREMIUM</option>
                                                    <option value="CREATOR">CREATOR</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>

                                                <Button
                                                    size="sm"
                                                    variant={user.isBanned ? "outline" : "destructive"}
                                                    className="h-8 text-xs font-semibold"
                                                    onClick={() => handleBan(user.id, !user.isBanned)}
                                                >
                                                    {user.isBanned ? 'Yasağı Kaldır' : 'Yasakla'}
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic px-2">Bu sensin</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 pt-4">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    Önceki
                </Button>
                <div className="flex items-center px-4 text-sm text-muted-foreground font-medium">
                    Sayfa {page} / {totalPages || 1}
                </div>
                <Button variant="outline" size="sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>
                    Sonraki
                </Button>
            </div>

            {/* Add User Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setIsAddModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-5 border-b border-border flex justify-between items-center shrink-0">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-red-500" />
                                    Yeni Üye Ekle
                                </h2>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleAddUser} className="flex flex-col overflow-hidden">
                                <div className="p-5 space-y-4 overflow-y-auto">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-posta Adresi</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="ornek@posta.com"
                                            required
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="bg-secondary/50 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Kullanıcı Adı (Benzersiz)</Label>
                                        <Input
                                            id="username"
                                            placeholder="KullaniciAdi"
                                            required
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                            className="bg-secondary/50 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Şifre (min. 8 karakter)</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className="bg-secondary/50 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Rol</Label>
                                        <select
                                            id="role"
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="w-full h-10 px-3 bg-secondary/50 border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                                        >
                                            <option value="FREE">Kayıtlı Üye (FREE)</option>
                                            <option value="PREMIUM">Premium Üye (PREMIUM)</option>
                                            <option value="CREATOR">İçerik Üreticisi (CREATOR)</option>
                                            <option value="ADMIN">Yönetici (ADMIN)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Footer — always inside modal */}
                                <div className="p-5 border-t border-border flex gap-3 shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsAddModalOpen(false)}
                                    >
                                        İptal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isAddingUser}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {isAddingUser ? 'Ekleniyor...' : 'Üyeyi Kaydet'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

