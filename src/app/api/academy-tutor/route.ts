import { GoogleGenerativeAI } from '@google/generative-ai';
import { academyKnowledge } from '@/data/academyKnowledge';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { messages, courseId, unitNumber, situation, pageContext } = await request.json();

        // Find the grounded data
        const blueprint = courseId ? academyKnowledge[courseId] : null;
        const currentUnit = (blueprint && unitNumber) ? blueprint.units.find(u => u.number === unitNumber) : null;

        const systemPrompt = `You are the Knowledge Groove AI Tutor, a highly specialized academic mentor.
Your mission: Transform student stress and confusion into test-ready confidence.

CORE PHILOSOPHY:
1. Be course-aware, unit-aware, and page-aware.
2. Prioritize clarity, focus, and confidence.
3. Tell students what matters, why it matters, and what to do next.
4. You are a calm, intelligent mentor, not a solutions manual. Never just give raw answers.

Current Context:
Course: ${blueprint?.title || 'Not specified'}
Unit: ${currentUnit?.title || 'Not specified'}
Mode: ${situation || 'General learning'}
On-page Info: ${pageContext || 'None'}

GROUNDING DATABASE:
${blueprint ? `
Course Overview: ${blueprint.overview.testingFocus}
Success Blueprint: ${blueprint.overview.successBlueprint}
Exam Format: ${blueprint.examFormat}
Teacher Tips: ${blueprint.teacherTips.join(' | ')}
` : ''}

${currentUnit ? `
UNIT DATA:
- WHAT THIS UNIT REALLY TESTS: ${currentUnit.whatMatters}
- TEST-RELEVANT SKILLS: ${currentUnit.skills.join(', ')}
- KEY CONCEPTS: ${currentUnit.keyConcepts.join(', ')}
- READINESS CHECKLIST: ${currentUnit.readinessChecklist.join(' | ')}
- COMMON MISTAKES: ${currentUnit.commonMistakes.map(m => `${m.mistake} (Fix: ${m.fix})`).join(' | ')}
` : ''}

${situation === 'recovery' && blueprint ? `RECOVERY STRATEGIES: ${JSON.stringify(blueprint.recoveryStrategies)}` : ''}

STRICT RESPONSE STRUCTURE (Use these exact headers - No Markdown Bold):
1. THE FOCUS: Describe what this topic/question is really testing (use data).
2. THE LOGIC: The key idea in plain language.
3. THE GUIDE: Step-by-step test-style guidance.
4. THE GOTCHA: Mention specific common mistakes and their fixes from the database.
5. NEXT STEP: A "Are you test-ready?" check or a specific manageable action.

STYLE: Structured, calm, concise. No long essays. No fluff. DO NOT use markdown bolding (double asterisks). Keep responses under 300 words.`;

        // Use Gemini AI for actual conversation
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Convert message history to Gemini format
        const chatHistory = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            },
        });

        // Send the system prompt as the first message if it's a new conversation
        const userMessage = messages[messages.length - 1].content;
        const fullPrompt = chatHistory.length === 0
            ? `${systemPrompt}\n\nStudent: ${userMessage}`
            : userMessage;

        const result = await chat.sendMessage(fullPrompt);
        const responseContent = result.response.text();

        return NextResponse.json({
            content: responseContent,
            grounding: {
                course: blueprint?.title,
                unit: currentUnit?.title,
                mode: situation
            }
        });

    } catch (error: any) {
        console.error('AI Tutor Error:', error);
        return NextResponse.json({
            error: 'Failed to generate response. Please try again.',
            details: error.message
        }, { status: 500 });
    }
}
