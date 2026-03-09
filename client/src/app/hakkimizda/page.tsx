import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Info, Target, Rocket } from "lucide-react";

export const metadata = {
    title: "Hakkımızda | ADUKET",
    description: "ADUKET platformu hakkında genel bilgiler.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col items-center pt-28 px-4 sm:px-6 lg:px-8 pb-16 w-full">
                <div className="w-full max-w-4xl flex flex-col items-center">
                    <div className="text-center mb-10 w-full">
                        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                            <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">Hakkımızda</span>
                        </h1>
                        <p className="text-base text-muted-foreground max-w-lg mx-auto font-medium">
                            Dijital eğlence standartlarını yeniden tanımlıyoruz.
                        </p>
                    </div>

                    <div className="bg-card w-full border border-border rounded-2xl p-8 md:p-12 shadow-sm space-y-10">

                        <div className="flex flex-col md:flex-row gap-5 items-start">
                            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                                <Info className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-foreground">ADUKET Nedir?</h2>
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    ADUKET, premium kalitede ve dünyanın dört bir yanından derlenmiş zengin içerikleri tek bir çatı altında sunan öncü bir yayın platformudur. Kullanıcı dostu arayüzümüz, sıfır gecikmeli video altyapımız (4K Ultra HD) ve güvenli ortamımızla kesintisiz bir izleme deneyimi vadediyoruz.
                                </p>
                            </div>
                        </div>

                        <hr className="border-border" />

                        <div className="flex flex-col md:flex-row gap-5 items-start">
                            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                                <Target className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-foreground">Misyonumuz</h2>
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    İzleyicilerimize en yüksek görüntü kalitesiyle, izlenebilirliği yüksek, kurumsal güvence altında, erişilebilir ve yenilikçi bir platform sunarak Türkiye'de ve dünyada dijital eğlence standartlarını en üst noktaya taşımak.
                                </p>
                            </div>
                        </div>

                        <hr className="border-border" />

                        <div className="flex flex-col md:flex-row gap-5 items-start">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                                <Rocket className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-foreground">Vizyonumuz</h2>
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    Sektördeki web ve video aktarım teknolojilerine öncülük eden, kullanıcı mahremiyetini ve güvenliğini temel ilke edinen, sadece içerik sunan değil, global çapta referans alınan dev bir premium içerik ekosistemi inşa etmek.
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
