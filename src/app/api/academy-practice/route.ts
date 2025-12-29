import { NextResponse } from 'next/server';
import { academyKnowledge } from '@/data/academyKnowledge';
import { askAI } from '@/services/aiService';

export async function POST(request: Request) {
    try {
        const { courseId, unitNumber } = await request.json();

        const blueprint = academyKnowledge[courseId];
        const unit = blueprint?.units.find(u => u.number === unitNumber);

        if (!unit) {
            return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
        }

        const randomSeed = Math.random().toString(36).substring(7);

        const systemPrompt = `Generate 5 UNIQUE Multiple Choice Questions as a JSON array.
Course: ${blueprint.title}
Unit: ${unit.number}
Seed: ${randomSeed}

Format: [ { "question": "...", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "..." } ]
Output ONLY JSON. No preamble.`;


        // Use unified askAI service
        const responseText = await askAI([
            { role: 'user', content: 'Output the 5 MCQs in JSON format now.' }
        ], systemPrompt);

        // EXTRA ROBUST EXTRACTION
        let jsonContent = responseText;

        // Find the first '[' and last ']'
        const start = jsonContent.indexOf('[');
        const end = jsonContent.lastIndexOf(']');

        if (start === -1 || end === -1) {
            console.error('[PracticeAPI] Invalid Structure:', responseText);
            return NextResponse.json({
                error: 'AI did not return a valid JSON array',
                responseText: responseText.substring(0, 500)
            }, { status: 500 });
        }

        jsonContent = jsonContent.substring(start, end + 1);

        try {
            const questions = JSON.parse(jsonContent);
            return NextResponse.json({ questions: Array.isArray(questions) ? questions : [] });
        } catch (err: unknown) {
            const parseError = err as Error;
            console.error('[PracticeAPI] Parse Error:', parseError.message);
            return NextResponse.json({
                error: 'Failed to parse AI response as JSON',
                details: parseError.message,
                raw: jsonContent.substring(0, 200)
            }, { status: 500 });
        }


    } catch (err: unknown) {
        const error = err as Error;
        console.error('Practice API Error:', error);
        return NextResponse.json({
            error: 'Failed to generate practice set',
            details: error.message
        }, { status: 500 });
    }
}

