import { useState, useEffect } from "react";

type AuthState = "loading" | "login" | "check_email" | "kicked" | "authenticated";

interface UserInfo {
    email: string;
    name: string;
    status: string;
}

export function MagicLinkGate({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>("loading");
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [kickedMessage, setKickedMessage] = useState("");

    useEffect(() => {
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) {
                    setUserInfo({ email: data.email, name: data.name, status: data.status });
                    setAuthState("authenticated");
                } else if (data.reason === "session_revoked") {
                    setKickedMessage("You were logged out because your account was accessed from another device.");
                    setAuthState("kicked");
                } else if (data.reason === "session_expired") {
                    setKickedMessage("Your session has expired. Please log in again.");
                    setAuthState("kicked");
                } else if (data.reason === "subscription_inactive") {
                    setKickedMessage("Your subscription is no longer active. Please resubscribe at auctionmentor.io to regain access.");
                    setAuthState("kicked");
                } else {
                    setAuthState("login");
                }
            })
            .catch(() => setAuthState("login"));
    }, []);

    const handleLogin = async () => {
        const trimmed = email.trim();
        if (!trimmed || !trimmed.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        setError("");
        setSending(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: trimmed }),
            });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
                setSending(false);
            } else {
                setAuthState("check_email");
            }
        } catch {
            setError("Something went wrong. Please try again.");
            setSending(false);
        }
    };

    if (authState === "loading") return null;
    if (authState === "authenticated") return <>{children}</>;

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)",
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            <div style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "48px 40px",
                width: "100%",
                maxWidth: "400px",
                textAlign: "center",
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            }}>
                <div style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "8px",
                    letterSpacing: "-0.5px",
                }}>
                    Auction Mentor
                </div>

                {/* ─── Login Form ───────────────────────────────── */}
                {authState === "login" && (
                    <>
                        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "28px" }}>
                            Enter the email you subscribed with to receive a login link.
                        </div>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            placeholder="your@email.com"
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "14px 16px",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "10px",
                                background: "rgba(255,255,255,0.06)",
                                color: "#fff",
                                fontSize: "15px",
                                fontFamily: "Inter, system-ui, sans-serif",
                                outline: "none",
                                marginBottom: "12px",
                            }}
                        />

                        {error && (
                            <div style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={sending}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                width: "100%",
                                padding: "14px",
                                borderRadius: "10px",
                                border: "none",
                                background: "linear-gradient(135deg, #5FA074, #4A7C59)",
                                color: "#fff",
                                fontSize: "16px",
                                fontWeight: 600,
                                cursor: sending ? "not-allowed" : "pointer",
                                opacity: sending ? 0.6 : 1,
                                boxSizing: "border-box",
                                transition: "opacity 0.2s",
                                fontFamily: "Inter, system-ui, sans-serif",
                            }}
                        >
                            {sending ? "Sending..." : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    Send Login Link
                                </>
                            )}
                        </button>

                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "20px" }}>
                            You need an active subscription to access this dashboard.
                        </div>
                    </>
                )}

                {/* ─── Check Email ──────────────────────────────── */}
                {authState === "check_email" && (
                    <>
                        <div style={{ fontSize: "48px", margin: "8px 0 16px" }}>📧</div>
                        <div style={{ color: "#c8c8c8", fontSize: "15px", lineHeight: 1.6, marginBottom: "8px" }}>
                            Check your email for a login link.
                        </div>
                        <div style={{ color: "#5FA074", fontSize: "14px", fontWeight: 600, marginBottom: "24px" }}>
                            {email.trim()}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", lineHeight: 1.5, marginBottom: "24px" }}>
                            The link expires in 10 minutes and can only be used once.<br />
                            Check your spam folder if you don't see it.
                        </div>
                        <button
                            onClick={() => { setAuthState("login"); setSending(false); setError(""); }}
                            style={{
                                padding: "10px 24px",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "8px",
                                background: "transparent",
                                color: "rgba(255,255,255,0.5)",
                                fontSize: "14px",
                                cursor: "pointer",
                                fontFamily: "Inter, system-ui, sans-serif",
                            }}
                        >
                            Use a different email
                        </button>
                    </>
                )}

                {/* ─── Kicked / Error State ─────────────────────── */}
                {authState === "kicked" && (
                    <>
                        <div style={{ fontSize: "48px", margin: "8px 0 16px" }}>🔒</div>
                        <div style={{ color: "#c8c8c8", fontSize: "15px", lineHeight: 1.6, marginBottom: "24px" }}>
                            {kickedMessage}
                        </div>
                        <button
                            onClick={() => { setAuthState("login"); setSending(false); setError(""); }}
                            style={{
                                padding: "14px 32px",
                                border: "none",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #5FA074, #4A7C59)",
                                color: "#fff",
                                fontSize: "15px",
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "Inter, system-ui, sans-serif",
                            }}
                        >
                            Log In Again
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
