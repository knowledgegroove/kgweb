'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { alumniMemory as initialData, AlumniTip } from '@/data/alumniMemory';

interface AlumniContextType {
    tips: AlumniTip[];
    addTip: (tip: AlumniTip) => void;
}

const AlumniContext = createContext<AlumniContextType | undefined>(undefined);

export function AlumniProvider({ children }: { children: React.ReactNode }) {
    const [tips, setTips] = useState<AlumniTip[]>(initialData);

    useEffect(() => {
        // Load from localStorage on mount
        const savedTips = localStorage.getItem('kg_alumni_tips');
        if (savedTips) {
            try {
                const parsed = JSON.parse(savedTips);
                // Merge static data with saved user data (in case static data updated)
                // For simplicity, let's just use the saved data if it exists, or maybe append user tips? 
                // A better approach is to store ONLY user added tips in local storage.
            } catch (e) {
                console.error('Failed to parse saved tips', e);
            }
        }
    }, []);

    // Better approach: Keep static data separate from user data
    // But for this simple requirement, let's just manage one list.
    // Initialization:
    useEffect(() => {
        const savedUserTips = localStorage.getItem('kg_user_tips');
        if (savedUserTips) {
             try {
                const userTips = JSON.parse(savedUserTips);
                setTips([...initialData, ...userTips]);
            } catch (e) {
                console.error('Failed to parse user tips', e);
            }
        } else {
            setTips(initialData);
        }
    }, []);

    const addTip = (tip: AlumniTip) => {
        setTips(prev => {
            const newTips = [...prev, tip];
            
            // Save only the new tip to user tips in localStorage
            const savedUserTips = localStorage.getItem('kg_user_tips');
            let userTips: AlumniTip[] = [];
            if (savedUserTips) {
                try {
                    userTips = JSON.parse(savedUserTips);
                } catch (e) {}
            }
            userTips.push(tip);
            localStorage.setItem('kg_user_tips', JSON.stringify(userTips));
            
            return newTips;
        });
    };

    return (
        <AlumniContext.Provider value={{ tips, addTip }}>
            {children}
        </AlumniContext.Provider>
    );
}

export function useAlumni() {
    const context = useContext(AlumniContext);
    if (!context) throw new Error('useAlumni must be used within AlumniProvider');
    return context;
}
