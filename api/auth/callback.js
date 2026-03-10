function parseCookies(str) {
    const obj = {};
    if (!str) return obj;
    str.split(';').forEach(pair => {
        const idx = pair.indexOf('=');
        if (idx < 0) return;
        const key = pair.substring(0, idx).trim();
        obj[key] = pair.substring(idx + 1).trim();
    });
    return obj;
}

export default async function handler(req, res) {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Missing authorization code. <a href="/">Go back</a>');
    }

    try {
        const cookies = parseCookies(req.headers.cookie);
        const code_verifier = cookies.cv;
        if (!code_verifier) {
            return res.status(400).send('Missing PKCE verifier. <a href="/">Try again</a>');
        }

        const client_id = process.env.WHOP_CLIENT_ID;
        const client_secret = process.env.WHOP_CLIENT_SECRET;
        const redirect_uri = 'https://app.auctionmentor.io/api/auth/callback';

        const tokenResponse = await fetch('https://api.whop.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code, redirect_uri, client_id, client_secret, code_verifier
            })
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            console.error('Token exchange failed:', tokenData);
            return res.status(401).send('<html><body style="font-family:Arial;text-align:center;margin-top:50px;"><h2 style="color:red">Authentication Failed</h2><p>Please try again.</p><br><a href="/" style="padding:10px 20px;background:#ff6243;color:white;text-decoration:none;border-radius:5px">Go Back</a></body></html>');
        }

        const userResponse = await fetch('https://api.whop.com/oauth/userinfo', {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        });
        const userInfo = await userResponse.json();

        const session = JSON.stringify({
            access_token: tokenData.access_token,
            email: userInfo.email || '',
            name: userInfo.name || userInfo.email || 'Member',
            sub: userInfo.sub || ''
        });

        res.setHeader('Set-Cookie', [
            `session=${encodeURIComponent(session)}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`,
            `cv=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
        ]);

        res.redirect(302, '/');
    } catch (error) {
        console.error('Auth callback error:', error);
        res.status(500).send('<html><body style="font-family:Arial;text-align:center;margin-top:50px;"><h2 style="color:red">Something went wrong</h2><p>Please try again.</p><br><a href="/" style="padding:10px 20px;background:#ff6243;color:white;text-decoration:none;border-radius:5px">Go Back</a></body></html>');
    }
}
