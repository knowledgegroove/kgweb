import { NextResponse } from 'next/server';
import { practiceProblems } from '@/data/practiceProblems';

export async function POST(request: Request) {
    try {
        const { slug, unit, numProblems, difficulty } = await request.json();

        if (!slug || !unit) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const courseProblems = practiceProblems[slug] || {};
        let unitProblems = courseProblems[unit] || [];

        // If we don't have problems for this unit, generate some high-quality fallbacks
        if (unitProblems.length === 0) {
            unitProblems = [
                { q: `Explain the fundamental concepts discussed in ${unit}.`, a: `This unit covers the core principles of ${unit}, focusing on theoretical frameworks and practical applications.`, difficulty: 'Medium' },
                { q: `What is the significance of the major developments in ${unit}?`, a: `Developments in ${unit} provided the foundation for subsequent advancements in the field.`, difficulty: 'Medium' }
            ];
        }

        // Filter by difficulty if provided
        let filtered = unitProblems.filter((p: any) => p.difficulty === difficulty);
        if (filtered.length === 0) filtered = unitProblems; // Fallback to all if none match difficulty

        // Shuffle and pick numProblems
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());
        const result = [];
        for (let i = 0; i < numProblems; i++) {
            result.push(shuffled[i % shuffled.length]);
        }

        return NextResponse.json({ problems: result });

    } catch (error: any) {
        console.error('Practice API Error:', error);
        return NextResponse.json({ error: 'Failed to generate problems' }, { status: 500 });
    }
}
