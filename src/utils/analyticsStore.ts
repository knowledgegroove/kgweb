import { supabase } from './supabaseClient';

export interface AnalyticsEntry {
    visitorId: string;
    path: string;
    isUnique: boolean;
    isRepeating: boolean;
    visitCount: number;
    timestamp: string;
    userAgent: string;
    language: string;
}

export async function getAnalytics() {
    try {
        const { data, error } = await supabase
            .from('analytics')
            .select('*')
            .order('timestamp', { ascending: true });

        if (error) throw error;

        return (data || []).map(row => ({
            visitorId: row.visitor_id,
            path: row.path,
            isUnique: row.is_unique,
            isRepeating: row.is_repeating,
            visitCount: row.visit_count,
            timestamp: row.timestamp,
            userAgent: row.user_agent,
            language: row.language
        })) as AnalyticsEntry[];
    } catch (error) {
        console.error('Failed to fetch analytics from Supabase:', error);
        return [];
    }
}

export async function saveAnalytics(entry: AnalyticsEntry) {
    try {
        const { error } = await supabase
            .from('analytics')
            .insert([{
                visitor_id: entry.visitorId,
                path: entry.path,
                is_unique: entry.isUnique,
                is_repeating: entry.isRepeating,
                visit_count: entry.visitCount,
                timestamp: entry.timestamp,
                user_agent: entry.userAgent,
                language: entry.language
            }]);

        if (error) throw error;
    } catch (error) {
        console.error('Failed to save analytics to Supabase:', error);
    }
}

export async function getAnalyticsSummary(range: '7d' | '30d' | 'all' = '7d') {
    const logs = await getAnalytics();

    // Filter logs based on range for the graph
    const now = new Date();
    let daysToTrack = 7;
    if (range === '30d') daysToTrack = 30;
    if (range === 'all') {
        const earliest = logs.length > 0 ? new Date(logs[0].timestamp) : now;
        daysToTrack = Math.ceil((now.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    const history: Record<string, { date: string, visitors: number, views: number }> = {};
    for (let i = daysToTrack - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        history[dateStr] = { date: dateStr, visitors: 0, views: 0 };
    }

    const uniquePerDay: Record<string, Set<string>> = {};
    logs.forEach(l => {
        const dateStr = new Date(l.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (history[dateStr]) {
            if (!uniquePerDay[dateStr]) uniquePerDay[dateStr] = new Set();
            uniquePerDay[dateStr].add(l.visitorId);
            history[dateStr].views++;
        }
    });

    Object.keys(history).forEach(date => {
        history[date].visitors = uniquePerDay[date]?.size || 0;
    });

    const uniqueIds = Array.from(new Set(logs.map(l => l.visitorId)));
    const totalVisits = logs.length;
    const uniqueVisitors = uniqueIds.length;

    // User retention breakdown
    const userVisitMap: Record<string, number> = {};
    logs.forEach(l => {
        userVisitMap[l.visitorId] = Math.max(userVisitMap[l.visitorId] || 0, l.visitCount);
    });

    const repeatingVisitors = Object.values(userVisitMap).filter(count => count > 1).length;
    const avgVisitsPerUser = uniqueVisitors > 0 ? (totalVisits / uniqueVisitors).toFixed(1) : 0;

    // Page popularity
    const pageViews: Record<string, number> = {};
    logs.forEach(l => {
        pageViews[l.path] = (pageViews[l.path] || 0) + 1;
    });

    return {
        totalVisits,
        uniqueVisitors,
        repeatingVisitors,
        avgVisitsPerUser,
        alumniContributions: 12, // Placeholder: In production, sync this from an alumni table
        repeatingRatio: totalVisits > 0 ? ((totalVisits - uniqueVisitors) / totalVisits * 100).toFixed(1) : 0,
        pageViews: Object.entries(pageViews).sort((a, b) => b[1] - a[1]),
        visitorHistory: Object.values(history),
        recentLogs: logs.slice().reverse(), // Send all logs, client will slice
        rawLogs: logs // For CSV export
    };
}
