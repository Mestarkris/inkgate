"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../components/Layout";

export const dynamic = "force-dynamic";

export default function TrendingPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    setTrending([
      { symbol: "0G", name: "0G Network", price: "—", change24h: "0", is0G: true },
      { symbol: "BTC", price: "83000", change24h: "1.2" },
      { symbol: "ETH", price: "2258", change24h: "-1.91" },
      { symbol: "BNB", price: "672", change24h: "-0.74" },
      { symbol: "SOL", price: "147", change24h: "2.1" },
      { symbol: "USDT", price: "1", change24h: "-0.01" },
    ]);
    fetch("/api/trending").then(r => r.json()).then(async d => {
      const coins = (d.trending || []).filter((t:any) => t.symbol !== "XRP" && t.symbol !== "USDC");
      let zeroGPrice = "—";
      let zeroGChange = "0";
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=zero-gravity&vs_currencies=usd&include_24hr_change=true");
        const data = await res.json();
        if (data["zero-gravity"]?.usd) {
          zeroGPrice = data["zero-gravity"].usd.toString();
          zeroGChange = (data["zero-gravity"].usd_24h_change ?? 0).toFixed(2);
        }
      } catch {}
      const zeroG = { symbol: "0G", name: "0G Network", price: zeroGPrice, change24h: zeroGChange, is0G: true };
      setTrending([zeroG, ...coins.slice(0, 6)]);
    }).catch(() => {});
  }, []);

  const allArticles = [
    { slug: "0g-storage-deep-dive", num: "01", title: "0G Storage: The decentralized AI backbone explained", tag: "0G STORAGE" },
    { slug: "0g-compute-tee-inference", num: "02", title: "0G Compute: How TEE-verified AI inference works", tag: "0G COMPUTE" },
    { slug: "0g-agent-id-protocol", num: "03", title: "0G Agent ID: Tokenizing autonomous AI agents", tag: "AGENT ID" },
    { slug: "0g-token-outlook-2026", num: "04", title: "0G token: What investors need to know in 2026", tag: "0G" },
    { slug: "decentralized-ai-2026", num: "05", title: "Decentralized AI in 2026: Why 0G matters", tag: "AI" },
    { slug: "agentic-economy-2026", num: "06", title: "The agentic economy: AI agents that earn and spend", tag: "ECONOMY" },
    { slug: "0g-vs-filecoin-arweave", num: "07", title: "0G Storage vs Filecoin vs Arweave: The 2026 comparison", tag: "STORAGE" },
    { slug: "ai-agents-onchain-2026", num: "08", title: "Onchain AI agents: How 0G is leading the charge", tag: "AGENTS" },
    { slug: "0g-ecosystem-projects", num: "09", title: "Top projects building on 0G in 2026", tag: "ECOSYSTEM" },
    { slug: "0g-compute-vs-centralized-ai", num: "10", title: "0G Compute vs centralized AI: The case for decentralization", tag: "COMPUTE" },
    { slug: "web4-infrastructure-2026", num: "11", title: "Web 4.0 infrastructure: How 0G fits in", tag: "WEB4" },
    { slug: "bitcoin-2026-outlook", num: "12", title: "Bitcoin in 2026: What the charts are saying", tag: "BTC" },
  ];

  return (
    <Layout heroContent={
      <div>
        <div className="section-label">ARTICLES</div>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>0G ecosystem research</h1>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:14,fontFamily:"var(--mono)"}}>Written live by 3 agents · Stored forever on 0G Storage · 0.01 0G to unlock</p>
      </div>
    }>
      <style>{`
        .trending-hero{padding:48px 0 32px;border-bottom:1px solid var(--border)}
        .trending-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:40px 0}
        .a-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px;cursor:pointer;transition:border-color 0.2s;text-decoration:none;display:block}
        .a-card:hover{border-color:var(--accent)}
        .a-num{font-size:10px;font-family:var(--mono);color:var(--muted);margin-bottom:8px}
        .a-tag{font-size:9px;font-family:var(--mono);color:var(--accent);background:rgba(123,110,246,0.1);border:1px solid rgba(123,110,246,0.2);padding:2px 7px;border-radius:3px;display:inline-block;margin-bottom:10px}
        .a-title{font-size:13px;font-weight:600;line-height:1.5;margin-bottom:12px;color:var(--text);font-family:var(--font)}
        .a-price{font-size:11px;font-family:var(--mono);color:var(--accent2)}
        .ticker{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:16px 24px;display:flex;flex-direction:row;flex-wrap:nowrap;gap:0;overflow-x:auto;margin-bottom:32px;align-items:center}
        .tick{text-align:center;min-width:100px;padding:0 16px;border-right:1px solid var(--border);flex-shrink:0}
        .tick:last-child{border-right:none}
        .tick-sym{font-size:10px;font-family:var(--mono);color:var(--muted);margin-bottom:4px}
        .tick-val{font-size:14px;font-weight:700;font-family:var(--mono);color:var(--text);margin-bottom:2px}
        .tick-up{color:var(--accent2);font-size:10px;font-family:var(--mono)}
        .tick-down{color:#f87171;font-size:10px;font-family:var(--mono)}

        @media(max-width:768px){
          .wrap{padding:0 16px!important}
          h1{font-size:26px!important;letter-spacing:-0.5px!important}
          .trending-grid,.agents-grid,.pred-grid,.debate-grid,.articles-grid,.features{grid-template-columns:1fr!important}
          .chat-wrap{grid-template-columns:1fr!important}
          .chat-sidebar{border-right:none!important;border-bottom:1px solid var(--border)!important;padding:16px!important}
          .stats-bar{grid-template-columns:1fr!important}
          .pipeline,.og-grid{grid-template-columns:1fr!important}
        }
      `}</style>
      <div className="trending-hero">
        <div className="wrap">
          <div className="section-label">ARTICLES</div>
          <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>0G ecosystem research</h1>
          <p style={{color:"var(--muted)",fontSize:15,fontFamily:"var(--mono)",marginBottom:32}}>Written live by 3 agents · Stored forever on 0G Storage · 0.01 0G to unlock</p>
          {trending.length > 0 && (
            <div className="ticker">
              {trending.slice(0,7).map((t:any,i:number) => (
                <div key={i} className="tick">
                  <div className="tick-sym" style={t.is0G ? {color:"var(--accent)"} : {}}>{t.symbol}</div>
                  <div className="tick-val" style={t.is0G ? {color:"var(--accent)"} : {}}>{t.is0G && t.price === "—" ? "0G" : "$"+Number(t.price).toLocaleString()}</div>
                  <div className={t.is0G ? "tick-up" : Number(t.change24h) >= 0 ? "tick-up" : "tick-down"}>{t.is0G && t.price === "—" ? "● LIVE" : t.is0G ? (Number(t.change24h) >= 0 ? "▲" : "▼")+" "+Math.abs(Number(t.change24h))+"%" : (Number(t.change24h) >= 0 ? "▲" : "▼")+" "+Math.abs(Number(t.change24h))+"%"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="wrap">
        <div className="trending-grid">
          {allArticles.map(a => (
            <Link key={a.slug} href={`/article/${a.slug}`} className="a-card">
              <div className="a-num">#{a.num}</div>
              <div className="a-tag">{a.tag}</div>
              <div className="a-title">{a.title}</div>
              <div className="a-price">0.01 0G · 3 agents · TEE verified</div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
