import { NextResponse } from 'next/server';
import { saveAnalytics } from '@/utils/analyticsStore';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // 1. Log to server console (Visual for dev)
        console.log('\n----------------------------------------');
        console.log(`🚀 [Analytics] ${data.isUnique ? 'NEW' : 'RETURNING'} Visit`);
        console.log(`📍 Path: ${data.path}`);
        console.log(`👤 ID: ${data.visitorId}`);
        console.log(`🔢 Count: ${data.visitCount}`);
        console.log(`⏰ Time: ${data.timestamp}`);
        console.log('----------------------------------------\n');

        // 2. Persist to local "database" file
        saveAnalytics(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Analytics API] Error:', error);
        return NextResponse.json({ error: 'Failed to log visit' }, { status: 500 });
    }
}
