"use client";
import { ConnectButton } from "./providers";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [stats, setStats] = useState({ articlesGenerated: 0, totalPaid: 0 });

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(d => setStats(d)).catch(() => {});
  }, []);

  return (
    <div style={{ background: "#050508", color: "#f0f0f8", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#050508;--surface:#0c0c14;--surface2:#12121e;--border:#1e1e2e;--text:#f0f0f8;--muted:#6b6b8a;--accent:#7b6ef6;--accent2:#4fd1a5;--warn:#f0a04b;--font:'Syne',sans-serif;--mono:'DM Mono',monospace}
        body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh}
        .wrap{max-width:1100px;margin:0 auto;padding:0 24px}
        nav{border-bottom:1px solid var(--border);padding:16px 0}
        .nav-inner{display:flex;justify-content:space-between;align-items:center}
        .logo{font-size:20px;font-weight:800;letter-spacing:-0.5px;font-family:var(--font)}
        .logo span{color:var(--accent)}
        .nav-tag{background:var(--surface2);border:1px solid var(--border);padding:4px 12px;border-radius:20px;font-size:11px;color:var(--accent2);font-family:var(--mono)}
        .nav-links{display:flex;gap:24px;font-size:13px;color:var(--muted)}
        .nav-links a{color:var(--muted);text-decoration:none;font-family:var(--font)}
        .nav-links a:hover{color:var(--text)}
        .hero{padding:80px 0 60px;border-bottom:1px solid var(--border)}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);padding:6px 14px;border-radius:20px;font-size:11px;color:var(--muted);font-family:var(--mono);margin-bottom:32px}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:var(--accent2);animation:pulse 2s infinite;display:inline-block}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .hero h1{font-size:clamp(42px,6vw,80px);font-weight:800;line-height:1.0;letter-spacing:-2px;margin-bottom:24px;font-family:var(--font)}
        .hero h1 em{font-style:normal;color:var(--accent)}
        .hero-sub{font-size:16px;color:var(--muted);max-width:520px;line-height:1.7;margin-bottom:40px;font-family:var(--mono)}
        .hero-actions{display:flex;gap:12px;flex-wrap:wrap}
        .btn-primary{background:var(--accent);color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;border:none;cursor:pointer;font-family:var(--font)}
        .btn-secondary{background:transparent;color:var(--text);padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;border:1px solid var(--border);cursor:pointer;font-family:var(--font)}
        .btn-primary:hover{background:#6a5ef0}
        .btn-secondary:hover{border-color:var(--accent);color:var(--accent)}
        .stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:48px}
        .stat{background:var(--surface);padding:24px;text-align:center}
        .stat-val{font-size:32px;font-weight:800;letter-spacing:-1px;color:var(--text);font-family:var(--font)}
        .stat-val span{color:var(--accent)}
        .stat-label{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:4px}
        .section{padding:64px 0;border-bottom:1px solid var(--border)}
        .section-label{font-size:11px;font-family:var(--mono);color:var(--accent);margin-bottom:16px;letter-spacing:2px}
        .section-title{font-size:32px;font-weight:800;letter-spacing:-1px;margin-bottom:40px;font-family:var(--font)}
        .pipeline{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden}
        .pipe-step{background:var(--surface);padding:24px 20px;position:relative}
        .pipe-step:not(:last-child)::after{content:'→';position:absolute;right:-12px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:16px;z-index:2}
        .pipe-num{font-size:11px;font-family:var(--mono);color:var(--muted);margin-bottom:12px}
        .pipe-name{font-size:14px;font-weight:700;margin-bottom:6px;font-family:var(--font)}
        .pipe-role{font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:12px}
        .pipe-earn{font-size:12px;font-family:var(--mono);padding:4px 8px;border-radius:4px;display:inline-block}
        .earn-1{background:#1a1a3e;color:var(--accent)}
        .earn-2{background:#0f2e22;color:var(--accent2)}
        .earn-3{background:#2e1f0f;color:var(--warn)}
        .earn-4{background:#1a1233;color:#c084fc}
        .og-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
        .og-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;transition:border-color 0.2s}
        .og-card:hover{border-color:var(--accent)}
        .og-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:16px}
        .og-title{font-size:15px;font-weight:700;margin-bottom:8px;font-family:var(--font)}
        .og-desc{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:12px}
        .og-tag{font-size:10px;font-family:var(--mono);color:var(--muted);background:var(--surface2);padding:3px 8px;border-radius:4px;display:inline-block}
        .articles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .article-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px;cursor:pointer;transition:border-color 0.2s;text-decoration:none;display:block}
        .article-card:hover{border-color:var(--accent)}
        .article-num{font-size:10px;font-family:var(--mono);color:var(--muted);margin-bottom:10px}
        .article-title{font-size:13px;font-weight:600;line-height:1.5;margin-bottom:12px;color:var(--text);font-family:var(--font)}
        .article-price{font-size:11px;font-family:var(--mono);color:var(--accent2)}
        .features{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .feat{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px;text-decoration:none;display:block;transition:border-color 0.2s}
        .feat:hover{border-color:var(--accent)}
        .feat-icon{font-size:20px;margin-bottom:12px}
        .feat-title{font-size:14px;font-weight:700;margin-bottom:6px;color:var(--text);font-family:var(--font)}
        .feat-desc{font-size:12px;color:var(--muted);line-height:1.5}
        footer{padding:32px 0;text-align:center;color:var(--muted);font-size:12px;font-family:var(--mono)}
        footer a{color:var(--accent);text-decoration:none}
      `}</style>

      {/* NAV */}
      <nav>
        <div className="wrap">
          <div className="nav-inner">
            <div className="logo">Ink<span>Gate</span></div>
            <div className="nav-links">
              <Link href="/trending">Articles</Link>
              <Link href="/agents">Agents</Link>
              <Link href="/predictions">Predictions</Link>
              <Link href="/debate">Debate</Link>
            </div>
            <ConnectButton chainStatus="icon" showBalance={false} />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-badge"><span className="badge-dot"></span>Live on 0G Mainnet</div>
          <h1>AI research,<br /><em>pay to unlock.</em></h1>
          <p className="hero-sub">4 autonomous agents research, fact-check and write every article. Each agent earns A0GI onchain. Powered by 0G Compute, Storage, and Agent ID.</p>
          <div className="hero-actions">
            <Link href="/trending"><button className="btn-primary">Browse articles</button></Link>
            <Link href="/custom"><button className="btn-secondary">Write anything</button></Link>
            <Link href="/agents"><button className="btn-secondary">View agents</button></Link>
          </div>
          <div className="stats-row">
            <div className="stat"><div className="stat-val"><span>0.01</span> A0GI</div><div className="stat-label">per article unlock</div></div>
            <div className="stat"><div className="stat-val"><span>{stats.articlesGenerated || 0}</span></div><div className="stat-label">articles generated</div></div>
            <div className="stat"><div className="stat-val"><span>3</span> layers</div><div className="stat-label">Storage · Compute · Agent ID</div></div>
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="section">
        <div className="wrap">
          <div className="section-label">AGENT PIPELINE</div>
          <div className="section-title">How articles get made</div>
          <div className="pipeline">
            <div className="pipe-step"><div className="pipe-num">01</div><div className="pipe-name">Orchestrator</div><div className="pipe-role">Receives A0GI payment, splits to all 3 agents via 0G chain</div><span className="pipe-earn earn-4">0.01 A0GI</span></div>
            <div className="pipe-step"><div className="pipe-num">02</div><div className="pipe-name">Research Agent</div><div className="pipe-role">Fetches live crypto data via 0G Compute (TEE-verified)</div><span className="pipe-earn earn-1">0.004 A0GI</span></div>
            <div className="pipe-step"><div className="pipe-num">03</div><div className="pipe-name">Fact Check Agent</div><div className="pipe-role">Verifies all claims via TEE inference on 0G Compute</div><span className="pipe-earn earn-2">0.003 A0GI</span></div>
            <div className="pipe-step"><div className="pipe-num">04</div><div className="pipe-name">Writer Agent</div><div className="pipe-role">Writes final article, stores permanently on 0G Storage</div><span className="pipe-earn earn-3">0.003 A0GI</span></div>
          </div>
        </div>
      </section>

      {/* 0G INTEGRATIONS */}
      <section className="section">
        <div className="wrap">
          <div className="section-label">0G INTEGRATIONS</div>
          <div className="section-title">Built on 0G Labs</div>
          <div className="og-grid">
            <div className="og-card"><div className="og-icon" style={{background:"#1a1a3e",color:"#7b6ef6"}}>◈</div><div className="og-title">0G Storage</div><div className="og-desc">Every article stored permanently on 0G's decentralized storage. Agent state, predictions, and stats all persist on 0G KV layer.</div><span className="og-tag">indexer-storage-turbo.0g.ai</span></div>
            <div className="og-card"><div className="og-icon" style={{background:"#0f2e22",color:"#4fd1a5"}}>⬡</div><div className="og-title">0G Compute Network</div><div className="og-desc">All 4 agents run inference via 0G Compute using qwen/qwen-2.5-7b-instruct. Every inference is TEE/TeeML verified — cryptographically proven output.</div><span className="og-tag">TEE/TeeML verified · Provider 0xa48f...</span></div>
            <div className="og-card"><div className="og-icon" style={{background:"#2e1a3e",color:"#c084fc"}}>◎</div><div className="og-title">0G Agent ID</div><div className="og-desc">All 4 agents have tokenized identities stored on 0G Storage via the Agent ID protocol. Each agent has capabilities, price, and verifiable history.</div><span className="og-tag">InkGate-AgentID-v1</span></div>
            <div className="og-card"><div className="og-icon" style={{background:"#2e1f0f",color:"#f0a04b"}}>⬢</div><div className="og-title">0G Mainnet</div><div className="og-desc">All payments in native A0GI token. Agent wallets on 0G chain ID 16661. Every transaction verifiable on 0G Explorer.</div><span className="og-tag">chainscan.0g.ai · Chain 16661</span></div>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="section">
        <div className="wrap">
          <div className="section-label">ARTICLES</div>
          <div className="section-title">0G ecosystem research</div>
          <div className="articles-grid">
            {[
              { slug: "0g-storage-deep-dive", num: "#01", title: "0G Storage: The decentralized AI backbone explained" },
              { slug: "0g-compute-tee-inference", num: "#02", title: "0G Compute: How TEE-verified AI inference works" },
              { slug: "0g-agent-id-protocol", num: "#03", title: "0G Agent ID: Tokenizing autonomous AI agents" },
              { slug: "a0gi-token-outlook-2026", num: "#04", title: "A0GI token: What investors need to know in 2026" },
              { slug: "decentralized-ai-2026", num: "#05", title: "Decentralized AI in 2026: Why 0G matters" },
              { slug: "agentic-economy-2026", num: "#06", title: "The agentic economy: AI agents that earn and spend" },
              { slug: "0g-vs-filecoin-arweave", num: "#07", title: "0G Storage vs Filecoin vs Arweave: The 2026 comparison" },
              { slug: "ai-agents-onchain-2026", num: "#08", title: "Onchain AI agents: How 0G is leading the charge" },
              { slug: "bitcoin-2026-outlook", num: "#09", title: "Bitcoin in 2026: What the charts are saying" },
            ].map(a => (
              <Link key={a.slug} href={`/article/${a.slug}`} className="article-card">
                <div className="article-num">{a.num}</div>
                <div className="article-title">{a.title}</div>
                <div className="article-price">0.01 A0GI · 3 agents</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="wrap">
          <div className="section-label">PLATFORM</div>
          <div className="section-title">Everything InkGate offers</div>
          <div className="features">
            {[
              { href: "/trending", icon: "📝", title: "Pay-per-article", desc: "Unlock any article with 0.01 A0GI. 3 agents write it live, stored on 0G Storage permanently." },
              { href: "/custom", icon: "✍️", title: "Custom articles", desc: "Submit any topic. Agents research it live on 0G Compute and write a fresh article just for you." },
              { href: "/chat", icon: "💬", title: "Agent chat", desc: "Talk directly to any InkGate agent. Pay per message. Agent tips you back in A0GI." },
              { href: "/debate", icon: "⚔️", title: "AI debates", desc: "Bull vs Bear vs Judge. 3 agents debate any topic. 4 onchain A0GI payments." },
              { href: "/predictions", icon: "📊", title: "Predictions", desc: "AI predicts 0G, BTC, ETH prices. Bet A0GI on YES or NO. Winners paid automatically onchain." },
              { href: "/agents", icon: "🤖", title: "Agent registry", desc: "All 4 agents exposed as callable services via /api/registry. Agent-as-a-Service on 0G." },
            ].map((f, i) => (
              <Link key={i} href={f.href} className="feat">
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          InkGate · Built for 0G APAC Hackathon 2026 ·{" "}
          <a href="https://inkgate.vercel.app">inkgate.vercel.app</a>
        </div>
      </footer>
    </div>
  );
}
