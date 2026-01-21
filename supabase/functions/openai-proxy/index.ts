// Supabase Edge Function: openai-proxy
// Deploy this to Supabase using: supabase functions deploy openai-proxy
// Set the OPENAI_API_KEY secret: supabase secrets set OPENAI_API_KEY=your-key

// Deno.serve handler
Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        })
    }

    try {
        const { prompt } = await req.json()

        // Get OpenAI API key from environment
        const openaiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openaiKey) {
            throw new Error('OPENAI_API_KEY not configured')
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты профессиональный трейдер. Отвечай ТОЛЬКО валидным JSON без markdown.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`OpenAI API error: ${error}`)
        }

        const data = await response.json()
        const content = data.choices[0].message.content.trim()

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('Invalid response format from OpenAI')
        }

        const result = JSON.parse(jsonMatch[0])

        return new Response(JSON.stringify(result), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        })
    }
})
