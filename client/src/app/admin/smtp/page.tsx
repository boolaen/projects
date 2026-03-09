'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Mail } from 'lucide-react';
import { apiFetch, api } from '@/lib/api';

export default function AdminSmtpSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        smtpHost: '',
        smtpPort: '',
        smtpUser: '',
        smtpPass: '',
        smtpFrom: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await apiFetch('/users/settings/global');
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        smtpHost: data.smtpHost || '',
                        smtpPort: data.smtpPort ? String(data.smtpPort) : '',
                        smtpUser: data.smtpUser || '',
                        smtpPass: data.smtpPass || '',
                        smtpFrom: data.smtpFrom || ''
                    });
                }
            } catch (error) {
                toast.error('Ayarlar yüklenemedi.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = { ...formData, smtpPort: formData.smtpPort ? parseInt(formData.smtpPort) : null };
            const res = await apiFetch('/admin/settings/global', {
                credentials: 'include',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('SMTP ayarları başarıyla kaydedildi.');
            } else {
                toast.error('Ayarlar kaydedilemedi.');
            }
        } catch (error) {
            toast.error('Bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-10 bg-secondary/50 rounded-xl w-1/3"></div>
            <div className="h-32 bg-secondary/50 rounded-2xl w-full"></div>
        </div>;
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Mail className="w-8 h-8 text-blue-500" />
                    SMTP Ayarları
                </h1>
                <p className="text-muted-foreground mt-2">
                    E-posta gönderimlerini (Yeni şifre, aktivasyon, vb.) yapacak sunucu yapılandırması.
                </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="smtpHost" className="text-base font-semibold">SMTP Sunucu (Host)</Label>
                        <Input
                            id="smtpHost"
                            name="smtpHost"
                            placeholder="Örn: smtp.gmail.com"
                            value={formData.smtpHost}
                            onChange={handleChange}
                            className="bg-secondary/50 h-12"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="smtpPort" className="text-base font-semibold">SMTP Port</Label>
                        <Input
                            id="smtpPort"
                            name="smtpPort"
                            type="number"
                            placeholder="Örn: 465 veya 587"
                            value={formData.smtpPort}
                            onChange={handleChange}
                            className="bg-secondary/50 h-12"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="smtpUser" className="text-base font-semibold">SMTP Kullanıcı / E-posta</Label>
                        <Input
                            id="smtpUser"
                            name="smtpUser"
                            placeholder="Örn: ornek@gmail.com"
                            value={formData.smtpUser}
                            onChange={handleChange}
                            className="bg-secondary/50 h-12"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="smtpPass" className="text-base font-semibold">SMTP Şifre / Uygulama Şifresi</Label>
                        <Input
                            id="smtpPass"
                            name="smtpPass"
                            type="password"
                            placeholder="••••••••"
                            value={formData.smtpPass}
                            onChange={handleChange}
                            className="bg-secondary/50 h-12"
                        />
                    </div>

                    <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="smtpFrom" className="text-base font-semibold">Gönderen Adresi (From)</Label>
                        <Input
                            id="smtpFrom"
                            name="smtpFrom"
                            placeholder='Örn: "Aduket Destek" <ornek@gmail.com>'
                            value={formData.smtpFrom}
                            onChange={handleChange}
                            className="bg-secondary/50 h-12"
                        />
                        <p className="text-xs text-muted-foreground mt-1">E-postaları alan kişiye görünecek isim ve adrestir.</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        Ayarları Kaydet
                    </Button>
                </div>

            </div>
        </div>
    );
}
