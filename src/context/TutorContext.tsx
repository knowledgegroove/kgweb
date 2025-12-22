'use client';

import React, { createContext, useContext, useState } from 'react';

interface TutorContextType {
    isOpen: boolean;
    openTutor: (courseId?: string, unitNumber?: number, pageContext?: string) => void;
    closeTutor: () => void;
    initialCourseId: string | null;
    initialUnitNumber: number | null;
    initialPageContext: string | null;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export function TutorProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [initialCourseId, setInitialCourseId] = useState<string | null>(null);
    const [initialUnitNumber, setInitialUnitNumber] = useState<number | null>(null);
    const [initialPageContext, setInitialPageContext] = useState<string | null>(null);

    const openTutor = (courseId?: string, unitNumber?: number, pageContext?: string) => {
        if (courseId) setInitialCourseId(courseId);
        if (unitNumber) setInitialUnitNumber(unitNumber);
        if (pageContext) setInitialPageContext(pageContext);
        setIsOpen(true);
    };

    const closeTutor = () => {
        setIsOpen(false);
        setInitialCourseId(null);
        setInitialUnitNumber(null);
        setInitialPageContext(null);
    };

    return (
        <TutorContext.Provider value={{ isOpen, openTutor, closeTutor, initialCourseId, initialUnitNumber, initialPageContext }}>
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
