import { useState, useEffect } from "react";

export function WhopAuthGate({ children }: { children: React.ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) {
                    setAuthenticated(true);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null;
    if (authenticated) return <>{children}</>;

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
                <div style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "32px",
                }}>
                    Log in with your Whop account to continue
                </div>

                <a
                    href="/api/auth/login"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "14px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#ff6243",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "none",
                        boxSizing: "border-box",
                        transition: "opacity 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.659 13.916 24 3.1 19.868 21.6h-4.991l-1.92-7.962h-.056L10.982 21.6H5.99L2.836 7.641l4.57-.463 1.636 6.786h.056l1.921-7.962h3.91l1.865 7.914h.056Z" />
                    </svg>
                    Log in with Whop
                </a>

                <div style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.3)",
                    marginTop: "20px",
                }}>
                    You need an active Whop membership to access this dashboard.
                </div>
            </div>
        </div>
    );
}
