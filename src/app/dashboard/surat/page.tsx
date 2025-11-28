import { AIOfficialLetterGenerator } from "@/components/dashboard/ai-official-letter-generator";

export default function SuratResmiPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-headline text-3xl md:text-4xl">
                AI Generator Surat Resmi
            </h1>
            <AIOfficialLetterGenerator />
        </div>
    )
}
