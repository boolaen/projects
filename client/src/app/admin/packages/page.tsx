'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Package, Check, X, Star, Zap, Crown, Shield, Play, Flame, Heart, Sparkles, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, api } from '@/lib/api';

const ICONS_PRESETS = [
    { id: 'Star', comp: Star },
    { id: 'Zap', comp: Zap },
    { id: 'Crown', comp: Crown },
    { id: 'Shield', comp: Shield },
    { id: 'Package', comp: Package },
    { id: 'Play', comp: Play },
    { id: 'Flame', comp: Flame },
    { id: 'Heart', comp: Heart },
    { id: 'Sparkles', comp: Sparkles },
    { id: 'Gem', comp: Gem }
];

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: '',
        icon: 'Star',
        features: '', // comma separated temporarily
        color: '',
        buttonColor: '',
        glow: '',
        popular: false,
        isActive: true
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch('/admin/packages', {
                credentials: 'include',
                headers: {}
            });
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (pkg: any = null) => {
        if (pkg) {
            setEditingId(pkg.id);
            setFormData({
                name: pkg.name,
                price: pkg.price,
                duration: pkg.duration,
                icon: pkg.icon,
                features: pkg.features.join('\n'), // Use newline for textarea
                color: pkg.color,
                buttonColor: pkg.buttonColor,
                glow: pkg.glow || '',
                popular: pkg.popular,
                isActive: pkg.isActive
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '', price: '', duration: '', icon: 'Star', features: '', color: '', buttonColor: '', glow: '', popular: false, isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const payload = {
            ...formData,
            features: formData.features.split('\n').filter(f => f.trim() !== '')
        };

        try {
            const url = editingId
                ? api(`/admin/packages/${editingId}`)
                : api('/admin/packages');

            const res = await fetch(url, {
                credentials: 'include',
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(`Paket ${editingId ? 'güncellendi' : 'oluşturuldu'}.`);
                setIsModalOpen(false);
                fetchPackages();
            } else {
                toast.error('İşlem başarısız oldu.');
            }
        } catch (error) {
            // Error handled silently
            toast.error('Bağlantı hatası.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return;
        try {
            const res = await apiFetch(`/admin/packages/${id}`, {
                credentials: 'include',
                method: 'DELETE',
                headers: {}
            });
            if (res.ok) {
                toast.success('Paket silindi.');
                fetchPackages();
            }
        } catch (error) {
            // Error handled silently
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Package className="w-8 h-8 text-blue-500" />
                    Abonelik Paketleri
                </h1>
                <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Paket
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">Yükleniyor...</div>
            ) : packages.length === 0 ? (
                <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border text-muted-foreground">
                    Henüz paket bulunmuyor.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className={`relative bg-card rounded-2xl p-6 border border-border flex flex-col gap-4 shadow-lg ${pkg.isActive ? '' : 'opacity-50'}`}>
                            {pkg.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                    Popüler
                                </div>
                            )}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-2xl font-black">{pkg.price}</span>
                                        <span className="text-sm text-muted-foreground">{pkg.duration}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(pkg)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                                        <Edit2 className="w-4 h-4 text-blue-500" />
                                    </button>
                                    <button onClick={() => handleDelete(pkg.id)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-border my-2" />

                            <ul className="text-sm space-y-2 flex-1 text-muted-foreground">
                                {pkg.features.map((f: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Durum:</span>
                                    <span className={pkg.isActive ? 'text-green-500' : 'text-red-500'}>{pkg.isActive ? 'Aktif' : 'Pasif'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">İkon:</span>
                                    <span>{pkg.icon}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-card w-full max-w-2xl flex flex-col rounded-2xl border border-border shadow-2xl relative overflow-hidden"
                            style={{ maxHeight: 'calc(100vh - 2rem)' }}
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    {editingId ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                                    {editingId ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Paket Adı</Label>
                                            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Örn: Gümüş" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Fiyat</Label>
                                            <Input required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="Örn: 300 TL" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Süre/Periyot</Label>
                                            <Input required value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="Örn: /aylık" />
                                        </div>
                                        <div className="space-y-3 md:col-span-2">
                                            <Label>Paket İkonu Seçimi</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {ICONS_PRESETS.map(({ id, comp: Icon }) => (
                                                    <button
                                                        key={id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, icon: id })}
                                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${formData.icon === id
                                                            ? 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-sm'
                                                            : 'border-border bg-secondary/30 hover:bg-secondary text-muted-foreground'
                                                            }`}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                        <span className="text-[10px] font-medium leading-none">{id}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Özellikler (Her satıra bir özellik)</Label>
                                            <textarea
                                                required
                                                value={formData.features}
                                                onChange={e => setFormData({ ...formData, features: e.target.value })}
                                                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Özellik 1&#10;Özellik 2&#10;Özellik 3"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Kart Renk Sınıfları (Tailwind)</Label>
                                            <Input value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} placeholder="border-zinc-400/50 hover:border-zinc-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Buton Renk Sınıfları</Label>
                                            <Input value={formData.buttonColor} onChange={e => setFormData({ ...formData, buttonColor: e.target.value })} placeholder="bg-zinc-500 hover:bg-zinc-600" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Parlama/Glow (İsteğe Bağlı)</Label>
                                            <Input value={formData.glow} onChange={e => setFormData({ ...formData, glow: e.target.value })} placeholder="shadow-[0_0_40px_rgba(255...)]" />
                                        </div>

                                        <div className="flex items-center gap-6 md:col-span-2 bg-secondary/30 p-4 rounded-xl border border-border">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={formData.popular} onChange={e => setFormData({ ...formData, popular: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                                                <span className="text-sm font-medium">"En Popüler" Etiketi Göster</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 accent-green-600" />
                                                <span className="text-sm font-medium">Kullanıma Açık (Aktif)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-border shrink-0 bg-secondary/10 mt-auto">
                                    <div className="flex gap-3">
                                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                            İptal
                                        </Button>
                                        <Button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20">
                                            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
