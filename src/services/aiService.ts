import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIMessage {
    role: 'user' | 'bot';
    content: string;
}

export async function askAI(messages: AIMessage[], systemPrompt: string) {
    const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
    const cerebrasKey = process.env.CEREBRAS_API_KEY?.trim();
    const chutesKey = process.env.CHUTES_API_KEY?.trim();
    const cloudflareKey = process.env.CLOUDFLARE_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();

    console.log('[AIService] Key Status:', {
        openRouter: !!openRouterKey,
        cerebras: !!cerebrasKey,
        chutes: !!chutesKey,
        cloudflare: !!cloudflareKey && !!cloudflareAccountId,
        gemini: !!geminiKey,
        anthropic: !!anthropicKey
    });

    let lastError = "";

    // 1. Try OpenRouter (Primary)
    if (openRouterKey) {
        try {
            const res = await tryOpenRouter(messages, systemPrompt, openRouterKey);
            return `(OpenRouter) ${res}`;
        } catch (err: unknown) {
            const error = err as Error;
            lastError = `OpenRouter: ${error.message}`;
            console.error('[AIService] OpenRouter Failed:', error.message);
        }
    }

    // 2. Try Cerebras (Fast Inference)
    if (cerebrasKey) {
        try {
            const res = await tryCerebras(messages, systemPrompt, cerebrasKey);
            return `(Cerebras) ${res}`;
        } catch (err: unknown) {
            const error = err as Error;
            lastError += ` | Cerebras: ${error.message}`;
            console.error('[AIService] Cerebras Failed:', error.message);
        }
    }

    // 3. Try Chutes (Alternative)
    if (chutesKey) {
        try {
            const res = await tryChutes(messages, systemPrompt, chutesKey);
            return `(Chutes) ${res}`;
        } catch (err: unknown) {
            const error = err as Error;
            lastError += ` | Chutes: ${error.message}`;
            console.error('[AIService] Chutes Failed:', error.message);
        }
    }

    // 4. Try Cloudflare (Workers AI)
    if (cloudflareKey && cloudflareAccountId) {
        try {
            const res = await tryCloudflare(messages, systemPrompt, cloudflareKey, cloudflareAccountId);
            return `(Cloudflare) ${res}`;
        } catch (err: unknown) {
            const error = err as Error;
            lastError += ` | Cloudflare: ${error.message}`;
            console.error('[AIService] Cloudflare Failed:', error.message);
        }
    }

    // 5. Try Anthropic (Fallback)
    if (anthropicKey) {
        try {
            const res = await tryAnthropic(messages, systemPrompt, anthropicKey);
            return `(Claude) ${res}`;
        } catch (err: unknown) {
            const error = err as Error;
            lastError += ` | Anthropic: ${error.message}`;
        }
    }

    // 6. Try Gemini (Last Priority)
    if (geminiKey) {
        try {
            console.log('[AIService] Attempting Gemini (gemini-2.0-flash)...');
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

            const result = await chat.sendMessage(messages[messages.length - 1].content);
            const response = await result.response;
            return response.text();
        } catch (err: unknown) {
            const error = err as Error;
            lastError += ` | Gemini: ${error.message}`;
            console.error('[AIService] Gemini Failed:', error.message);
        }
    }



    return generateMockResponse(systemPrompt, messages[messages.length - 1].content, lastError || "No Working API Keys Found");
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
    return data?.choices?.[0]?.message?.content || "";
}

async function tryCerebras(messages: AIMessage[], systemPrompt: string, apiKey: string) {
    console.log('[AIService] Attempting Cerebras (llama3.1-70b)...');

    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "llama-3.3-70b",
            "messages": [
                { "role": "system", "content": systemPrompt },
                ...messages.map(msg => ({
                    role: msg.role === 'bot' ? 'assistant' : 'user',
                    content: msg.content
                }))
            ],
            "max_tokens": 1000
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "";
}

async function tryChutes(messages: AIMessage[], systemPrompt: string, apiKey: string) {
    console.log('[AIService] Attempting Chutes (huggingface/meta-llama/Meta-Llama-3-70B-Instruct)...');

    // Chutes usually requires specific endpoint for specific models
    // Using the official LLM endpoint which is OpenAI compatible
    const response = await fetch("https://llm.chutes.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            // Using the current standard Llama 3.1 70B Instruct ID on Chutes
            "model": "meta-llama/Llama-3.1-70B-Instruct",
            "messages": [
                { "role": "system", "content": systemPrompt },
                ...messages.map(msg => ({
                    role: msg.role === 'bot' ? 'assistant' : 'user',
                    content: msg.content
                }))
            ],
            "max_tokens": 1000,
            "temperature": 0.7
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "";
}

async function tryCloudflare(messages: AIMessage[], systemPrompt: string, apiKey: string, accountId: string) {
    console.log('[AIService] Attempting Cloudflare (@cf/meta/llama-3-8b-instruct)...');

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                { "role": "system", "content": systemPrompt },
                ...messages.map(msg => ({
                    role: msg.role === 'bot' ? 'assistant' : 'user',
                    content: msg.content
                }))
            ]
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(errorData.errors?.[0]?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data?.result?.response || "";
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

    const textContent = response.content[0];
    if ('text' in textContent) {
        return textContent.text;
    }
    return "";
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

    return `(Local Logic) 1. THE STATUS: I'm in "Limited Connection Mode". Diagnostic Info: ${errorReason}. 
2. THE LOGIC: The key to this unit is staying focused on the core skills and avoiding common distractions.
3. THE GUIDE: Since I'm having trouble connecting to my full "brain", I recommend reviewing your textbook and focusing on the readiness checklist for this unit.
4. THE GOTCHA: Remember the common mistakes we discussed earlier—those are the biggest traps in ${courseName}.
5. NEXT STEP: Please verify your API Key in Vercel. Try refreshing the page.`;

}
