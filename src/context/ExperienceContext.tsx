'use client';

import { createContext, useContext, useState } from 'react';

interface ExperienceContextType {
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <ExperienceContext.Provider value={{ isModalOpen, openModal, closeModal }}>
            {children}
        </ExperienceContext.Provider>
    );
}

export function useExperience() {
    const context = useContext(ExperienceContext);
    if (!context) throw new Error('useExperience must be used within ExperienceProvider');
    return context;
}
