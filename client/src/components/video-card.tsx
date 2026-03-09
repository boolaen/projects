'use client';

import { Play, Clock, Eye, Crown, Flame } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { useVideoToken } from "@/hooks/use-video-token";

interface VideoCardProps {
    id: string;
    title: string;
    thumbnail: string;
    views: string;
    duration: string;
    uploader: string;
    uploaderAvatar?: string;
    isPremium?: boolean;
    date: string;
    layout?: 'default' | 'trending';
    rank?: number;
    isTopViewed?: boolean;
}

export function VideoCard({ id, title, thumbnail, views, duration, uploader, uploaderAvatar, isPremium, date, layout = 'default', rank, isTopViewed }: VideoCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const { streamUrl, fetchToken } = useVideoToken(id, isPremium ?? false);
    const [displayDuration, setDisplayDuration] = useState(duration);

    React.useEffect(() => {
        setDisplayDuration(duration);
    }, [duration]);

    const videoRef = React.useRef<HTMLVideoElement>(null);

    const avatarUrl = uploaderAvatar || `https://api.dicebear.com/9.x/micah/svg?seed=${uploader}&backgroundColor=b6b3eb,b6e3f4,c0aede,d1d4f9`;

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        if (isPremium) fetchToken();
    }, [isPremium, fetchToken]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    React.useEffect(() => {
        if (!videoRef.current) return;
        if (isHovered && streamUrl) {
            videoRef.current.play().catch(() => { });
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 10;
        }
    }, [isHovered, streamUrl]);

    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const displayThumbnail = thumbnail || '';

    if (layout === 'trending') {
        return (
            <div
                className="group relative aspect-video rounded-xl overflow-hidden border border-border/30 hover:border-red-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="absolute inset-0 w-full h-full bg-black">
                    {displayThumbnail ? (
                        <Image
                            src={displayThumbnail}
                            alt={title}
                            fill
                            unoptimized={displayThumbnail.startsWith('data:')}
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : null}
                    {streamUrl && (
                        <video
                            ref={videoRef}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                            src={streamUrl}
                            muted
                            loop
                            playsInline
                            preload="none"
                            onLoadedMetadata={(e) => { e.currentTarget.currentTime = 10; }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                {rank && (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/90 text-white text-[10px] font-bold uppercase z-10 pointer-events-none">
                        <Flame className="w-3 h-3" />
                        #{rank}
                    </div>
                )}
                {isPremium && (
                    <Badge variant="secondary" className="absolute top-2.5 right-2.5 bg-amber-500 hover:bg-amber-600 text-black border-none gap-1 shadow-md z-10 pointer-events-none text-[10px]">
                        <Crown className="w-3 h-3" /> PREMIUM
                    </Badge>
                )}
                <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none text-left">
                    <h3 className="text-[14px] sm:text-base font-bold text-white line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-snug tracking-wide">{title}</h3>
                </div>
                {/* Hover play icon */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${isHovered && !streamUrl ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-11 h-11 rounded-full bg-red-500/90 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="group flex flex-col gap-3 cursor-pointer hover:-translate-y-1 transition-transform duration-300"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Thumbnail Container */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-border/50 group-hover:border-border transition-all duration-300 shadow-sm group-hover:shadow-md">
                {isTopViewed && (
                    <Badge variant="destructive" className="absolute top-2 left-2 shadow-lg z-20 text-[10px] sm:text-xs font-bold gap-1 animate-pulse border-none">
                        <Flame className="w-3.5 h-3.5" /> POPÜLER
                    </Badge>
                )}
                {isPremium && <Badge variant="secondary" className={`absolute ${isTopViewed ? 'top-10' : 'top-2'} left-2 bg-amber-500 hover:bg-amber-600 text-black border-none gap-1 shadow-md z-10 text-[10px] transition-all`}>
                    <Crown className="w-3 h-3" /> PREMIUM
                </Badge>}

                {/* Removed Duration Badge for cleaner look */}

                {/* Media */}
                <div className="absolute inset-0 w-full h-full bg-black">
                    {displayThumbnail ? (
                        <Image
                            src={displayThumbnail}
                            alt={title}
                            fill
                            unoptimized={displayThumbnail.startsWith('data:')}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : null}

                    {streamUrl && (
                        <video
                            ref={videoRef}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                            src={streamUrl}
                            muted
                            loop
                            playsInline
                            preload="none"
                            onLoadedMetadata={(e) => {
                                e.currentTarget.currentTime = 10;
                                if (!duration || duration === "00:00" || duration === "0:00") {
                                    setDisplayDuration(formatDuration(e.currentTarget.duration));
                                }
                            }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    )}
                </div>

                {/* Hover play icon (Default Layout) */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${isHovered && !streamUrl ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                </div>
            </div>

            {/* Info - Cinematic Style */}
            <div className="mt-2 px-1 flex flex-col gap-1.5">
                <h3 className="line-clamp-2 text-[14px] md:text-[15px] font-bold text-foreground/90 group-hover:text-white transition-colors leading-snug text-left tracking-wide">
                    {title}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground/60">
                    <span className="border border-muted-foreground/30 px-1 py-0.5 rounded-[3px] text-[9px] uppercase tracking-wider text-muted-foreground/80 leading-none shadow-sm">
                        HD
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-0.5"></span>
                    <span>{displayDuration}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-0.5"></span>
                    <span>{views.split(' ')[0]} izlenme</span>
                </div>
            </div>
        </div>
    );
}
