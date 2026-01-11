'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '4.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 4rem',
                zIndex: 1000,
                transition: 'all 0.3s ease',
                background: scrolled ? 'rgba(3, 0, 20, 0.8)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
        >
            <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #4f46e5, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em'
                }}>
                    KNOWLEDGE GROOVE
                </span>
            </Link>

            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                <NavLink href="/academy">Academy</NavLink>
                <NavLink href="/stock-market-analyzer">Markets</NavLink>
                <NavLink href="/real-estate-analyzer">Real Estate</NavLink>
                <NavLink href="/workshops">Workshops</NavLink>
                <Link href="/academy/tutor" className="btn" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
                    AI Mentor
                </Link>
            </div>
        </motion.nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                opacity: 0.8,
                transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
        >
            {children}
        </Link>
    );
}
