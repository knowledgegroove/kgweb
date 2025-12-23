import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIMessage {
    role: 'user' | 'bot';
    content: string;
}

export async function askAI(messages: AIMessage[], systemPrompt: string) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // 1. Try Gemini (Primary)
    if (geminiKey) {
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

            // If Gemini fails for ANY reason, try Anthropic if we have a key
            if (anthropicKey) {
                return await tryAnthropic(messages, systemPrompt, anthropicKey);
            }
            throw geminiError;
        }
    } else if (anthropicKey) {
        // If Gemini key is missing completely, go straight to Anthropic
        console.warn('[AIService] Gemini Key missing, skipping to Anthropic...');
        return await tryAnthropic(messages, systemPrompt, anthropicKey);
    } else {
        throw new Error('No AI provider keys found. Please set GEMINI_API_KEY or ANTHROPIC_API_KEY.');
    }
}

async function tryAnthropic(messages: AIMessage[], systemPrompt: string, apiKey: string) {
    try {
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
    } catch (err: any) {
        console.error('[AIService] Anthropic also failed:', err.message);
        throw err;
    }
}
