"use client";

import { useEffect, useState } from "react";
import { Star, Clock, Eye, Calendar, MapPin, Play, Youtube } from "lucide-react";

interface MovieInfoProps {
    title: string;
    category?: string;
    views?: number | string;
}

interface Actor {
    name: string;
    avatarUrl: string;
}

interface MovieData {
    title: string;
    year: string;
    runtime: string;
    genres: string[];
    country: string;
    plot: string;
    imdbRating: string;
    imdbVotes: string;
    poster: string | null;
    actors: Actor[];
}

export function MovieInfo({ title, category, views = 0 }: MovieInfoProps) {
    const [data, setData] = useState<MovieData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovieData = async () => {
            if (!title) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/movie?title=${encodeURIComponent(title)}&_t=${new Date().getTime()}`);
                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.error || "Film bilgileri şu anda alınamıyor.");
                }

                setData(json);
            } catch (err: any) {
                setError(err.message || "Film bilgileri alınırken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchMovieData();
    }, [title]);

    // Structured data for SEO (JSON-LD) and Title updating
    useEffect(() => {
        if (!data) return;

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "movie-schema";

        const schema = {
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": data.title,
            "image": data.poster,
            "description": data.plot,
            "dateCreated": data.year,
            "countryOfOrigin": data.country,
            "duration": `PT${data.runtime.replace(' min', 'M')}`
        };

        script.text = JSON.stringify(schema);
        document.head.appendChild(script);

        // Update document title for SEO
        const originalTitle = document.title;
        document.title = `${data.title} izle – IMDb ${data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : '-'} – HD`;

        return () => {
            const existingScript = document.getElementById("movie-schema");
            if (existingScript) document.head.removeChild(existingScript);
            // Revert title when unmounting, though optionally we could just leave it since the whole page is for this movie
            document.title = originalTitle;
        };
    }, [data]);

    if (loading) {
        return (
            <div className="w-full rounded-2xl bg-zinc-900/40 border border-border p-4 sm:p-6 animate-pulse flex flex-col md:flex-row gap-6 backdrop-blur-md">
                <div className="w-full md:w-64 aspect-[2/3] bg-zinc-800 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-4 py-2">
                    <div className="h-6 bg-zinc-800 rounded w-3/4"></div>
                    <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                    <div className="space-y-2 pt-4">
                        <div className="h-4 bg-zinc-800 rounded"></div>
                        <div className="h-4 bg-zinc-800 rounded"></div>
                        <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="w-full rounded-2xl bg-zinc-900/40 border border-border p-6 backdrop-blur-md text-center">
                <p className="text-zinc-400">{error || "Film bilgileri bulunamadı."}</p>
            </div>
        );
    }

    const { poster, plot, year, runtime, genres, country, imdbRating, imdbVotes, actors } = data;

    // Search youtube trailer
    const handleTrailerSearch = () => {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.title + ' trailer')}`, '_blank');
    };

    return (
        <div className="w-full flex flex-col relative overflow-hidden mt-2">
            {/* Background Blur Effect */}
            {poster && (
                <div
                    className="absolute inset-0 opacity-[0.03] sm:opacity-5 blur-3xl rounded-2xl pointer-events-none scale-110"
                    style={{ backgroundImage: `url(${poster})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
            )}

            <div className="relative w-full rounded-2xl bg-zinc-900/30 border border-white/5 p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row gap-6 sm:gap-8 hover:bg-zinc-900/40 transition-all duration-500 hover:border-white/10">
                {/* LEFT AREA: Poster & Main Stats */}
                <div className="w-full md:w-[240px] flex-shrink-0 flex flex-col gap-4">
                    <div className="w-full aspect-[2/3] relative rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] group">
                        {poster ? (
                            <img
                                src={poster}
                                alt={`${data.title} Poster`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.insertAdjacentHTML('afterend', '<div class="absolute inset-0 w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">Afiş Bulunamadı</div>');
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
                                Poster Yok
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    </div>

                    {/* IMDb Row */}
                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner">
                        <div className="bg-[#F5C518] text-black font-black px-2.5 py-1 rounded text-xs tracking-tight flex-shrink-0 flex items-center shadow-lg shadow-[#F5C518]/20">
                            IMDb
                        </div>
                        <div className="flex flex-col flex-1">
                            {imdbRating && imdbRating !== 'N/A' ? (
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-bold text-white leading-none">{imdbRating}</span>
                                    <span className="text-[11px] text-zinc-400 font-medium">/ 10</span>
                                </div>
                            ) : (
                                <span className="text-sm font-medium text-zinc-400">Puan Yok</span>
                            )}
                            {imdbVotes && imdbVotes !== 'N/A' && (
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{imdbVotes} OY</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT AREA: Details */}
                <div className="flex-1 flex flex-col min-w-0 pt-1">
                    {/* Header: Title and Trailer Button */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                {data.title}
                            </h2>
                            {/* Genres Pill Tags */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {genres?.map(g => (
                                    <span key={g} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-[11px] font-semibold uppercase tracking-wider rounded-full transition-colors cursor-default">
                                        {g}
                                    </span>
                                ))}
                                {category && (
                                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-semibold uppercase tracking-wider rounded-full">
                                        {category}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleTrailerSearch}
                            className="group flex items-center justify-center gap-2 bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-lg"
                        >
                            <Youtube className="w-4 h-4 text-red-500 group-hover:animate-pulse" />
                            Fragman İzle
                        </button>
                    </div>

                    {/* Plot */}
                    <div className="mb-6 bg-zinc-900/40 p-4 rounded-xl border border-white/5">
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            {plot && plot !== 'N/A' ? plot : 'Bu film için özet bulunmuyor.'}
                        </p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> SÜRE</span>
                            <span className="text-zinc-200 font-medium text-sm">{runtime !== 'N/A' ? runtime : '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> YIL</span>
                            <span className="text-zinc-200 font-medium text-sm">{year !== 'N/A' ? year : '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> ÜLKE</span>
                            <span className="text-zinc-200 font-medium text-sm">{country !== 'N/A' ? country : '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> İZLENME</span>
                            <span className="text-zinc-200 font-medium text-sm">{views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                        </div>
                    </div>

                    {/* Actors Scrollable list */}
                    {actors && actors.length > 0 && (
                        <div className="mt-auto">
                            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                <h3 className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Oyuncu Kadrosu</h3>
                            </div>
                            <div className="flex items-center gap-5 overflow-x-auto pb-4 pt-1 scrollbar-hide mask-fade-edges hover:mask-none transition-all">
                                {actors.map((actor, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2.5 flex-shrink-0 group w-[72px]">
                                        <div className="w-[60px] h-[60px] rounded-full border-2 border-zinc-700/50 p-0.5 group-hover:border-zinc-500 transition-colors shadow-lg">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800">
                                                <img
                                                    src={actor.avatarUrl}
                                                    alt={actor.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-center text-zinc-400 group-hover:text-zinc-200 line-clamp-2 leading-tight font-medium transition-colors">
                                            {actor.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .mask-fade-edges {
                    mask-image: linear-gradient(to right, black 85%, transparent);
                    -webkit-mask-image: -webkit-linear-gradient(left, black 85%, transparent);
                }
                .hover\\:mask-none:hover {
                    mask-image: none;
                    -webkit-mask-image: none;
                }
            `}</style>
        </div>
    );
}
