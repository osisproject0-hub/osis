import { aiBriefingForKetua } from '@/ai/flows/ai-briefing-for-ketua';
import { NextResponse } from 'next/server';
import { AIBriefingForKetuaInput } from '@/ai/flows/ai-briefing-for-ketua';

export async function POST(req: Request) {
  try {
    const input: AIBriefingForKetuaInput = await req.json();
    const result = await aiBriefingForKetua(input);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in /api/generate-briefing:', error);
    return NextResponse.json(
        { success: false, error: error.message || 'Failed to generate briefing.' },
        { status: 500 }
    );
  }
}
