import { aiBriefingForKetuaFlow, AIBriefingForKetuaInput } from '@/ai/flows/ai-briefing-for-ketua';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const input: AIBriefingForKetuaInput = await req.json();
    
    // Panggil flow secara langsung sebagai fungsi async
    const result = await aiBriefingForKetuaFlow(input);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("SERVER ERROR in /api/generate-briefing:", error); // <-- Ini akan muncul di terminal
    return NextResponse.json(
        { success: false, error: error.message || 'Internal Server Error' },
        { status: 500 }
    );
  }
}
