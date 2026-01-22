// Supabase Edge Function: pocket-verify
// Deploy this to Supabase using: supabase functions deploy pocket-verify
// Set secrets: 
//   supabase secrets set POCKET_API_TOKEN=your-token
//   supabase secrets set POCKET_PARTNER_ID=your-partner-id

import { createHash } from "https://deno.land/std@0.177.0/node/crypto.ts";

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
        const { user_id } = await req.json()

        if (!user_id) {
            return new Response(JSON.stringify({
                valid: false,
                error: 'User ID is required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            })
        }

        // Get secrets from environment
        const apiToken = Deno.env.get('POCKET_API_TOKEN')
        const partnerId = Deno.env.get('POCKET_PARTNER_ID')

        if (!apiToken || !partnerId) {
            throw new Error('API credentials not configured')
        }

        // Generate MD5 hash: md5("{user_id}:{partner_id}:{api_token}")
        const hashString = `${user_id}:${partnerId}:${apiToken}`
        const hash = createHash('md5').update(hashString).digest('hex')

        // Call Pocket Option API
        const apiUrl = `https://affiliate.pocketoption.com/api/user-info/${user_id}/${partnerId}/${hash}`

        console.log(`Verifying user ${user_id} with partner ${partnerId}`)

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Pocket Option API error:', response.status, errorText)

            return new Response(JSON.stringify({
                valid: false,
                error: 'Аккаунт не найден. Убедитесь, что вы зарегистрировались по нашей реферальной ссылке.'
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            })
        }

        const data = await response.json()
        console.log('Pocket Option API response:', JSON.stringify(data))

        // Check if the user exists and is valid
        // The API returns user info if the user is registered under this partner
        if (data && (data.user_id || data.id)) {
            return new Response(JSON.stringify({
                valid: true,
                user_id: user_id,
                message: 'Аккаунт успешно подтверждён!'
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            })
        } else {
            return new Response(JSON.stringify({
                valid: false,
                error: 'Этот аккаунт не зарегистрирован через нашу партнёрскую программу.'
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            })
        }

    } catch (error) {
        console.error('Verification error:', error)
        return new Response(JSON.stringify({
            valid: false,
            error: 'Ошибка проверки. Попробуйте позже.'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        })
    }
})
