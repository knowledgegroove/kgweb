'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTutor } from '@/context/TutorContext';
import styles from './Navbar.module.css';

export default function AcademyNavbar() {
    const { openTutor, isOpen } = useTutor();
    const pathname = usePathname();
    const isCoursePage = pathname.includes('/courses/');

    return (
        <nav className={styles.nav} style={{ right: isOpen ? '33.333vw' : '0' }}>
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
                    {!isCoursePage && <Link href="/academy#courses">Courses</Link>}
                    <button
                        className={styles.aiBtn}
                        onClick={() => openTutor()}
                    >
                        ✨ Ask AI Tutor
                    </button>
                </div>
            </div>
        </nav>
    );
}
