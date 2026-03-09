'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, LayoutTemplate, Search, Globe, FileCode, BarChart3, Info } from 'lucide-react';
import { apiFetch, api } from '@/lib/api';
import { useSiteSettings } from '@/components/site-settings-provider';

function Tooltip({ text }: { text: string }) {
    return (
        <div className="group relative inline-flex ml-1.5 cursor-help">
            <Info className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs text-muted-foreground w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-lg z-10">
                {text}
            </div>
        </div>
    );
}

export default function AdminSettingsPage() {
    const { refreshSettings } = useSiteSettings();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        siteName: '',
        logoUrl: '',
        // SEO fields
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        canonicalUrl: '',
        robotsTxt: '',
        sitemapUrl: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        googleAnalyticsId: '',
        googleVerification: '',
        schemaMarkup: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await apiFetch('/users/settings/global', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        siteName: data.siteName || '',
                        logoUrl: data.logoUrl || '',
                        metaTitle: data.metaTitle || '',
                        metaDescription: data.metaDescription || '',
                        metaKeywords: data.metaKeywords || '',
                        canonicalUrl: data.canonicalUrl || '',
                        robotsTxt: data.robotsTxt || '',
                        sitemapUrl: data.sitemapUrl || '',
                        ogTitle: data.ogTitle || '',
                        ogDescription: data.ogDescription || '',
                        ogImage: data.ogImage || '',
                        googleAnalyticsId: data.googleAnalyticsId || '',
                        googleVerification: data.googleVerification || '',
                        schemaMarkup: data.schemaMarkup || '',
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await apiFetch('/admin/settings/global', {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Ayarlar başarıyla kaydedildi.');
                await refreshSettings();
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
            <div className="h-32 bg-secondary/50 rounded-2xl w-full"></div>
        </div>;
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <LayoutTemplate className="w-7 h-7 text-red-500" />
                    Site Ayarları
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Platformun genel görünümünü, SEO ayarlarını ve analiz entegrasyonlarını yönetin.
                </p>
            </div>

            {/* General Settings */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-base font-semibold flex items-center gap-2 pb-2 border-b border-border/50">
                    <Globe className="w-4 h-4 text-red-500" />
                    Genel Ayarlar
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="siteName" className="text-sm font-medium flex items-center">
                            Site İsmi
                            <Tooltip text="Tarayıcı sekmesinde, logo yanında ve footer'da görünecek isim." />
                        </Label>
                        <Input id="siteName" name="siteName" placeholder="ADUKET" value={formData.siteName} onChange={handleChange} className="bg-secondary/50 h-10" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="logoUrl" className="text-sm font-medium flex items-center">
                            Logo URL
                            <Tooltip text="Navbar ve sidebar'da gösterilecek logo görseli. URL veya yol girin." />
                        </Label>
                        <div className="flex gap-3">
                            <Input id="logoUrl" name="logoUrl" placeholder="https://..." value={formData.logoUrl} onChange={handleChange} className="bg-secondary/50 h-10 flex-1" />
                            {formData.logoUrl && (
                                <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                                    <img src={formData.logoUrl} alt="Logo" className="max-w-[28px] max-h-[28px] object-contain" onError={e => e.currentTarget.style.display = 'none'} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-base font-semibold flex items-center gap-2 pb-2 border-b border-border/50">
                    <Search className="w-4 h-4 text-red-500" />
                    SEO Ayarları
                </h2>

                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="metaTitle" className="text-sm font-medium flex items-center">
                                Meta Title
                                <Tooltip text="Google arama sonuçlarında görünen sayfa başlığı. 50-60 karakter önerilir." />
                            </Label>
                            <Input id="metaTitle" name="metaTitle" placeholder="ADUKET — Premium İçerik Platformu" value={formData.metaTitle} onChange={handleChange} className="bg-secondary/50 h-10" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="metaKeywords" className="text-sm font-medium flex items-center">
                                Meta Keywords
                                <Tooltip text="Virgülle ayrılmış anahtar kelimeler. Örn: premium, 4K, video, izle" />
                            </Label>
                            <Input id="metaKeywords" name="metaKeywords" placeholder="premium, 4K, video, izle" value={formData.metaKeywords} onChange={handleChange} className="bg-secondary/50 h-10" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="metaDescription" className="text-sm font-medium flex items-center">
                            Meta Description
                            <Tooltip text="Google arama sonuçlarında başlık altında görünen açıklama. 150-160 karakter önerilir." />
                        </Label>
                        <textarea
                            id="metaDescription"
                            name="metaDescription"
                            rows={3}
                            placeholder="ADUKET ile premium kalitede içeriklerin keyfini çıkarın..."
                            value={formData.metaDescription}
                            onChange={handleChange}
                            className="w-full bg-secondary/50 border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="canonicalUrl" className="text-sm font-medium flex items-center">
                                Canonical URL
                                <Tooltip text="Sitenizin birincil adresi. Tekrarlı içerik sorunlarını önlemek için kullanılır. Örn: https://aduket.com" />
                            </Label>
                            <Input id="canonicalUrl" name="canonicalUrl" placeholder="https://aduket.com" value={formData.canonicalUrl} onChange={handleChange} className="bg-secondary/50 h-10" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sitemapUrl" className="text-sm font-medium flex items-center">
                                Sitemap URL
                                <Tooltip text="Arama motorlarının sitenizi taraması için XML sitemap'in adresi. Genelde /sitemap.xml olur." />
                            </Label>
                            <Input id="sitemapUrl" name="sitemapUrl" placeholder="https://aduket.com/sitemap.xml" value={formData.sitemapUrl} onChange={handleChange} className="bg-secondary/50 h-10" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="robotsTxt" className="text-sm font-medium flex items-center">
                            Robots.txt İçeriği
                            <Tooltip text="Arama motorlarının hangi sayfaları tarayacağını belirler. Varsayılan: User-agent: * Allow: /" />
                        </Label>
                        <textarea
                            id="robotsTxt"
                            name="robotsTxt"
                            rows={4}
                            placeholder={"User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://aduket.com/sitemap.xml"}
                            value={formData.robotsTxt}
                            onChange={handleChange}
                            className="w-full bg-secondary/50 border border-input rounded-md px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Open Graph Settings */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-base font-semibold flex items-center gap-2 pb-2 border-b border-border/50">
                    <Globe className="w-4 h-4 text-red-500" />
                    Open Graph (Sosyal Medya)
                </h2>

                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="ogTitle" className="text-sm font-medium flex items-center">
                                OG Title
                                <Tooltip text="Sosyal medyada paylaşıldığında görünecek başlık. Boş bırakılırsa Meta Title kullanılır." />
                            </Label>
                            <Input id="ogTitle" name="ogTitle" placeholder="ADUKET — Premium İçerik" value={formData.ogTitle} onChange={handleChange} className="bg-secondary/50 h-10" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ogImage" className="text-sm font-medium flex items-center">
                                OG Image URL
                                <Tooltip text="Sosyal medyada paylaşıldığında görünecek görsel. Önerilen boyut: 1200x630 piksel." />
                            </Label>
                            <Input id="ogImage" name="ogImage" placeholder="https://aduket.com/og-image.jpg" value={formData.ogImage} onChange={handleChange} className="bg-secondary/50 h-10" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ogDescription" className="text-sm font-medium flex items-center">
                            OG Description
                            <Tooltip text="Sosyal medyada paylaşıldığında görünecek açıklama. Boş bırakılırsa Meta Description kullanılır." />
                        </Label>
                        <textarea
                            id="ogDescription"
                            name="ogDescription"
                            rows={2}
                            placeholder="Sosyal medyada görünecek açıklama..."
                            value={formData.ogDescription}
                            onChange={handleChange}
                            className="w-full bg-secondary/50 border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Analytics & Verification */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-base font-semibold flex items-center gap-2 pb-2 border-b border-border/50">
                    <BarChart3 className="w-4 h-4 text-red-500" />
                    Analiz & Doğrulama
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="googleAnalyticsId" className="text-sm font-medium flex items-center">
                            Google Analytics ID
                            <Tooltip text="Google Analytics 4 ölçüm kimliği. Örn: G-XXXXXXXXXX. analytics.google.com'dan alabilirsiniz." />
                        </Label>
                        <Input id="googleAnalyticsId" name="googleAnalyticsId" placeholder="G-XXXXXXXXXX" value={formData.googleAnalyticsId} onChange={handleChange} className="bg-secondary/50 h-10 font-mono" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="googleVerification" className="text-sm font-medium flex items-center">
                            Search Console Doğrulama
                            <Tooltip text="Google Search Console doğrulama meta etiketi içeriği. search.google.com/search-console adresinden alın." />
                        </Label>
                        <Input id="googleVerification" name="googleVerification" placeholder="doğrulama-kodu" value={formData.googleVerification} onChange={handleChange} className="bg-secondary/50 h-10 font-mono" />
                    </div>
                </div>
            </div>

            {/* Schema Markup */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-base font-semibold flex items-center gap-2 pb-2 border-b border-border/50">
                    <FileCode className="w-4 h-4 text-red-500" />
                    Schema Markup (JSON-LD)
                </h2>

                <div className="space-y-2">
                    <Label htmlFor="schemaMarkup" className="text-sm font-medium flex items-center">
                        JSON-LD Schema
                        <Tooltip text="Google'ın zengin sonuçlar göstermesi için yapılandırılmış veri. JSON-LD formatında girilmelidir. schema.org'dan şablonlar alabilirsiniz." />
                    </Label>
                    <textarea
                        id="schemaMarkup"
                        name="schemaMarkup"
                        rows={8}
                        placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "ADUKET",\n  "url": "https://aduket.com"\n}'}
                        value={formData.schemaMarkup}
                        onChange={handleChange}
                        className="w-full bg-secondary/50 border border-input rounded-md px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pb-8">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-8 rounded-xl"
                >
                    {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Ayarları Kaydet
                </Button>
            </div>
        </div>
    );
}
