async function diagOR() {
    const key = "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";
    console.log("Testing OpenRouter Key...");

    try {
        const res = await fetch("https://openrouter.ai/api/v1/models", {
            headers: { "Authorization": `Bearer ${key}` }
        });
        const data = await res.json();
        if (data.data) {
            console.log("SUCCESS: Found", data.data.length, "models.");
            const gemini = data.data.filter(m => m.id.includes('gemini-2.0-flash'));
            console.log("GEMINI 2.0 MODELS:", gemini.map(m => m.id));
        } else {
            console.log("FAIL:", data);
        }

        // Try a simple completion
        const compRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [{ "role": "user", "content": "Say 'OpenRouter OK'" }]
            })
        });
        const compData = await compRes.json();
        console.log("COMPLETION RESULT:", JSON.stringify(compData, null, 2));

    } catch (e) {
        console.log("ERROR:", e.message);
    }
}

diagOR();
