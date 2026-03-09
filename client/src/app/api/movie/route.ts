import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure no caching of the response.

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
        return NextResponse.json({ error: 'Film adı gerekli.' }, { status: 400 });
    }

    const apiKey = process.env.OMDB_API_KEY;

    if (!apiKey) {
        console.error("OMDB_API_KEY is not defined in environment variables.");
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    try {
        // Clean the title: remove things like (FULL HD), etc.
        const cleanedTitle = title.replace(/\(.*?\)/g, '').trim();

        // 1. Map typical Turkish characters to English equivalents for better OMDb matching
        const turkishMap: { [key: string]: string } = {
            'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
            'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
        };
        const englishTitle = cleanedTitle.replace(/[çÇğĞıİöÖşŞüÜ]/g, match => turkishMap[match] || match);

        // 2. Exact IMDB ID matching for extremely popular Turkish classic movies 
        // that OMDb's free tier index struggles to find without specific English names or IDs
        const manualIMDbMap: { [key: string]: string } = {
            'hababam sinifi': 'tt0252487',     // Hababam Sinifi (The Chaos Class)
            'saban oglu saban': 'tt0253614',   // Saban Oglu Saban
            'copculer krali': 'tt0253997',     // Copculer Krali
            'neseli gunler': 'tt0765833',      // Neseli Gunler (Happy Days)
            'kibar feyzo': 'tt0252597',        // Kibar Feyzo
            'sekerpare': 'tt0494823',          // Sekerpare
            'sakar sakir': 'tt0253621'         // Sakar Sakir
        };

        const mappedId = manualIMDbMap[englishTitle.toLowerCase()];
        var data: any = null;

        if (mappedId) {
            // Direct ID fetch
            const detailsUrl = `https://www.omdbapi.com/?i=${mappedId}&apikey=${apiKey}`;
            const detailsRes = await fetch(detailsUrl, { cache: 'no-store' });
            data = await detailsRes.json();

            if (data.Response === 'False') {
                return NextResponse.json({ error: 'Bu film IMDb veritabanında bulunamadı.' }, { status: 404 });
            }
        } else {
            // 3. Fallback to Search API & Title API
            const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(englishTitle)}&apikey=${apiKey}`;
            const searchRes = await fetch(searchUrl, { cache: 'no-store' });
            const searchData = await searchRes.json();

            if (!searchRes.ok || searchData.Response === 'False') {
                const fallbackUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(englishTitle)}&apikey=${apiKey}`;
                const fallbackRes = await fetch(fallbackUrl, { cache: 'no-store' });
                const fallbackData = await fallbackRes.json();

                if (!fallbackRes.ok || fallbackData.Response === 'False') {
                    const originalUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(cleanedTitle)}&apikey=${apiKey}`;
                    const originalRes = await fetch(originalUrl, { cache: 'no-store' });
                    const originalData = await originalRes.json();

                    if (!originalRes.ok || originalData.Response === 'False') {
                        const errMsg = originalData.Error === 'Movie not found!' ? 'Bu film IMDb veritabanında bulunamadı.' : (originalData.Error || 'Film bilgileri bulunamadı.');
                        return NextResponse.json({ error: errMsg }, { status: 404 });
                    }
                    data = originalData;
                } else {
                    data = fallbackData;
                }
            } else {
                const imdbId = searchData.Search[0].imdbID;
                const detailsUrl = `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`;
                const detailsRes = await fetch(detailsUrl, { cache: 'no-store' });
                data = await detailsRes.json();
            }
        }

        // Translate plot to Turkish
        let plot = data.Plot && data.Plot !== 'N/A' ? data.Plot : '';
        if (plot) {
            try {
                const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(plot)}`;
                const transRes = await fetch(translateUrl);
                if (transRes.ok) {
                    const transData = await transRes.json();
                    plot = transData[0].map((item: any) => item[0]).join('');
                }
            } catch (e) {
                // Keep original English plot if translation fails safely
            }
        }

        // Fetch real actor photos from Wikipedia (TR and EN fallback)
        const actorsList = data.Actors && data.Actors !== 'N/A' ? data.Actors.split(',').map((a: string) => a.trim()) : [];
        const actors = await Promise.all(actorsList.map(async (name: string) => {
            let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
            try {
                // Try Turkish Wikipedia first
                let wikiUrl = `https://tr.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=200&titles=${encodeURIComponent(name)}`;
                let wikiRes = await fetch(wikiUrl);
                let wikiData = await wikiRes.json();
                let pages = wikiData.query?.pages;
                let pageId = pages ? Object.keys(pages)[0] : null;

                if (pageId && pageId !== '-1' && pages[pageId].thumbnail) {
                    avatarUrl = pages[pageId].thumbnail.source;
                } else {
                    // Fallback to English Wikipedia
                    let wikiUrlEn = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=200&titles=${encodeURIComponent(name)}`;
                    let wikiResEn = await fetch(wikiUrlEn);
                    let wikiDataEn = await wikiResEn.json();
                    let pagesEn = wikiDataEn.query?.pages;
                    let pageIdEn = pagesEn ? Object.keys(pagesEn)[0] : null;

                    if (pageIdEn && pageIdEn !== '-1' && pagesEn[pageIdEn].thumbnail) {
                        avatarUrl = pagesEn[pageIdEn].thumbnail.source;
                    }
                }
            } catch (e) {
                // Fallback is already text avatar
            }
            return { name, avatarUrl };
        }));

        // Normalize response
        const normalizedData = {
            title: cleanedTitle, // Use exactly the requested video title
            year: data.Year || '',
            runtime: data.Runtime || '',
            genres: data.Genre ? data.Genre.split(',').map((g: string) => g.trim()) : [],
            country: data.Country || '',
            plot: plot,
            imdbRating: data.imdbRating || '',
            imdbVotes: data.imdbVotes || '',
            poster: data.Poster !== 'N/A' ? data.Poster : null,
            actors: actors
        };

        return NextResponse.json(normalizedData);
    } catch (error) {
        console.error("OMDb API error:", error);
        return NextResponse.json({ error: 'Film bilgileri şu anda alınamıyor.' }, { status: 500 });
    }
}
