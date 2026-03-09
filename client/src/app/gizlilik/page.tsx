import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShieldCheck, Database, Lock, Cookie } from "lucide-react";

export const metadata = {
    title: "Gizlilik Politikası | ADUKET",
    description: "ADUKET gizlilik politikası ve veri güvenliği kuralları.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col items-center pt-28 px-4 sm:px-6 lg:px-8 pb-16 w-full">
                <div className="w-full max-w-4xl flex flex-col items-center">
                    <div className="text-center mb-10 w-full">
                        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight text-foreground">
                            Gizlilik Politikası
                        </h1>
                        <p className="text-base text-muted-foreground max-w-lg mx-auto font-medium">
                            Verilerinizin güvenliği bizim için en büyük önceliktir.
                        </p>
                    </div>

                    <div className="bg-card w-full border border-border rounded-2xl p-8 md:p-12 shadow-sm space-y-8">
                        <p className="text-base leading-relaxed text-foreground font-medium border-l-4 border-red-500 pl-5 py-2 bg-secondary/30 rounded-r-lg">
                            ADUKET olarak kişisel verilerinizin gizliliğine ve güvenliğine en üst düzeyde önem veriyoruz. Bu politika, sitemizi ziyaret ettiğinizde veya hizmetlerimizi kullandığınızda verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                        <Database className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-foreground">1. Toplanan Veriler</h2>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Kayıt aşamasında sadece gerekli olan (kullanıcı adı, e-posta) temel profil bilgilerinizi; ödeme yapıyorsanız ilgili işlem hash'lerinizi ve etkileşim istatistiklerinizi toplarız. Gereksiz hiçbir veri loglanmaz.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-foreground">2. Verilerin Kullanımı</h2>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Toplanan kısıtlı veriler, hesabınızı izinsiz erişimlere karşı korumak, size en iyi içerikleri önermek ve sistem sağlığını denetlemek amacıyla kullanılır.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-foreground">3. Veri Gizliliği</h2>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Şifreleriniz bcrypt mimarisiyle özel tuzlama teknikleri kullanılarak geri döndürülemez şekilde hash'lenir. Verileriniz reklam ajansları veya dış kurumlarla asla paylaşılmaz.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
                                        <Cookie className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-foreground">4. Çerez Politikası</h2>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Sadece platformun sorunsuz çalışması ve oturum yöntemlerinin sürdürülebilmesi için ultra minimal, 1. parti zorunlu teknik çerezler kullanmaktayız.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
