'use client';

import { useEffect, useState } from 'react';
import { Ticket, Plus, Trash2, Copy, CheckCircle, AlertCircle, Calendar, Hash, X, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch, api } from '@/lib/api';

interface Coupon {
    id: string;
    code: string;
    durationDays: number;
    discountPercent: number | null;
    description: string | null;
    maxUses: number;
    currentUses: number;
    isActive: boolean;
    createdAt: string;
    expiresAt: string | null;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Create form
    const [newCode, setNewCode] = useState('');
    const [newDurationDays, setNewDurationDays] = useState(30);
    const [newMaxUses, setNewMaxUses] = useState(1);
    const [newExpiresAt, setNewExpiresAt] = useState('');
    const [newDiscountPercent, setNewDiscountPercent] = useState<number | ''>('');
    const [newDescription, setNewDescription] = useState('');
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await apiFetch('/admin/coupons', {
                credentials: 'include',
                headers: { },
            });
            if (res.ok) setCoupons(await res.json());
        } catch { }
        finally { setIsLoading(false); }
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'ADUKET-';
        for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
        setNewCode(code);
    };

    const handleCreate = async () => {
        setCreateError('');
        if (!newCode) { setCreateError('Kupon kodu gerekli'); return; }

        try {
            const res = await apiFetch('/admin/coupons', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({
                    code: newCode,
                    durationDays: newDurationDays,
                    maxUses: newMaxUses,
                    expiresAt: newExpiresAt || undefined,
                    discountPercent: newDiscountPercent || undefined,
                    description: newDescription || undefined,
                }),
            });

            if (res.ok) {
                setShowCreateModal(false);
                setNewCode('');
                setNewDurationDays(30);
                setNewMaxUses(1);
                setNewExpiresAt('');
                setNewDiscountPercent('');
                setNewDescription('');
                fetchCoupons();
            } else {
                const err = await res.json();
                setCreateError(err.message || 'Oluşturulamadı');
            }
        } catch {
            setCreateError('Bir hata oluştu');
        }
    };

    const handleDeactivate = async (id: string) => {
        await apiFetch(`/admin/coupons/${id}`, {
                credentials: 'include',
            method: 'DELETE',
            headers: { },
        });
        fetchCoupons();
    };

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

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
                        <Ticket className="w-8 h-8 text-teal-500" />
                        Kupon Yönetimi
                    </h1>
                    <p className="text-muted-foreground mt-1">Premium kupon kodları oluştur ve yönet</p>
                </div>
                <Button
                    onClick={() => { setShowCreateModal(true); generateRandomCode(); }}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl px-6"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kupon
                </Button>
            </div>

            {/* Coupons Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kupon Kodu</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Süre</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">İndirim</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kullanım</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Durum</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Oluşturulma</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        Henüz kupon kodu oluşturulmamış
                                    </td>
                                </tr>
                            ) : coupons.map((coupon) => (
                                <tr key={coupon.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <code className="bg-secondary px-3 py-1.5 rounded-lg font-mono text-sm font-bold">
                                                {coupon.code}
                                            </code>
                                            <button
                                                onClick={() => copyCode(coupon.code, coupon.id)}
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {copiedId === coupon.id ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{coupon.durationDays} gün</td>
                                    <td className="px-6 py-4 text-sm">
                                        {coupon.discountPercent ? (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 font-medium">
                                                <Percent className="w-3 h-3" />
                                                {coupon.discountPercent}%
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm">
                                            {coupon.currentUses} / {coupon.maxUses}
                                        </span>
                                        <div className="w-16 h-1.5 bg-secondary rounded-full mt-1">
                                            <div
                                                className="h-full bg-teal-500 rounded-full"
                                                style={{ width: `${Math.min((coupon.currentUses / coupon.maxUses) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${coupon.isActive && coupon.currentUses < coupon.maxUses
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-zinc-500/10 text-zinc-400'
                                            }`}>
                                            {coupon.isActive && coupon.currentUses < coupon.maxUses ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {new Date(coupon.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {coupon.isActive && (
                                            <button
                                                onClick={() => handleDeactivate(coupon.id)}
                                                className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-lg space-y-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Yeni Kupon Oluştur</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-500 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {createError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Kupon Kodu</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCode}
                                        onChange={e => setNewCode(e.target.value.toUpperCase())}
                                        className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                                        placeholder="ADUKET-XXXXX"
                                    />
                                    <Button variant="outline" onClick={generateRandomCode} className="rounded-xl border-border">
                                        <Hash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Premium Süresi (gün)</label>
                                    <input
                                        type="number"
                                        value={newDurationDays}
                                        onChange={e => setNewDurationDays(parseInt(e.target.value) || 0)}
                                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                                        min={1}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Maksimum Kullanım</label>
                                    <input
                                        type="number"
                                        value={newMaxUses}
                                        onChange={e => setNewMaxUses(parseInt(e.target.value) || 1)}
                                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                                        min={1}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                        <Percent className="w-4 h-4" />
                                        İndirim Oranı (opsiyonel)
                                    </label>
                                    <input
                                        type="number"
                                        value={newDiscountPercent}
                                        onChange={e => setNewDiscountPercent(parseInt(e.target.value) || '')}
                                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                                        placeholder="ör. 20"
                                        min={1}
                                        max={100}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Son Tarih (opsiyonel)
                                    </label>
                                    <input
                                        type="date"
                                        value={newExpiresAt}
                                        onChange={e => setNewExpiresAt(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Açıklama (opsiyonel)</label>
                                <input
                                    type="text"
                                    value={newDescription}
                                    onChange={e => setNewDescription(e.target.value)}
                                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                                    placeholder="Kupon açıklaması..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl border-border">
                                İptal
                            </Button>
                            <Button onClick={handleCreate} className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl">
                                Oluştur
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
