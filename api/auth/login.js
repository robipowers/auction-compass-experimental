import crypto from 'crypto';

function base64UrlEncode(buffer) {
    return Buffer.from(buffer)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export default function handler(req, res) {
    const randomBytes = crypto.randomBytes(32);
    const codeVerifier = base64UrlEncode(randomBytes);
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = base64UrlEncode(hash);
    const nonce = crypto.randomBytes(16).toString('hex');

    res.setHeader('Set-Cookie', `cv=${codeVerifier}; Path=/; Max-Age=300; HttpOnly; Secure; SameSite=Lax`);

    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = 'https://app.auctionmentor.io/api/auth/callback';

    const authUrl = 'https://api.whop.com/oauth/authorize'
        + '?client_id=' + clientId
        + '&redirect_uri=' + encodeURIComponent(redirectUri)
        + '&response_type=code'
        + '&scope=' + encodeURIComponent('openid profile email')
        + '&nonce=' + nonce
        + '&code_challenge=' + codeChallenge
        + '&code_challenge_method=S256';

    res.redirect(302, authUrl);
}
