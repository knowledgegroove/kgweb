import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { academyKnowledge } from '@/data/academyKnowledge';

export interface AIMessage {
    role: 'user' | 'bot';
    content: string;
}

export async function askAI(messages: AIMessage[], systemPrompt: string) {
    // HARDCODED KEYS FOR VERIFICATION (Temporary)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    let lastError = "";

    // 1. Try OpenRouter (New Primary)
    if (openRouterKey && openRouterKey.startsWith('sk-or')) {
        try {
            const res = await tryOpenRouter(messages, systemPrompt, openRouterKey);
            return `(OpenRouter) ${res}`;
        } catch (orError: any) {
            lastError = `OpenRouter: ${orError.message}`;
            console.error('[AIService] OpenRouter Failed:', orError.message);
        }
    }

    // 2. Try Gemini (Secondary)
    if (geminiKey && geminiKey.startsWith('AIza')) {
        try {
            console.log('[AIService] Attempting Gemini (gemini-2.0-flash) with key ending in:', geminiKey.slice(-4));
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const chatHistory = messages.slice(0, -1).map((msg) => ({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content || ' ' }]
            }));

            const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                },
            });

            // For Gemini, we include the system prompt in the final instruction to ensure adherence
            const userMessage = messages[messages.length - 1].content;
            const promptWithInstructions = `INSTRUCTIONS:\n${systemPrompt}\n\nSTUDENT MESSAGE:\n${userMessage}`;

            const result = await chat.sendMessage(promptWithInstructions);
            return `(Gemini) ${result.response.text()}`;

        } catch (geminiError: any) {
            lastError += ` | Gemini: ${geminiError.message}`;
            console.error('[AIService] Gemini Failed:', geminiError.message);

            if (anthropicKey) {
                try {
                    const res = await tryAnthropic(messages, systemPrompt, anthropicKey);
                    return `(Claude) ${res}`;
                } catch (anthropicError: any) {
                    lastError += ` | Anthropic: ${anthropicError.message}`;
                    return generateMockResponse(systemPrompt, messages[messages.length - 1].content, lastError);
                }
            }
            return generateMockResponse(systemPrompt, messages[messages.length - 1].content, lastError);
        }
    } else if (anthropicKey) {
        try {
            const res = await tryAnthropic(messages, systemPrompt, anthropicKey);
            return `(Claude) ${res}`;
        } catch (err: any) {
            lastError += ` | Anthropic: ${err.message}`;
            return generateMockResponse(systemPrompt, messages[messages.length - 1].content, lastError);
        }
    } else {
        return generateMockResponse(systemPrompt, messages[messages.length - 1].content, lastError || "No API Keys Provided");
    }
}

async function tryOpenRouter(messages: AIMessage[], systemPrompt: string, apiKey: string) {
    console.log('[AIService] Attempting OpenRouter (google/gemini-2.0-flash-lite-001)...');

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://knowledgegroove.com",
            "X-Title": "Knowledge Groove Academy"
        },
        body: JSON.stringify({
            "model": "google/gemini-2.0-flash-lite-001",
            "messages": [
                { "role": "system", "content": systemPrompt },
                ...messages.map(msg => ({
                    role: msg.role === 'bot' ? 'assistant' : 'user',
                    content: msg.content
                }))
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
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
function generateMockResponse(systemPrompt: string, userMessage: string, errorReason: string) {
    console.warn('[AIService] All providers failed. Fallback Reason:', errorReason);

    // Safer course extraction
    const lines = systemPrompt.split('\n');
    const courseLine = lines.find(l => l.includes('Course:'));
    const courseName = courseLine ? courseLine.split(':')[1].trim() : 'your course';

    return `1. THE FOCUS: I'm in "Limited Connection Mode" because of an API issue (${errorReason.split(':')[0]}). We are looking at ${courseName}.
2. THE LOGIC: The key to this unit is staying focused on the core skills and avoiding common distractions.
3. THE GUIDE: Since I'm having trouble connecting to my full "brain", I recommend reviewing your textbook and focusing on the readiness checklist for this unit.
4. THE GOTCHA: Remember the common mistakes we discussed earlier—those are the biggest traps in ${courseName}.
5. NEXT STEP: Try asking me for "Initial Advice" again, or check back once your API quota has reset!`;
}
