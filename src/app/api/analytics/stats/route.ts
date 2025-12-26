import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/utils/analyticsStore';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const range = (searchParams.get('range') || '7d') as '7d' | '30d' | 'all';
        const summary = await getAnalyticsSummary(range);
        return NextResponse.json(summary);
    } catch (error) {
        console.error('[Stats API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
