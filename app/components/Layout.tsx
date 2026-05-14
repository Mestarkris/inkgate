"use client";
import dynamic from "next/dynamic";
const ParticleCanvas = dynamic(() => import("./ParticleCanvas"), { ssr: false });
import Link from "next/link";
const ConnectButton = dynamic(() => import("../providers").then(m => ({ default: m.ConnectButton })), { ssr: false });

export default function Layout({ children, heroContent }: { children: React.ReactNode; heroContent?: React.ReactNode }) {
  return (
    <div style={{ background: "#050508", color: "#f0f0f8", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#050508;--surface:#0c0c14;--surface2:#12121e;--border:#1e1e2e;--text:#f0f0f8;--muted:#6b6b8a;--accent:#7b6ef6;--accent2:#4fd1a5;--warn:#f0a04b;--font:'Syne',sans-serif;--mono:'DM Mono',monospace}
        .wrap{max-width:1100px;margin:0 auto;padding:0 24px}
        .ig-nav{border-bottom:1px solid var(--border);padding:16px 0;position:relative;z-index:10;background:rgba(5,5,8,0.9);backdrop-filter:blur(12px)}
        .ig-nav-inner{display:flex;justify-content:space-between;align-items:center}
        .ig-logo{font-size:20px;font-weight:800;letter-spacing:-0.5px;font-family:var(--font);text-decoration:none;color:var(--text)}
        .ig-logo span{color:var(--accent)}
        .ig-nav-links{display:flex;gap:24px;font-size:13px}
        .ig-nav-links a{color:var(--muted);text-decoration:none;font-family:var(--font);transition:color 0.2s}
        .ig-nav-links a:hover{color:var(--text)}
        .ig-page-hero{position:relative;overflow:hidden;border-bottom:1px solid var(--border);min-height:180px}
        .ig-page-hero-content{position:relative;z-index:2;padding:48px 0 36px}
        .ig-footer{padding:32px 0;text-align:center;color:var(--muted);font-size:12px;font-family:var(--mono);border-top:1px solid var(--border);background:var(--bg)}
        .ig-footer a{color:var(--accent);text-decoration:none}
        .btn-primary{background:var(--accent);color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;border:none;cursor:pointer;font-family:var(--font);transition:background 0.2s}
        .btn-primary:hover{background:#6a5ef0}
        .btn-secondary{background:transparent;color:var(--text);padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;border:1px solid var(--border);cursor:pointer;font-family:var(--font);transition:all 0.2s}
        .btn-secondary:hover{border-color:var(--accent);color:var(--accent)}
        .section-label{font-size:11px;font-family:var(--mono);color:var(--accent);margin-bottom:16px;letter-spacing:2px}
        .section-title{font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:32px;font-family:var(--font)}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:var(--accent2);animation:pulse 2s infinite;display:inline-block;box-shadow:0 0 8px var(--accent2)}
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 8px var(--accent2)}50%{opacity:0.4;box-shadow:0 0 3px var(--accent2)}}
      `}</style>

      {/* NAV */}
      <nav className="ig-nav">
        <div className="wrap">
          <div className="ig-nav-inner">
            <Link href="/" className="ig-logo">Ink<span>Gate</span></Link>
            <div className="ig-nav-links">
              <Link href="/trending">Articles</Link>
              <Link href="/custom">Custom</Link>
              <Link href="/chat">Chat</Link>
              <Link href="/debate">Debate</Link>
              <Link href="/predictions">Predictions</Link>
              <Link href="/agents">Agents</Link>
            </div>
            <ConnectButton chainStatus="icon" showBalance={false} />
          </div>
        </div>
      </nav>

      {/* ANIMATED HERO BANNER */}
      {heroContent && (
        <div className="ig-page-hero">
          <ParticleCanvas />
          <div className="ig-page-hero-content">
            <div className="wrap">{heroContent}</div>
          </div>
        </div>
      )}

      <main>{children}</main>

      <footer className="ig-footer">
        <div className="wrap">
          InkGate · Built for 0G APAC Hackathon 2026 ·{" "}
          <a href="https://inkgate.vercel.app">inkgate.vercel.app</a>
        </div>
      </footer>
    </div>
  );
}
