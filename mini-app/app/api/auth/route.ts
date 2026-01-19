import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramData, parseUserFromInitData, isAuthDateValid, generateSessionToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for server-side operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { initData } = body as { initData: string };

        if (!initData) {
            return NextResponse.json(
                { error: 'Missing initData' },
                { status: 400 }
            );
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Validate Telegram signature
        const isValid = validateTelegramData(initData, botToken);

        if (!isValid) {
            console.warn('Invalid Telegram initData signature');
            return NextResponse.json(
                { error: 'Invalid authentication data' },
                { status: 401 }
            );
        }

        // Check auth_date is not too old (24 hours)
        if (!isAuthDateValid(initData)) {
            return NextResponse.json(
                { error: 'Authentication data expired' },
                { status: 401 }
            );
        }

        // Parse user data
        const user = parseUserFromInitData(initData);

        if (!user || !user.id) {
            return NextResponse.json(
                { error: 'Invalid user data' },
                { status: 400 }
            );
        }

        // Check whitelist in Supabase
        let isWhitelisted = false;

        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            try {
                const { data: whitelistEntry, error } = await supabase
                    .from('users')
                    .select('id, is_active, telegram_id')
                    .eq('telegram_id', user.id)
                    .single();

                if (!error && whitelistEntry && whitelistEntry.is_active) {
                    isWhitelisted = true;

                    // Update last_active timestamp
                    await supabase
                        .from('users')
                        .update({
                            last_active: new Date().toISOString(),
                            first_name: user.first_name,
                            last_name: user.last_name || null,
                            username: user.username || null,
                        })
                        .eq('telegram_id', user.id);
                }
            } catch (dbError) {
                console.error('Database error checking whitelist:', dbError);
                // Continue without whitelist check if DB is unavailable
            }
        } else {
            // If Supabase not configured, allow all users (development mode)
            console.warn('Supabase not configured, allowing all users');
            isWhitelisted = true;
        }

        // Generate session token
        const sessionToken = generateSessionToken(user.id);

        console.log('Auth successful:', {
            userId: user.id,
            username: user.username,
            isWhitelisted,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                language_code: user.language_code,
                is_premium: user.is_premium,
                photo_url: user.photo_url,
            },
            isWhitelisted,
            sessionToken,
        });

    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
