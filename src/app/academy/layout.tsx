'use client';

import { TutorProvider, useTutor } from '@/context/TutorContext';
import TutorSidebar from '@/components/Academy/TutorSidebar';
import AcademyNavbar from '@/components/Academy/Navbar';
import styles from './layout.module.css';
import { ExperienceProvider, useExperience } from '@/context/ExperienceContext';
import ShareExperienceModal from '@/components/Academy/ShareExperienceModal';
import { AlumniProvider } from '@/context/AlumniContext';
import { ThemeProvider } from '@/context/ThemeContext';

function AcademyContent({ children }: { children: React.ReactNode }) {
    const { isOpen, isFullScreen } = useTutor();
    const { isModalOpen, closeModal } = useExperience();

    return (
        <div className={`${styles.mainWrapper} ${isOpen ? styles.tutorOpen : ''} ${isFullScreen ? styles.fullScreenActive : ''}`}>
            <AcademyNavbar />
            <div className={styles.scalingLayer}>
                <div className={styles.contentArea}>
                    {children}
                </div>
            </div>
            <ShareExperienceModal isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
}

export default function AcademyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            <TutorProvider>
                <ExperienceProvider>
                    <AlumniProvider>
                        <AcademyContent>
                            {children}
                        </AcademyContent>
                        <TutorSidebar />
                    </AlumniProvider>
                </ExperienceProvider>
            </TutorProvider>
        </ThemeProvider>
    );
}
