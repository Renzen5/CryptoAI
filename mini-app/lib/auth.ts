import crypto from 'crypto';

/**
 * Parse Telegram initData string into an object
 */
export function parseInitData(initData: string): Record<string, string> {
    const params = new URLSearchParams(initData);
    const data: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
        data[key] = value;
    }

    return data;
}

/**
 * Parse user data from initData
 */
export function parseUserFromInitData(initData: string): {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
} | null {
    try {
        const parsed = parseInitData(initData);
        if (!parsed.user) return null;

        return JSON.parse(parsed.user);
    } catch {
        return null;
    }
}

/**
 * Validate Telegram initData using HMAC-SHA256
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramData(initData: string, botToken: string): boolean {
    try {
        const parsed = parseInitData(initData);
        const hash = parsed.hash;

        if (!hash) {
            console.error('No hash found in initData');
            return false;
        }

        // Remove hash from data
        delete parsed.hash;

        // Sort keys alphabetically and create data-check-string
        const dataCheckString = Object.keys(parsed)
            .sort()
            .map(key => `${key}=${parsed[key]}`)
            .join('\n');

        // Create secret key: HMAC_SHA256(botToken, "WebAppData")
        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(botToken)
            .digest();

        // Calculate hash: HMAC_SHA256(dataCheckString, secretKey)
        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // Compare hashes
        return calculatedHash === hash;
    } catch (error) {
        console.error('Error validating Telegram data:', error);
        return false;
    }
}

/**
 * Check if auth_date is not too old (default: 24 hours)
 */
export function isAuthDateValid(initData: string, maxAgeSeconds: number = 86400): boolean {
    try {
        const parsed = parseInitData(initData);
        const authDate = parseInt(parsed.auth_date, 10);

        if (isNaN(authDate)) return false;

        const now = Math.floor(Date.now() / 1000);
        return (now - authDate) <= maxAgeSeconds;
    } catch {
        return false;
    }
}

/**
 * Generate a simple session token
 */
export function generateSessionToken(userId: number): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    const data = `${userId}:${timestamp}:${random}`;

    return Buffer.from(data).toString('base64url');
}

/**
 * Parse session token
 */
export function parseSessionToken(token: string): { userId: number; timestamp: number } | null {
    try {
        const data = Buffer.from(token, 'base64url').toString();
        const [userIdStr, timestampStr] = data.split(':');

        return {
            userId: parseInt(userIdStr, 10),
            timestamp: parseInt(timestampStr, 10),
        };
    } catch {
        return null;
    }
}
