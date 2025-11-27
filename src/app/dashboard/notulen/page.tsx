import { AINotulenGenerator } from "@/components/dashboard/ai-notulen";

export default function NotulenPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-headline text-3xl md:text-4xl">
                AI Notulen
            </h1>
            <AINotulenGenerator />
        </div>
    )
}
