import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AlertTriangle, Copyright, Users, Info, Scale } from "lucide-react";

export const metadata = {
    title: "Kurallar ve Şartlar | ADUKET",
    description: "ADUKET kullanım koşulları, kurallar ve şartlar.",
};

export default function RulesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <main className="flex-1 pt-28 px-4 sm:px-6 lg:px-8 pb-16 max-w-4xl mx-auto w-full">

                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                        Kurallar ve Şartlar
                    </h1>
                    <p className="text-base text-muted-foreground font-medium max-w-xl">
                        Platformun bütünlüğünü ve kullanıcı deneyimini koruyan resmi politikalarımız.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm space-y-8">
                    <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/15 rounded-xl">
                        <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm leading-relaxed text-amber-600 dark:text-amber-300 font-medium">
                            Lütfen ADUKET hizmetlerini kullanmadan önce aşağıdaki kuralları dikkatlice okuyun. Platformumuzu kullandığınız saniyeden itibaren bu şartları hukuken kabul etmiş sayılırsınız.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold mb-2 text-foreground">1. Yaş Sınırı Mükellefiyeti</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    ADUKET'te yer alan içerikleri görüntüleyebilmek veya platforma kaydolabilmek için bulunduğunuz ülkenin yasalarına göre reşit (çoğu bölgede 18 yaş veya üzeri) olmanız gerekmektedir. Reşit olmayan kullanıcıların platforma erişimi kesinlikle yasaktır.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
                                <Scale className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold mb-2 text-foreground">2. İçerik Kısıtlamaları</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Kullanıcılar platform içerisinde yasa dışı materyaller, nefret söylemi, ırkçılık barındıran veya linkleyen paylaşımlar yapamaz. Yasadışı içerik talepleri sistem tarafından engellenir ve ip adresleri yetkililere bildirilir.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                                <Copyright className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold mb-2 text-foreground">3. Telif Hakkı ve İçerik Koruması (DRM)</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Platformdaki tüm PREMIUM videolar ve özel koleksiyonlar, içerik oluşturucularının lisans haklarına tabidir. Sunucularımızdan videoları bot veya harici araçlarla kopyalamak suçtur.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold mb-2 text-foreground">4. Hesap Paylaşımı ve Çoklu Cihaz Politikası</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Premium abonelikler tek bir bireysel kullanıcının cihazları için tasarlanmıştır. Hesap bilgilerini üçüncü şahıslarla ortak kullanıma açmak sözleşme ihlalidir.
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
