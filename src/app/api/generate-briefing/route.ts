import { aiBriefingForKetua, AIBriefingForKetuaInput } from '@/ai/flows/ai-briefing-for-ketua';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const input: AIBriefingForKetuaInput = await req.json();
    
    // Call the exported async function which wraps the flow
    const result = await aiBriefingForKetua(input);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("SERVER ERROR in /api/generate-briefing:", error); 
    return NextResponse.json(
        { success: false, error: error.message || 'Internal Server Error' },
        { status: 500 }
    );
  }
}
