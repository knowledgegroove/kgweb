import fs from 'fs';
import path from 'path';

const STORAGE_PATH = path.join(process.cwd(), 'src/data/analytics_logs.json');

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

export function getAnalytics() {
    try {
        if (!fs.existsSync(STORAGE_PATH)) {
            return [];
        }
        const data = fs.readFileSync(STORAGE_PATH, 'utf8');
        return JSON.parse(data) as AnalyticsEntry[];
    } catch (error) {
        console.error('Failed to read analytics:', error);
        return [];
    }
}

export function saveAnalytics(entry: AnalyticsEntry) {
    try {
        const logs = getAnalytics();
        logs.push(entry);

        // Ensure directory exists
        const dir = path.dirname(STORAGE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(STORAGE_PATH, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Failed to save analytics:', error);
    }
}

export function getAnalyticsSummary() {
    const logs = getAnalytics();

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

    // Generate time series data
    const last7Days: Record<string, { date: string, visitors: number, views: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        last7Days[dateStr] = { date: dateStr, visitors: 0, views: 0 };
    }

    const uniquePerDay: Record<string, Set<string>> = {};
    logs.forEach(l => {
        const dateStr = new Date(l.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (last7Days[dateStr]) {
            if (!uniquePerDay[dateStr]) uniquePerDay[dateStr] = new Set();
            uniquePerDay[dateStr].add(l.visitorId);
            last7Days[dateStr].views++;
        }
    });

    Object.keys(last7Days).forEach(date => {
        last7Days[date].visitors = uniquePerDay[date]?.size || 0;
    });

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
        repeatingRatio: totalVisits > 0 ? ((totalVisits - uniqueVisitors) / totalVisits * 100).toFixed(1) : 0,
        pageViews: Object.entries(pageViews).sort((a, b) => b[1] - a[1]),
        visitorHistory: Object.values(last7Days),
        recentLogs: logs.slice(-15).reverse(),
        rawLogs: logs // For CSV export
    };
}
