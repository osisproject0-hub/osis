'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VisiMisiPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <h1 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                    Visi & Misi
                </h1>
                <p className="text-xl text-primary font-semibold">
                    "Mewujudkan OSIS sebagai wadah aspirasi siswa yang aktif, kreatif, dan berakhlak mulia."
                </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-in fade-in-50 slide-in-from-bottom-5 duration-700">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader><CardTitle>Aktif</CardTitle></CardHeader>
                    <CardContent><p>Mendorong partisipasi aktif siswa dalam setiap kegiatan sekolah, menciptakan lingkungan yang dinamis dan inklusif bagi semua.</p></CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader><CardTitle>Kreatif</CardTitle></CardHeader>
                    <CardContent><p>Menyelenggarakan program dan acara yang inovatif, inspiratif, dan mampu mengembangkan potensi serta kreativitas siswa.</p></CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader><CardTitle>Berakhlak Mulia</CardTitle></CardHeader>
                    <CardContent><p>Menjunjung tinggi nilai-nilai moral, etika, dan spiritual dalam setiap tindakan dan kegiatan yang diselenggarakan oleh OSIS.</p></CardContent>
                </Card>
            </div>
        </div>
    );
}
