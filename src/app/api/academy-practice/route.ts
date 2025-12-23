import { NextResponse } from 'next/server';
import { academyKnowledge } from '@/data/academyKnowledge';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { courseId, unitNumber } = await request.json();

        const blueprint = academyKnowledge[courseId];
        const unit = blueprint?.units.find(u => u.number === unitNumber);

        if (!unit) {
            return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
        }

        const systemPrompt = `You are a high-fidelity MCQ generator for students. 
Generate 5 Multiple Choice Questions for: 
Course: ${blueprint.title}
Unit ${unit.number}: ${unit.title}

REQUIREMENTS:
1. Valid JSON array of 5 objects.
2. Each object: { "question": string, "options": [string, string, string, string], "answer": number(0-3), "explanation": string }.
3. Use LaTeX for math ($...$ or $$...$$).
4. Focus on these concepts: ${unit.keyConcepts.join(', ')}
5. Include traps based on: ${unit.commonMistakes.map(m => m.mistake).join(', ')}.`;

        let responseText = "";
        let provider = "Claude";

        // Try Anthropic first
        if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 10) {
            try {
                const response = await anthropic.messages.create({
                    model: "claude-3-5-sonnet-20240620",
                    max_tokens: 2000,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: 'Output the 5 MCQs in the requested JSON format now.' }],
                });
                // @ts-ignore
                responseText = response.content[0].text;
                provider = "Claude";
            } catch (err: any) {
                console.error("Anthropic Practice Error:", err.message);
                provider = "Fallback (Gemini)";
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                const result = await model.generateContent(`${systemPrompt}\n\nGenerate the JSON array now.`);
                responseText = result.response.text();
            }
        } else {
            provider = "Gemini";
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent(`${systemPrompt}\n\nGenerate the JSON array now.`);
            responseText = result.response.text();
        }

        // Robust JSON extraction
        let sanitized = responseText.trim();
        const jsonStart = sanitized.indexOf('[');
        const jsonEnd = sanitized.lastIndexOf(']');

        if (jsonStart !== -1 && jsonEnd !== -1) {
            sanitized = sanitized.substring(jsonStart, jsonEnd + 1);
        } else {
            throw new Error(`AI response did not contain a valid JSON array. (Provider: ${provider})`);
        }

        try {
            const questions = JSON.parse(sanitized);
            const labeledQuestions = Array.isArray(questions) ? questions.map((q: any) => ({
                ...q,
                explanation: `(${provider}) ${q.explanation}`
            })) : [];

            if (labeledQuestions.length === 0) throw new Error("Parsed JSON was not a valid array.");

            return NextResponse.json({ questions: labeledQuestions });
        } catch (e: any) {
            console.error('Failed to parse AI JSON:', sanitized);
            return NextResponse.json({
                error: 'Failed to generate valid practice set',
                raw: sanitized.substring(0, 100),
                provider: provider
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Practice API Error:', error);
        return NextResponse.json({
            error: 'Failed to generate practice set',
            details: error.message
        }, { status: 500 });
    }
}
