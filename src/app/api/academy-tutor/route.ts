import { academyKnowledge } from '@/data/academyKnowledge';
import { NextResponse } from 'next/server';
import { askAI } from '@/services/aiService';

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
Curriculum: ${blueprint.curriculumLink || 'N/A'}
Textbooks: ${blueprint.textbooks?.map(t => `${t.title} (Chapters: ${t.chapters.join(', ')})`).join(' | ') || 'N/A'}
Recent Past Tests: ${blueprint.pastTests?.map(p => `${p.year} (Focus: ${p.focus}, Difficulty: ${p.difficulty})`).join(' | ') || 'N/A'}
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
1. THE FOCUS: Describe what this topic/question is really testing (use database data).
2. THE LOGIC: The key idea in plain language.
3. THE GUIDE: Step-by-step test-style guidance. If applicable, reference relevant chapters from ${blueprint?.textbooks?.[0]?.title || 'the textbook'} or trends from past ${blueprint?.title} exams.
4. THE GOTCHA: Mention specific common mistakes and their fixes from the database.
5. NEXT STEP: A "Are you test-ready?" check or a specific manageable action.

STYLE: Structured, calm, concise. No long essays. No fluff. DO NOT use markdown bolding (double asterisks). Keep responses under 300 words.`;

        // Use the unified AI service (Gemini primary, Anthropic fallback)
        const responseContent = await askAI(messages, systemPrompt);

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
        const isQuotaError = error.message?.includes('429') || error.message?.includes('quota');
        return NextResponse.json({
            error: isQuotaError ? 'Rate Limit Exceeded' : 'Failed to generate response',
            details: error.message,
            isQuota: isQuotaError
        }, { status: isQuotaError ? 429 : 500 });
    }
}
