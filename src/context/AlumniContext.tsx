'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { alumniMemory as initialData, AlumniTip } from '@/data/alumniMemory';

interface AlumniContextType {
    tips: AlumniTip[];
    addTip: (tip: AlumniTip) => void;
}

const AlumniContext = createContext<AlumniContextType | undefined>(undefined);

import { supabase } from '@/utils/supabaseClient';

export function AlumniProvider({ children }: { children: React.ReactNode }) {
    const [tips, setTips] = useState<AlumniTip[]>(initialData);

    const fetchTips = async () => {
        try {
            const { data, error } = await supabase
                .from('alumni_tips')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const dbTips: AlumniTip[] = (data || []).map(row => ({
                courseId: row.course_id,
                studentName: row.student_name,
                tip: row.tip,
                date: row.created_at.split('T')[0]
            }));

            // Merge static initial data with database data (avoid duplicates if same content)
            setTips([...initialData, ...dbTips]);
        } catch (e) {
            console.error('Failed to fetch alumni tips:', e);
        }
    };

    useEffect(() => {
        fetchTips();
    }, []);

    const addTip = async (tip: AlumniTip) => {
        try {
            // 1. Optimistically update UI
            setTips(prev => [...prev, tip]);

            // 2. Save to Supabase
            const { error } = await supabase
                .from('alumni_tips')
                .insert([{
                    course_id: tip.courseId,
                    student_name: tip.studentName,
                    tip: tip.tip
                }]);

            if (error) throw error;
        } catch (e) {
            console.error('Failed to save alumni tip:', e);
        }
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
