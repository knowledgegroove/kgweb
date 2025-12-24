'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTutor } from '@/context/TutorContext';
import { useTheme } from '@/context/ThemeContext';
import styles from './Navbar.module.css';

export default function AcademyNavbar() {
    const { openTutor, isOpen } = useTutor();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const isCoursePage = pathname.includes('/courses/');
    const isLandingPage = pathname === '/academy';
    const courseSlug = isCoursePage ? pathname.split('/').pop() : undefined;

    const SunIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M4.93 19.07l1.41-1.41" /><path d="M17.66 6.34l1.41-1.41" /></svg>
    );

    const MoonIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
    );

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <Link href="/academy" className={styles.logo}>
                        KNOWLEDGE <span>GROOVE</span>
                    </Link>
                    {isCoursePage && (
                        <Link href="/academy" className={styles.breadcrumb}>
                            / ACADEMY
                        </Link>
                    )}
                </div>

                <div className={styles.links}>
                    {!isCoursePage && (
                        <>
                            <Link href="/academy/about">About Us</Link>
                            <Link href="/academy#courses">Courses</Link>
                        </>
                    )}
                    {!isLandingPage && (
                        <button className={styles.themeBtn} onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>
                    )}
                    <button
                        className={styles.aiBtn}
                        onClick={() => openTutor(courseSlug)}
                    >
                        ✨ Ask AI Tutor
                    </button>
                </div>
            </div>
        </nav>
    );
}
