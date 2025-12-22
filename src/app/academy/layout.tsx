'use client';

import { TutorProvider, useTutor } from '@/context/TutorContext';
import TutorSidebar from '@/components/Academy/TutorSidebar';
import AcademyNavbar from '@/components/Academy/Navbar';
import styles from './layout.module.css';

function AcademyContent({ children }: { children: React.ReactNode }) {
    const { isOpen } = useTutor();

    return (
        <div className={`${styles.mainWrapper} ${isOpen ? styles.tutorOpen : ''}`}>
            <AcademyNavbar />
            <div className={styles.contentArea}>
                {children}
            </div>
        </div>
    );
}

export default function AcademyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TutorProvider>
            <AcademyContent>
                {children}
            </AcademyContent>
            <TutorSidebar />
        </TutorProvider>
    );
}
