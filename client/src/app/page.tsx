import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, Shield, Zap, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 overflow-hidden pt-16">
      {/* Top Announcement Banner */}
      <div className="absolute top-0 left-0 w-full z-50 bg-gradient-to-r from-red-600/80 via-red-500/80 to-amber-600/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex flex-row items-center justify-center gap-2 sm:gap-3 shadow-[0_4px_30px_rgba(220,38,38,0.2)]">
        <Sparkles className="w-5 h-5 text-amber-200 animate-pulse shrink-0 hidden sm:block" />
        <p className="text-sm md:text-base text-white font-medium text-center drop-shadow-sm leading-tight flex-1 sm:flex-none">
          <span className="font-bold text-amber-200">Büyük Fırsat:</span> İlk aya özel Premium üyelik tamamen <span className="underline decoration-2 underline-offset-2 decoration-amber-300">Ücretsiz!</span>
        </p>
        <Link href="/register" className="shrink-0">
          <Button size="sm" className="bg-white text-red-600 hover:bg-red-50 font-bold border-none rounded-full h-8 px-4 sm:px-5 text-[11px] sm:text-xs shadow-[0_2px_10px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95">
            Hemen Al
          </Button>
        </Link>
      </div>

      {/* Background Hero Banner */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30 z-10" />
        <div className="absolute inset-0 bg-background/40 z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop"
          alt="Premium Content Banner"
          className="w-full h-full object-cover opacity-50 block"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="relative z-20 text-center space-y-6 max-w-xl flex flex-col items-center mt-10">
        {/* CSS-only, lightweight announcement banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-100 text-sm font-medium border border-red-500/30 shadow-sm mb-2 backdrop-blur-md transition-transform hover:scale-105">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 dark:bg-red-500"></span>
          </span>
          Yeni Premium İçerikler Eklendi! Hemen Keşfet
        </div>

        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter bg-gradient-to-br from-red-600 via-red-500 to-amber-500 dark:from-red-500 dark:via-red-600 dark:to-amber-600 bg-clip-text text-transparent w-full drop-shadow-xl">
          ADUKET
        </h1>
        <p className="text-xl sm:text-2xl text-foreground font-medium drop-shadow-md">
          Yetişkinler İçin Premium İçerik Platformu
        </p>
        <p className="text-sm text-muted-foreground max-w-md pb-4 font-medium drop-shadow-sm">
          Sınırları kaldıran reklamsız izleme deneyimini hemen keşfetmeye başlayın.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 rounded-xl font-bold h-14 bg-background/50 dark:bg-background/20 backdrop-blur-md border-border/50 text-foreground dark:text-white hover:bg-background/80 dark:hover:bg-background/40 transition-all text-base">
              Giriş Yap
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-bold h-14 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all text-base border border-red-500/50 hover:scale-105">
              Kayıt Ol
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative z-20 grid grid-cols-1 sm:grid-cols-3 gap-5 mt-20 max-w-4xl w-full pb-10">
        {[
          { icon: Play, title: '4K Ultra HD', desc: 'En yüksek kalitede kesintisiz ve net izleme deneyimi' },
          { icon: Shield, title: '%100 Gizlilik', desc: 'Verileriniz endüstri standartlarında tamamen korunur' },
          { icon: Zap, title: 'Hızlı Erişim', desc: 'Sıfır gecikme, premium sunucularla anında yükleme' },
        ].map((f) => (
          <div key={f.title} className="text-center p-6 rounded-2xl bg-card/60 dark:bg-secondary/30 backdrop-blur-xl border border-border/60 shadow-xl hover:bg-card/80 dark:hover:bg-secondary/40 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 group-hover:scale-110 transition-transform">
              <f.icon className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="font-bold text-base mb-2 text-foreground dark:text-white">{f.title}</h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400 font-medium">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
