import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface AIMessage {
    role: 'user' | 'bot';
    content: string;
}

export async function askAI(messages: AIMessage[], systemPrompt: string) {
    // 1. Try Gemini (Primary)
    try {
        console.log('[AIService] Attempting Gemini (gemini-2.0-flash-lite)...');
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

        const isQuotaError = geminiError.message?.includes('429') || geminiError.message?.includes('quota');

        if (isQuotaError && process.env.ANTHROPIC_API_KEY) {
            // 2. Fallback to Anthropic (Claude)
            try {
                console.log('[AIService] Falling back to Anthropic (claude-3-5-sonnet-20240620)...');

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

            } catch (anthropicError: any) {
                console.error('[AIService] Anthropic Fallback also failed:', anthropicError.message);
                throw anthropicError;
            }
        } else {
            throw geminiError;
        }
    }
}
