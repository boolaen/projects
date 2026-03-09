'use client';

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileVideo, X, Image, RefreshCw } from "lucide-react";
import { apiFetch } from '@/lib/api';

export default function UploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Uncategorized");
    const [isPremium, setIsPremium] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [extractingFrame, setExtractingFrame] = useState(false);
    const [duration, setDuration] = useState<number>(0);

    const [userRole, setUserRole] = useState<string | null>(null);

    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        apiFetch('/users/me')
            .then(res => {
                if (!res.ok) throw new Error('Not auth');
                return res.json();
            })
            .then(data => {
                if (data.role !== 'ADMIN' && data.role !== 'CREATOR') {
                    router.push('/anasayfa');
                } else {
                    setUserRole(data.role);
                }
            })
            .catch(() => {
                router.push('/login');
            });

        apiFetch('/videos/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(() => { });
    }, [router]);

    const extractFrame = (videoFile: File) => {
        setExtractingFrame(true);
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        const url = URL.createObjectURL(videoFile);
        video.src = url;

        video.onloadedmetadata = () => {
            const duration = video.duration;
            setDuration(Math.floor(duration));
            const randomSecond = Math.random() * Math.min(duration, duration * 0.9);
            video.currentTime = randomSecond;
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setThumbnailUrl(dataUrl);
            }
            URL.revokeObjectURL(url);
            setExtractingFrame(false);
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            setExtractingFrame(false);
        };
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            extractFrame(selectedFile);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;

        // 10GB Limit Check
        const MAX_SIZE = 10 * 1024 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            toast.error("Dosya boyutu 10GB'dan büyük olamaz.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(10); // Simulation start

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('isPremium', String(isPremium));
        formData.append('duration', String(duration));
        if (thumbnailUrl) {
            formData.append('thumbnailUrl', thumbnailUrl);
        }

        try {
            const res = await apiFetch('/videos/upload', {
                method: 'POST',
                headers: {
                },
                body: formData,
                timeout: 3600000, // 1 Saat timeout limiti (Büyük videolar için)
            });

            setUploadProgress(80); // Simulation almost done

            if (res.ok) {
                setUploadProgress(100);
                setTimeout(() => {
                    router.push('/anasayfa');
                }, 500);
            } else {
                const errorData = await res.json().catch(() => null);
                toast.error(errorData?.message || 'Yükleme başarısız');
                setIsUploading(false);
            }
        } catch (error: any) {
            console.error('Upload Error:', error);
            // Error handled with more context
            toast.error(error.message || 'Yükleme hatası (Zaman aşımı veya bağlantı sorunu)');
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <h1 className="text-2xl font-bold mb-8 flex items-center gap-2 text-foreground">
                        <Upload className="text-red-600" /> Video Yükle
                    </h1>

                    <form onSubmit={handleUpload} className="space-y-6">

                        {/* File Drop Zone */}
                        <div className="relative border-2 border-dashed border-border rounded-xl p-8 transition-colors hover:border-red-500/50 hover:bg-secondary/50">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            {!file ? (
                                <div className="flex flex-col items-center justify-center text-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                        <FileVideo className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="font-medium text-foreground">Videoyu sürükleyin veya seçin</p>
                                    <p className="text-sm text-muted-foreground">MP4, WebM veya Ogg (Maks. 10GB)</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-secondary p-4 rounded-lg z-10 relative pointer-events-none">
                                    <div className="flex items-center gap-3">
                                        <FileVideo className="text-red-500" />
                                        <span className="font-mono text-sm truncate max-w-[200px] text-foreground">{file.name}</span>
                                        <span className="text-xs text-muted-foreground">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                                        className="pointer-events-auto p-1 hover:bg-background rounded-full transition-colors text-foreground"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Preview */}
                        {file && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        <Image className="w-4 h-4 text-purple-500" />
                                        Otomatik Kapak Görseli
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() => extractFrame(file)}
                                        disabled={extractingFrame}
                                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${extractingFrame ? 'animate-spin' : ''}`} />
                                        Yeni Frame
                                    </button>
                                </div>
                                {thumbnailUrl ? (
                                    <img src={thumbnailUrl} alt="Preview" className="w-full max-w-sm rounded-xl border border-border" />
                                ) : extractingFrame ? (
                                    <div className="w-full max-w-sm aspect-video bg-secondary rounded-xl flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Başlık</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Videonuzun başlığı..."
                                    className="bg-background border-input focus:border-red-500"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm appearance-none text-foreground"
                                    >
                                        <option value="Uncategorized">Kategori Seçin</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Trending">Trending</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat.id} value={cat.slug || cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 fill-current text-muted-foreground" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full min-h-[100px] px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-foreground placeholder:text-muted-foreground"
                                placeholder="Videonuz hakkında kısa bir açıklama..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="premium"
                                checked={isPremium}
                                onChange={(e) => setIsPremium(e.target.checked)}
                                className="w-4 h-4 text-red-600 bg-background border-input rounded focus:ring-red-500"
                            />
                            <Label htmlFor="premium" className="cursor-pointer">Bu içerik sadece <span className="text-amber-500 font-bold">Premium</span> üyeler içindir</Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-6 text-lg shadow-lg shadow-red-900/20"
                            disabled={isUploading}
                        >
                            {isUploading ? `Yükleniyor... %${uploadProgress}` : 'Videoyu Yayınla'}
                        </Button>

                    </form>
                </div>
            </main>
        </div>
    );
}
