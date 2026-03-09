'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, X } from "lucide-react";
import { apiFetch, api } from '@/lib/api';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    createdAt: string;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formIcon, setFormIcon] = useState('Layers');
    const [formColor, setFormColor] = useState('text-red-500');
    const [formOrder, setFormOrder] = useState(0);
    const [saving, setSaving] = useState(false);

    const API = api('/admin/categories');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(API, { credentials: 'include' });
            if (res.ok) setCategories(await res.json());
        } catch (error) {
            toast.error('Kategoriler yüklenemedi');
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormName('');
        setFormSlug('');
        setFormDescription('');
        setFormIcon('Layers');
        setFormColor('text-red-500');
        setFormOrder(categories.length);
        setShowModal(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setFormName(cat.name);
        setFormSlug(cat.slug);
        setFormDescription(cat.description || '');
        setFormIcon(cat.icon);
        setFormColor(cat.color);
        setFormOrder(cat.order);
        setShowModal(true);
    };

    const handleNameChange = (value: string) => {
        setFormName(value);
        if (!editingCategory) {
            setFormSlug(value.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/gi, '-').replace(/^-+|-+$/g, ''));
        }
    };

    const handleSave = async () => {
        if (!formName.trim() || !formSlug.trim()) {
            toast.error('İsim ve slug zorunludur');
            return;
        }
        setSaving(true);
        try {
            const body = {
                name: formName.trim(),
                slug: formSlug.trim(),
                description: formDescription.trim() || undefined,
                icon: formIcon,
                color: formColor,
                order: formOrder,
            };

            const res = editingCategory
                ? await fetch(`${API}/${editingCategory.id}`, { credentials: 'include', method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                : await fetch(API, { credentials: 'include', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

            if (res.ok) {
                toast.success(editingCategory ? 'Kategori güncellendi' : 'Kategori oluşturuldu');
                setShowModal(false);
                fetchCategories();
            } else {
                const data = await res.json();
                toast.error(data.message || 'İşlem başarısız');
            }
        } catch {
            toast.error('Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
        try {
            const res = await fetch(`${API}/${id}`, { credentials: 'include', method: 'DELETE' });
            if (res.ok) {
                toast.success('Kategori silindi');
                fetchCategories();
            } else {
                toast.error('Silinemedi');
            }
        } catch {
            toast.error('Bir hata oluştu');
        }
    };

    const handleToggleActive = async (cat: Category) => {
        try {
            const res = await fetch(`${API}/${cat.id}`, {
                credentials: 'include', method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !cat.isActive })
            });
            if (res.ok) {
                toast.success(cat.isActive ? 'Kategori pasife alındı' : 'Kategori aktifleştirildi');
                fetchCategories();
            }
        } catch {
            toast.error('Bir hata oluştu');
        }
    };

    const colorOptions = [
        { label: 'Kırmızı', value: 'text-red-500', bg: 'bg-red-500' },
        { label: 'Amber', value: 'text-amber-500', bg: 'bg-amber-500' },
        { label: 'Mavi', value: 'text-blue-500', bg: 'bg-blue-500' },
        { label: 'Yeşil', value: 'text-emerald-500', bg: 'bg-emerald-500' },
        { label: 'Mor', value: 'text-purple-500', bg: 'bg-purple-500' },
        { label: 'Pembe', value: 'text-pink-500', bg: 'bg-pink-500' },
        { label: 'Turuncu', value: 'text-orange-500', bg: 'bg-orange-500' },
        { label: 'Cyan', value: 'text-cyan-500', bg: 'bg-cyan-500' },
    ];

    const iconOptions = ['Layers', 'Crown', 'Flame', 'Zap', 'Camera', 'Gamepad2', 'Eye', 'Radio', 'Sparkles', 'Star', 'Heart', 'Film'];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Kategoriler</h1>
                    <p className="text-sm text-muted-foreground mt-1">Video kategorilerini yönetin</p>
                </div>
                <Button onClick={openCreateModal} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> Yeni Kategori
                </Button>
            </div>

            {/* Categories Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-secondary/30">
                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-10">#</th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Kategori</th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Slug</th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Açıklama</th>
                            <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Durum</th>
                            <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                    Henüz kategori oluşturulmamış. "Yeni Kategori" butonunu kullanarak başlayın.
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat, i) => (
                                <tr key={cat.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-muted-foreground font-mono">{cat.order}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold ${cat.color}`}>
                                                {cat.icon?.[0] || 'C'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{cat.name}</p>
                                                <p className="text-xs text-muted-foreground hidden sm:block">{cat.icon}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <code className="text-xs bg-secondary px-2 py-1 rounded">{cat.slug}</code>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <p className="text-sm text-muted-foreground line-clamp-1">{cat.description || '—'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleToggleActive(cat)}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${cat.isActive
                                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                : 'bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20'
                                                }`}
                                        >
                                            {cat.isActive ? <><Eye className="w-3 h-3" /> Aktif</> : <><EyeOff className="w-3 h-3" /> Pasif</>}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEditModal(cat)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
                    <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">{editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Kategori Adı *</Label>
                                    <Input value={formName} onChange={e => handleNameChange(e.target.value)} placeholder="Örn: Premium" className="bg-secondary/50 border-border h-10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Slug *</Label>
                                    <Input value={formSlug} onChange={e => setFormSlug(e.target.value)} placeholder="Örn: premium" className="bg-secondary/50 border-border h-10 font-mono text-sm" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Açıklama</Label>
                                <Input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Kısa açıklama..." className="bg-secondary/50 border-border h-10" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>İkon</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {iconOptions.map(icon => (
                                            <button
                                                key={icon}
                                                onClick={() => setFormIcon(icon)}
                                                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${formIcon === icon ? 'bg-red-500 text-white border-red-500' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Renk</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {colorOptions.map(c => (
                                            <button
                                                key={c.value}
                                                onClick={() => setFormColor(c.value)}
                                                className={`w-7 h-7 rounded-full ${c.bg} transition-all ${formColor === c.value ? 'ring-2 ring-offset-2 ring-offset-background ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                                                title={c.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Sıra</Label>
                                <Input type="number" value={formOrder} onChange={e => setFormOrder(parseInt(e.target.value) || 0)} className="bg-secondary/50 border-border h-10 w-24" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowModal(false)}>İptal</Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
                                {saving ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Oluştur')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
