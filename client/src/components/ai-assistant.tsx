'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Play } from 'lucide-react';
import Link from 'next/link';
import { api, apiFetch } from '@/lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    videos?: { id: string; title: string; views: number; isPremium: boolean }[];
}

const FAQ_RESPONSES: Record<string, string> = {
    // Greetings
    'merhaba': 'Merhaba! 👋 ADUKET platformuna hoş geldiniz. Size nasıl yardımcı olabilirim?',
    'selam': 'Selam! Size nasıl yardımcı olabilirim? Premium üyelik, video kalitesi veya platformla ilgili her konuda yanıtlayabilirim.',
    'naber': 'İyiyim, teşekkürler! 😊 Size ADUKET ile ilgili nasıl yardımcı olabilirim?',
    'nasıl': 'Size nasıl yardımcı olabilirim? Premium üyelik, abonelik planları, video kalitesi, hesap ayarları veya platform kuralları hakkında sorularınızı sorabilirsiniz.',

    // Premium & Subscription
    'premium': 'Premium üyelik ile tüm özel içeriklere, 4K Ultra HD kalitede izleme deneyimine ve daha birçok ayrıcalığa sahip olabilirsiniz. Detaylar için /premium sayfasını ziyaret edin.',
    'abone': 'Abonelik planlarımızı görmek için /abonelikler sayfasını ziyaret edin. Bronz, Gümüş ve Altın olmak üzere 3 farklı paketimiz bulunmaktadır.',
    'ücret': 'Abonelik ücretlerimiz paketlere göre değişmektedir. Güncel fiyatlar için /abonelikler sayfasını ziyaret edebilirsiniz. Kupon kodlarıyla indirim de alabilirsiniz.',
    'fiyat': 'Fiyatlandırma detayları için /abonelikler sayfamızı ziyaret edin. Her bütçeye uygun planlarımız mevcuttur.',
    'ödeme': 'Ödeme yöntemlerimiz hakkında bilgi almak için /abonelikler sayfasını ziyaret edin veya Telegram üzerinden bizimle iletişime geçin: @sofistikadam',

    // Account & Settings
    'şifre': 'Şifrenizi değiştirmek için /ayarlar sayfasını ziyaret edin. Güvenlik bölümünden mevcut şifrenizi girerek yeni şifre belirleyebilirsiniz.',
    'hesap': 'Hesap ayarlarınızı yönetmek için /ayarlar sayfasına gidin. Kullanıcı adı, e-posta, şifre ve profil bilgilerinizi güncelleyebilirsiniz.',
    'profil': 'Profil bilgilerinizi /ayarlar sayfasından güncelleyebilirsiniz. Avatar, kullanıcı adı ve biyografi ekleyebilirsiniz.',
    'avatar': 'Profil fotoğrafınızı /ayarlar sayfasında değiştirebilirsiniz. Avatarınızın üzerine gelip kamera ikonuna tıklayın.',

    // Coupon
    'kupon': 'Kupon kodunuzu /ayarlar sayfasındaki "Kupon Kodu Kullan" bölümünden girebilirsiniz. Geçerli bir kupon kodu ile premium üyeliğe geçiş yapabilirsiniz.',
    'indirim': 'İndirim kupon kodları için Telegram kanalımızı takip edin: @sofistikadam. Kuponunuzu /ayarlar sayfasından kullanabilirsiniz.',

    // Video Quality
    '4k': 'ADUKET tüm premium içerikleri 4K Ultra HD (2160p) kalitesinde sunar. Ücretsiz kullanıcılar 720p kalitede izleyebilir, premium üyeler ise 4K\'ya kadar erişebilir.',
    'kalite': 'Video kalitesi seçeneklerimiz: 720p (ücretsiz), 1080p Full HD (premium) ve 4K Ultra HD (premium). Video oynatıcıda kalite ayarını değiştirebilirsiniz.',
    'hd': 'HD ve Full HD kalitede izleme tüm kullanıcılar için mevcuttur. 4K Ultra HD ise sadece premium üyelere özeldir.',

    // Privacy & Security
    'güvenlik': 'ADUKET\'te tüm şifreler bcrypt ile hash\'lenir. SSL/TLS şifreleme kullanılır. Verileriniz hiçbir üçüncü tarafla paylaşılmaz. Detaylar için /gizlilik sayfasını ziyaret edin.',
    'gizlilik': 'Gizlilik politikamız hakkında detaylı bilgi için /gizlilik sayfasını ziyaret edin. Verileriniz tamamen korunur ve üçüncü taraflarla paylaşılmaz.',
    'veri': 'Kişisel verileriniz KVKK kapsamında korunmaktadır. Sadece teknik olarak zorunlu çerezler kullanılmaktadır. Detaylar: /gizlilik',

    // Rules
    'kural': 'Platform kurallarımız için /kurallar sayfasını ziyaret edin. 18 yaş sınırı, içerik kısıtlamaları ve telif hakkı kuralları geçerlidir.',
    'yasak': 'Yasa dışı içerik paylaşımı, nefret söylemi ve hesap paylaşımı kesinlikle yasaktır. Detaylı kurallar için /kurallar sayfasını ziyaret edin.',
    'yaş': 'ADUKET platformu 18 yaş ve üzeri bireyler içindir. Yaş doğrulaması siteye ilk girişte yapılmaktadır.',

    // Categories & Content
    'kategori': 'Platformumuzda Premium, Trendler, Yeni Eklenenler, Amatör, Sanal Gerçeklik ve Canlı Yayın Tekrarları gibi birçok kategori bulunmaktadır. /modeller sayfasından keşfedin.',
    'model': 'Tüm kategorileri ve içerik modellerini görmek için /modeller sayfasını ziyaret edin.',

    // Special Content Types
    'canlı': 'Canlı yayın tekrarları kategorisinde, kaçırdığınız yayınların HD kalitede kayıtlarını izleyebilirsiniz.',
    'live': 'Live Cams bölümünde canlı yayın tekrarlarını bulabilirsiniz. Canlı yayınlar sadece premium üyelere açıktır.',
    'vr': 'Sanal Gerçeklik (VR) kategorimizde 360° çekim içerikler bulunmaktadır. VR başlığınızla tam sürükleyici deneyim yaşayabilirsiniz.',
    'sanal': 'Sanal gerçeklik içerikleri için /modeller sayfasından "Sanal Gerçeklik" kategorisine göz atabilirsiniz.',

    // Technical
    'hata': 'Teknik bir sorunla mı karşılaştınız? Lütfen sayfayı yenileyip tekrar deneyin. Sorun devam ederse Telegram üzerinden bize ulaşın: @sofistikadam',
    'sorun': 'Bir sorunla karşılaştıysanız: 1) Sayfayı yenileyin 2) Tarayıcı önbelleğini temizleyin 3) Farklı bir tarayıcı deneyin. Hâlâ sorun varsa @sofistikadam üzerinden bize yazın.',
    'çalışmıyor': 'Video oynatma sorunu yaşıyorsanız: internet bağlantınızı kontrol edin, sayfayı yeniledikten sonra tekrar deneyin. Sorun devam ederse Telegram: @sofistikadam',
    'yavaş': 'Yavaş yükleme sorunu yaşıyorsanız internet bağlantınızı kontrol edin. Video kalitesini düşürmek de yükleme süresini kısaltabilir.',

    // Upload & Content
    'yükle': 'Video yüklemek için admin yetkisine sahip olmanız gerekmektedir. Admin iseniz navbar\'daki yükleme butonunu kullanabilirsiniz.',
    'indirme': 'Platform üzerindeki videoların indirilmesi telif hakları nedeniyle yasaktır. İçerikler yalnızca platform üzerinden izlenebilir.',
    'kaydetme': 'Videoları kaydetmek veya indirmek yasaktır. DRM korumasıyla içerikler güvende tutulmaktadır.',

    // Contact
    'iletişim': 'Bizimle Telegram üzerinden iletişime geçebilirsiniz: @sofistikadam. 7/24 destek sağlıyoruz.',
    'telegram': 'Telegram destek kanalımız: @sofistikadam. Sorularınız, geri bildirimleriniz ve destek talepleriniz için yazabilirsiniz.',
    'destek': 'Teknik destek ve genel sorular için Telegram kanalımızdan bize ulaşabilirsiniz: @sofistikadam',

    // About
    'hakkında': 'ADUKET, premium kalitede içerikleri tek bir çatı altında sunan öncü bir yayın platformudur. Detaylar için /hakkimizda sayfasını ziyaret edin.',
    'nedir': 'ADUKET, yetişkinler için kurumsal düzeyde güvenlik ve 4K kalitede premium içerik sunan bir video platformudur.',
};

