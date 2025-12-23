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

STRICT RESPONSE STRUCTURE:
- You MUST start every numbered section on a new line with exactly TWO newlines (\\n\\n) before it.

1. THE FOCUS: Plain language overview.
2. THE LOGIC: The core concept.
3. THE GUIDE: Step-by-step guidance.
4. THE GOTCHA: Common traps.
5. NEXT STEP: Actionable check.

STYLE:
- NO markdown bold (**).
- NO asterisks (*). Use 1., 2.
- NO conversational filler.
- NO backticks.

MATH NOTATION (ZERO TOLERANCE FOR PLAIN TEXT):
- Use ONLY LaTeX. NEVER write "lim" as text or "a/b".
- Wrap EVERY equation in double dollar signs $$ ... $$ to force a new line.
- Example:
  $$ \\lim_{x \\to c} f(x) = L $$
  $$ \\frac{dy}{dx} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} $$`;

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
