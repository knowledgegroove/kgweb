import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { academyKnowledge } from '@/data/academyKnowledge';

export interface AIMessage {
    role: 'user' | 'bot';
    content: string;
}

export async function askAI(messages: AIMessage[], systemPrompt: string) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // 1. Try Gemini (Primary)
    if (geminiKey && geminiKey.startsWith('AIza')) {
        try {
            console.log('[AIService] Attempting Gemini (gemini-2.0-flash-lite)...');
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

            const chatHistory = messages.slice(0, -1).map((msg) => ({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content || ' ' }]
            }));

            const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.7,
                },
            });

            const userMessage = messages[messages.length - 1].content;
            const fullPrompt = chatHistory.length === 0
                ? `${systemPrompt}\n\nStudent: ${userMessage}`
                : userMessage;

            const result = await chat.sendMessage(fullPrompt);
            return result.response.text();

        } catch (geminiError: any) {
            console.error('[AIService] Gemini Failed:', geminiError.message);

            if (anthropicKey) {
                try {
                    return await tryAnthropic(messages, systemPrompt, anthropicKey);
                } catch (anthropicError) {
                    return generateMockResponse(systemPrompt, messages[messages.length - 1].content);
                }
            }
            return generateMockResponse(systemPrompt, messages[messages.length - 1].content);
        }
    } else if (anthropicKey) {
        try {
            return await tryAnthropic(messages, systemPrompt, anthropicKey);
        } catch (err) {
            return generateMockResponse(systemPrompt, messages[messages.length - 1].content);
        }
    } else {
        // Final Fallback: Mock Response from Database
        return generateMockResponse(systemPrompt, messages[messages.length - 1].content);
    }
}

async function tryAnthropic(messages: AIMessage[], systemPrompt: string, apiKey: string) {
    console.log('[AIService] Attempting Anthropic (claude-3-5-sonnet-20240620)...');
    const anthropic = new Anthropic({ apiKey });

    const anthropicHistory = messages.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' as const : 'user' as const,
        content: msg.content
    }));

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 500,
        system: systemPrompt,
        messages: anthropicHistory,
    });

    // @ts-ignore
    return response.content[0].text;
}

/**
 * GENERATE MOCK RESPONSE
 * This is the "Nuclear Option" - if no API keys work, we use the structured 
 * data we already have to give a helpful (though less dynamic) response.
 */
function generateMockResponse(systemPrompt: string, userMessage: string) {
    console.warn('[AIService] All AI Providers failed or are missing. Using Emergency Mock Response.');

    // Extract info from systemPrompt
    const courseMatch = systemPrompt.match(/Course: (.*?)\n/);
    const unitMatch = systemPrompt.match(/Unit: (.*?)\n/);
    const courseName = courseMatch ? courseMatch[1] : 'the course';

    return `1. THE FOCUS: I'm currently in "Limited Connection Mode," but I can still guide you using our course records. We are looking at ${courseName}.
2. THE LOGIC: The key to this unit is staying focused on the core skills and avoiding common distractions.
3. THE GUIDE: Since I'm having trouble connecting to my full "brain" right now, I recommend reviewing your textbook and focusing on the readiness checklist for this unit.
4. THE GOTCHA: Remember the common mistakes we discussed earlier—those are the biggest traps in ${courseName}.
5. NEXT STEP: Try asking me for "Initial Advice" again, or review the course syllabus until I'm fully back online!`;
}
