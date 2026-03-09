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

export default function handler(req, res) {
    const cookies = parseCookies(req.headers.cookie);
    const sessionRaw = cookies.session;
    if (!sessionRaw) {
        return res.status(401).json({ authenticated: false });
    }
    try {
        const session = JSON.parse(decodeURIComponent(sessionRaw));
        return res.status(200).json({
            authenticated: true,
            email: session.email,
            name: session.name,
            sub: session.sub
        });
    } catch (e) {
        return res.status(401).json({ authenticated: false });
    }
}
