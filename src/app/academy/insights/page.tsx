'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './insights.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Download, FileText, Share2, Layers, Users, Activity, BarChart3, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AnalyticsSummary {
    totalVisits: number;
    uniqueVisitors: number;
    repeatingVisitors: number;
    avgVisitsPerUser: number | string;
    repeatingRatio: string | number;
    alumniContributions: number;
    pageViews: [string, number][];
    visitorHistory: { date: string, visitors: number, views: number }[];
    recentLogs: any[];
    rawLogs: any[];
}

export default function AnalyticsInsights() {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d');
    const [showAllPulse, setShowAllPulse] = useState(false);
    const dashboardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchAnalytics = async (selectedRange: string) => {
        try {
            const res = await fetch(`/api/analytics/stats?range=${selectedRange}`);
            const data = await res.json();
            setSummary(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics(range);
    }, [range]);

    const exportToPDF = async () => {
        if (!dashboardRef.current) return;
        const canvas = await html2canvas(dashboardRef.current, {
            backgroundColor: '#f8fafc',
            scale: 2
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`KG-Insights-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const exportToCSV = () => {
        if (!summary) return;
        const headers = ['VisitorID', 'Path', 'IsUnique', 'VisitCount', 'Timestamp', 'Language'];
        const rows = summary.rawLogs.map(log => [
            log.visitorId,
            log.path,
            log.isUnique,
            log.visitCount,
            log.timestamp,
            log.language
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `KG-Analytics-Data.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Decoding engagement signals...</div>
            </div>
        );
    }

    if (!summary) return null;

    const visibleLogs = showAllPulse ? summary.recentLogs : summary.recentLogs.slice(0, 5);

    return (
        <main className={styles.container} ref={dashboardRef} data-theme="light">
            <motion.div
                className={styles.header}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1>Site Insights</h1>
                    <p>High-fidelity tracking of the Knowledge Groove student ecosystem.</p>
                </div>
                <div className={styles.actionRow}>
                    <button className={styles.actionBtn} onClick={exportToPDF}>
                        <FileText size={18} />
                        PDF Report
                    </button>
                    <button className={styles.actionBtn} onClick={exportToCSV}>
                        <Share2 size={18} />
                        CSV Export
                    </button>
                </div>
            </motion.div>

            <div className={styles.statsGrid}>
                <motion.div className={styles.statCard} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#6366f1" />
                        <span className={styles.statLabel}>Unique Students</span>
                    </div>
                    <span className={styles.statValue}>{summary.uniqueVisitors}</span>
                </motion.div>
                <motion.div className={styles.statCard} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={16} color="#6366f1" />
                        <span className={styles.statLabel}>Total Page Views</span>
                    </div>
                    <span className={styles.statValue}>{summary.totalVisits}</span>
                </motion.div>
                <motion.div className={styles.statCard} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={16} color="#6366f1" />
                        <span className={styles.statLabel}>Avg Duration</span>
                    </div>
                    <span className={styles.statValue}>{summary.avgVisitsPerUser}</span>
                </motion.div>
                <motion.div className={styles.statCard} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={16} color="#6366f1" />
                        <span className={styles.statLabel}>Retention</span>
                    </div>
                    <span className={styles.statValue}>{summary.repeatingRatio}%</span>
                </motion.div>
                <motion.div className={styles.statCard} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GraduationCap size={16} color="#6366f1" />
                        <span className={styles.statLabel}>Alumni Tips</span>
                    </div>
                    <span className={styles.statValue}>{summary.alumniContributions}</span>
                </motion.div>
            </div>

            <motion.section
                className={styles.chartSection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ margin: 0 }}>Engagement History</h2>
                    <div className={styles.rangeSelector}>
                        {(['7d', '30d', 'all'] as const).map((r) => (
                            <button
                                key={r}
                                className={`${styles.rangeBtn} ${range === r ? styles.rangeBtnActive : ''}`}
                                onClick={() => setRange(r)}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.chartContainer}>
                    {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={summary.visitorHistory || []}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="rgba(0,0,0,0.6)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="rgba(0,0,0,0.6)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #4f46e5',
                                        borderRadius: '12px',
                                        color: '#0f172a'
                                    }}
                                    itemStyle={{ color: '#0f172a' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visitors"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVisits)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </motion.section>

            <div className={styles.contentGrid}>
                <section className={styles.section}>
                    <h2>Popular Destinations</h2>
                    <div className={styles.pageList}>
                        {summary.pageViews?.map(([path, count]) => (
                            <div key={path} className={styles.pageItem}>
                                <span className={styles.pagePath}>{path}</span>
                                <div className={styles.pageBarContainer}>
                                    <motion.div
                                        className={styles.pageBar}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(count / summary.totalVisits) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                                <span className={styles.pageCount}>{count}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Real-time Pulse</h2>
                    <div className={styles.logList}>
                        <AnimatePresence mode="popLayout">
                            {mounted && visibleLogs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    className={styles.logItem}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <span className={styles.logTag}>{log.isUnique ? 'NEW' : 'RETURN'}</span>
                                    <span className={styles.logInfo}>
                                        Student entered <strong>{log.path}</strong>
                                    </span>
                                    <span className={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {summary.recentLogs.length > 5 && (
                            <button
                                className={styles.showMoreBtn}
                                onClick={() => setShowAllPulse(!showAllPulse)}
                            >
                                {showAllPulse ? (
                                    <>Collapse <ChevronUp size={16} style={{ verticalAlign: 'middle', marginLeft: '4px' }} /></>
                                ) : (
                                    <>Show {summary.recentLogs.length - 5} More Signals <ChevronDown size={16} style={{ verticalAlign: 'middle', marginLeft: '4px' }} /></>
                                )}
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
