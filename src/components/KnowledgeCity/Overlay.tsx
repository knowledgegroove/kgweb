'use client';

import { Scroll } from '@react-three/drei';

export default function Overlay() {
    return (
        <Scroll html style={{ width: '100%' }}>
            {/* Intro Section */}
            <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <h1 style={{ fontSize: '5rem', fontWeight: '800', textShadow: '0 0 20px rgba(79, 70, 229, 0.8)' }}>
                        Welcome to Knowledge Groove
                    </h1>
                    <p style={{ fontSize: '1.5rem', opacity: 0.8 }}>Where Ideas Grow</p>
                    <div style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.5 }}>SCROLL TO EXPLORE</div>
                </div>
            </section>

            {/* Podcast Section */}
            <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '10vw', pointerEvents: 'none' }}>
                <div style={{ maxWidth: '400px', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '2rem', borderRadius: '1rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                    <h2 style={{ fontSize: '2.5rem', color: '#a855f7', marginBottom: '1rem' }}>The Knowledge Groove Podcast</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        Stories of history, science, business, and innovation.
                    </p>
                    <a href="https://open.spotify.com/show/5GgvbJT6WznJCmIX6OeEGy?si=ce9e5a1dd07245bb" target="_blank" rel="noopener noreferrer" style={{ pointerEvents: 'auto', color: '#a855f7', fontWeight: 'bold', textDecoration: 'none' }}>Listen to Podcast →</a>
                </div>
            </section>

            {/* FinTech Section */}
            <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10vw', pointerEvents: 'none' }}>
                <div style={{ maxWidth: '400px', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '2rem', borderRadius: '1rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 196, 255, 0.3)' }}>
                    <h2 style={{ fontSize: '2.5rem', color: '#00C4FF', marginBottom: '1rem' }}>Knowledge Groove AI + FinTech Lab</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        AI tools, predictive models, cybersecurity, and data analysis.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a href="/stock-market-analyzer" style={{ pointerEvents: 'auto', color: '#00C4FF', fontWeight: 'bold', textDecoration: 'none' }}>Try Stock Analyzer →</a>
                        <a href="/real-estate-analyzer" style={{ pointerEvents: 'auto', color: '#00C4FF', fontWeight: 'bold', textDecoration: 'none' }}>Try Real Estate Analyzer →</a>
                    </div>
                </div>
            </section>

            {/* Academy Section */}
            <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '10vw', pointerEvents: 'none' }}>
                <div style={{ maxWidth: '400px', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '2rem', borderRadius: '1rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                    <h2 style={{ fontSize: '2.5rem', color: '#ec4899', marginBottom: '1rem' }}>Knowledge Groove Academy</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        Workshops, tutoring, and confidence building.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a href="/academy" style={{ pointerEvents: 'auto', color: '#ec4899', fontWeight: 'bold', textDecoration: 'none' }}>Visit the Academy →</a>
                        <a href="/workshops" style={{ pointerEvents: 'auto', color: '#ec4899', fontWeight: 'bold', textDecoration: 'none' }}>Visit Workshop Center →</a>
                    </div>
                </div>
            </section>

            {/* Creator Section */}
            <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ textAlign: 'center', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '3rem', borderRadius: '1rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>I&apos;m Ishaan Garg.</h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>
                        I help people learn, create, and innovate.
                    </p>
                    <a href="/info" style={{ pointerEvents: 'auto', display: 'inline-block', padding: '1rem 2rem', background: 'white', color: 'black', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none' }}>Learn more →</a>
                </div>
            </section>
        </Scroll>
    );
}
