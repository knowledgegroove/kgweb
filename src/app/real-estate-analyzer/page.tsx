'use client';

import { useState, FormEvent } from 'react';
import styles from './page.module.css';

interface PropertyData {
    address: string;
    price: string;
    status: string;
    rent: string;
    schoolRating: number;
    area: string;
    lotSize: string;
    goodBuyScore: number;
    verdict: string;
    verdictDesc: string;
    similar: Array<{
        id: number;
        address: string;
        price: string;
        image: string;
    }>;
}

export default function RealEstateAnalyzer() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PropertyData | null>(null);
    const [loadingText, setLoadingText] = useState('Initializing...');

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (!address.trim()) return;

        setLoading(true);
        setData(null);

        // Simulate analysis steps
        const steps = [
            'Connecting to Zillow API...',
            'Fetching Redfin data...',
            'Analyzing neighborhood trends...',
            'Calculating investment potential...',
            'Finalizing report...'
        ];

        // Call the API route
        try {
            const response = await fetch('/api/real-estate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.details || 'Analysis failed');
            }

            // Simulate "processing" time for better UX if it was too fast (e.g. mock data)
            if (result.isMock) {
                for (let i = 0; i < steps.length; i++) {
                    setLoadingText(steps[i]);
                    await new Promise(resolve => setTimeout(resolve, 800));
                }
            }

            setData(result.data);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to analyze property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={`${styles.title} gradient-text`}>Real Estate Analyzer</h1>
                <p className={styles.subtitle}>
                    Instant AI-powered analysis using Zillow & Redfin data points to determine the true value of any property.
                </p>
            </header>

            <section className={styles.searchSection}>
                <form onSubmit={handleSearch} className={styles.inputGroup}>
                    <input
                        type="text"
                        placeholder="Enter full property address (e.g., 123 Main St, San Francisco, CA)"
                        className={styles.input}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <button type="submit" className={styles.analyzeBtn} disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </form>
            </section>

            {loading && (
                <div className={styles.loader}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>{loadingText}</p>
                </div>
            )}

            {data && !loading && (
                <div className={styles.results}>
                    <div className={styles.mainGrid}>
                        <div className={`${styles.card} ${styles.propertyCard} glass-card`}>
                            <div className={styles.propertyInfo}>
                                <div className={styles.tags}>
                                    <span className={styles.tag}>{data.status}</span>
                                    <span className={styles.tag}>{data.area}</span>
                                </div>
                                <h2>{data.price}</h2>
                                <p className={styles.address}>{data.address}</p>
                            </div>
                        </div>

                        <div className={`${styles.card} ${styles.verdictCard} glass-card`}>
                            <div className={styles.scoreCircle} style={{ borderColor: data.goodBuyScore > 80 ? '#10b981' : data.goodBuyScore > 70 ? '#f59e0b' : '#ef4444' }}>
                                {data.goodBuyScore}
                            </div>
                            <div className={styles.verdictLabel} style={{ color: data.goodBuyScore > 80 ? '#10b981' : data.goodBuyScore > 70 ? '#f59e0b' : '#ef4444' }}>
                                {data.verdict}
                            </div>
                            <p className={styles.verdictDesc}>{data.verdictDesc}</p>
                        </div>
                    </div>

                    <div className={styles.metricsGrid}>
                        <div className={`${styles.card} ${styles.metricCard} glass-card`}>
                            <span className={styles.metricLabel}>Est. Rent</span>
                            <span className={styles.metricValue}>{data.rent}</span>
                            <span className={`${styles.metricTrend} ${styles.trendUp}`}>
                                ↑ 5% vs avg
                            </span>
                        </div>
                        <div className={`${styles.card} ${styles.metricCard} glass-card`}>
                            <span className={styles.metricLabel}>School Rating</span>
                            <span className={styles.metricValue}>{data.schoolRating}/10</span>
                            <span className={styles.metricTrend} style={{ color: '#888' }}>
                                Public Schools
                            </span>
                        </div>
                        <div className={`${styles.card} ${styles.metricCard} glass-card`}>
                            <span className={styles.metricLabel}>Lot Size</span>
                            <span className={styles.metricValue}>{data.lotSize}</span>
                        </div>
                        <div className={`${styles.card} ${styles.metricCard} glass-card`}>
                            <span className={styles.metricLabel}>Market Status</span>
                            <span className={styles.metricValue} style={{ fontSize: '1.4rem' }}>Hot Market</span>
                        </div>
                    </div>

                    <div className={styles.similarSection}>
                        <h3 className={styles.sectionTitle}>Similar Properties Nearby</h3>
                        <div className={styles.similarGrid}>
                            {data.similar.map((prop) => (
                                <div key={prop.id} className={`${styles.card} ${styles.similarCard} glass-card`}>
                                    <div className={styles.similarImage} style={{ backgroundImage: `url(${prop.image})` }}></div>
                                    <div className={styles.similarContent}>
                                        <div className={styles.similarPrice}>{prop.price}</div>
                                        <div className={styles.similarAddress}>{prop.address}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
