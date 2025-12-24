'use client';

import React, { createContext, useContext, useState } from 'react';

interface TutorContextType {
    isOpen: boolean;
    isFullScreen: boolean;
    openTutor: (courseId?: string, unitNumber?: number, pageContext?: string, mode?: 'chat' | 'practice') => void;
    closeTutor: () => void;
    toggleFullScreen: () => void;
    initialCourseId: string | null;
    initialUnitNumber: number | null;
    initialPageContext: string | null;
    initialMode: 'chat' | 'practice' | null;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export function TutorProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [initialCourseId, setInitialCourseId] = useState<string | null>(null);
    const [initialUnitNumber, setInitialUnitNumber] = useState<number | null>(null);
    const [initialPageContext, setInitialPageContext] = useState<string | null>(null);
    const [initialMode, setInitialMode] = useState<'chat' | 'practice' | null>(null);

    const openTutor = (courseId?: string, unitNumber?: number, pageContext?: string, mode?: 'chat' | 'practice') => {
        if (courseId) setInitialCourseId(courseId);
        if (unitNumber) setInitialUnitNumber(unitNumber);
        if (pageContext) setInitialPageContext(pageContext);
        setInitialMode(mode || 'chat');
        setIsOpen(true);
    };

    const closeTutor = () => {
        setIsOpen(false);
        setIsFullScreen(false);
        setInitialCourseId(null);
        setInitialUnitNumber(null);
        setInitialPageContext(null);
        setInitialMode(null);
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <TutorContext.Provider value={{
            isOpen,
            isFullScreen,
            openTutor,
            closeTutor,
            toggleFullScreen,
            initialCourseId,
            initialUnitNumber,
            initialPageContext,
            initialMode
        }}>
            {children}
        </TutorContext.Provider>
    );
}

export function useTutor() {
    const context = useContext(TutorContext);
    if (!context) {
        throw new Error('useTutor must be used within a TutorProvider');
    }
    return context;
}