function getFAQResponse(question: string): string | null {
    const q = question.toLowerCase().trim();
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
        if (q.includes(key) && !['abone', 'ücret', 'fiyat', 'premium', 'paket'].includes(key)) return response;
    }
    return null;
}

async function searchVideos(query: string): Promise<any[]> {
    try {
        const res = await fetch(api(`/videos/search?q=${encodeURIComponent(query)}`));
        if (res.ok) return await res.json();
    } catch { }
    return [];
}

async function fetchPackagesList(): Promise<string> {
    try {
        const res = await apiFetch('/packages');
        if (res.ok) {
            const pkgs = await res.json();
            if (pkgs.length === 0) return 'Şu an aktif bir abonelik paketi bulunmuyor.';

            let list = 'Şu anki güncel abonelik paketlerimiz:\n\n';
            pkgs.forEach((p: any) => {
                list += `• ${p.name}: ${p.price} (${p.duration})\n`;
                if (p.features && p.features.length) {
                    list += `  Özellikler: ${p.features.slice(0, 2).join(', ')}...\n`;
                }
            });
            list += '\nDetaylar için /abonelikler sayfasına göz atabilirsiniz.';
            return list;
        }
    } catch { }
    return 'Paket bilgilerine şu an ulaşılamıyor. Lütfen /abonelikler sayfasını ziyaret edin.';
}

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Merhaba! 👋 Ben ADUKET asistanıyım. Size nasıl yardımcı olabilirim? Bir video adı veya paket bilgisi sorabilirsiniz.' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        const query = input.trim();
        setInput('');
        setIsTyping(true);

        const lowerQ = query.toLowerCase();

        // 1. Check for dynamic packages
        if (lowerQ.includes('abone') || lowerQ.includes('ücret') || lowerQ.includes('fiyat') || lowerQ.includes('paket') || lowerQ.includes('premium')) {
            const packageInfo = await fetchPackagesList();
            setMessages(prev => [...prev, { role: 'assistant', content: packageInfo }]);
            setIsTyping(false);
            return;
        }

        // 2. Try static FAQ
        const faqResponse = getFAQResponse(query);
        if (faqResponse) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: faqResponse }]);
                setIsTyping(false);
            }, 400 + Math.random() * 400);
            return;
        }

        // 3. Search videos by name
        const videos = await searchVideos(query);

        setTimeout(() => {
            if (videos.length > 0) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `"${query}" ile eşleşen ${videos.length} video buldum:`,
                    videos
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Maalesef sorduğunuz soruya veya aradığınız video adına uygun bir sonuç bulamadım. Ancak abonelikler, kurallar ve gizlilik hakkında her sorunuzu yanıtlayabilirim.`
                }]);
            }
            setIsTyping(false);
        }, 400 + Math.random() * 400);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* Chat Panel */}
            <div className={`fixed bottom-24 right-6 z-[100] w-[380px] max-h-[520px] bg-card border border-border rounded-2xl shadow-2xl shadow-black/30 flex flex-col overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">ADUKET Asistan</h3>
                            <p className="text-white/60 text-xs">Video ara • Soru sor</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[340px]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-full bg-red-600/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-red-500" />
                                </div>
                            )}
                            <div className="max-w-[75%] space-y-2">
                                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-red-600 text-white rounded-br-md'
                                    : 'bg-secondary text-foreground rounded-bl-md'
                                    }`}>
                                    {msg.content}
                                </div>

                                {/* Video Results */}
                                {msg.videos && msg.videos.length > 0 && (
                                    <div className="space-y-1.5">
                                        {msg.videos.map(video => (
                                            <Link
                                                key={video.id}
                                                href={`/watch/${video.id}`}
                                                className="flex items-center gap-2 p-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600/20 transition-colors">
                                                    <Play className="w-4 h-4 text-red-500" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium truncate">{video.title}</p>
                                                    <p className="text-[10px] text-muted-foreground">{video.views} izlenme{video.isPremium ? ' • Premium' : ''}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-2 items-start">
                            <div className="w-7 h-7 rounded-full bg-red-600/10 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {messages.length <= 1 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                        {['Premium nedir?', 'Video kalitesi', 'Gizlilik', 'Kurallar', 'İletişim', 'Video ara'].map(q => (
                            <button
                                key={q}
                                onClick={() => { setInput(q); setTimeout(() => handleSend(), 50); }}
                                className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground/70 border border-border transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-border bg-background/50">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Video adı yaz veya soru sor..."
                            className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500/30 border border-border placeholder:text-muted-foreground"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-red-600 flex-shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen
                    ? 'bg-zinc-700 hover:bg-zinc-600 rotate-0'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600'
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                )}
            </button>
        </>
    );
}
