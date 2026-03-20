"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { articles } from "@/lib/articles";

const categories = [
  { label: "All", value: "all" },
  { label: "Bitcoin", value: "bitcoin" },
  { label: "DeFi", value: "defi" },
  { label: "AI", value: "ai" },
  { label: "Regulation", value: "regulation" },
];

export default function Home() {
  const [stats, setStats] = useState({ totalSales: 0, totalEarned: "0.00" });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  const filtered = filter === "all"
    ? articles
    : articles.filter((a) => a.slug.includes(filter) || a.title.toLowerCase().includes(filter));

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0" }}>
      <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700 }}>I</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>InkGate</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 20, padding: "6px 12px", fontSize: 12, color: "#6366f1" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
          X Layer Mainnet
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 40px" }}>
        <div style={{ display: "inline-block", background: "#12121e", border: "1px solid #6366f133", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#818cf8", marginBottom: 20 }}>
          Powered by x402 · OKX Market API · X Layer
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 16, color: "#e8e8f0" }}>
          AI research,<br />pay to unlock.
        </h1>
        <p style={{ color: "#6b7280", fontSize: 17, maxWidth: 480, lineHeight: 1.6 }}>
          3 autonomous AI agents research, fact-check and write every article. Each agent gets paid onchain. $0.01 USDC. No account needed.
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap" }}>
          <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: "20px 28px", minWidth: 140 }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#6366f1", marginBottom: 4 }}>{stats.totalSales}</p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>Articles unlocked</p>
          </div>
          <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: "20px 28px", minWidth: 140 }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#22c55e", marginBottom: 4 }}>${stats.totalEarned}</p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>USDC earned</p>
          </div>
          <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: "20px 28px", minWidth: 140 }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#f59e0b", marginBottom: 4 }}>{articles.length}</p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>Topics available</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 16px" }}>
        <Link href="/custom" style={{ textDecoration: "none" }}>
          <div style={{ background: "#12121e", border: "1px solid #6366f1", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: 12 }} onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a2e")} onMouseLeave={(e) => (e.currentTarget.style.background = "#12121e")}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>Write about anything</p>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Submit any topic · 3 agents research it live · $0.01 USDC</p>
            </div>
            <div style={{ background: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 20px", borderRadius: 10, whiteSpace: "nowrap", marginLeft: 16 }}>Try it</div>
          </div>
        </Link>

        <Link href="/trending" style={{ textDecoration: "none" }}>
          <div style={{ background: "#12121e", border: "1px solid #f59e0b", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: 12 }} onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a0e")} onMouseLeave={(e) => (e.currentTarget.style.background = "#12121e")}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>Trending topics</p>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Live OKX market data · Agents write what is moving now</p>
            </div>
            <div style={{ background: "#f59e0b", color: "#000", fontSize: 13, fontWeight: 600, padding: "8px 20px", borderRadius: 10, whiteSpace: "nowrap", marginLeft: 16 }}>See trends</div>
          </div>
        </Link>

        <Link href="/debate" style={{ textDecoration: "none" }}>
          <div style={{ background: "#12121e", border: "1px solid #f87171", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: 12 }} onMouseEnter={(e) => (e.currentTarget.style.background = "#1a0e0e")} onMouseLeave={(e) => (e.currentTarget.style.background = "#12121e")}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>Agent Debate</p>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Bull vs Bear · Judge Agent decides · 4 onchain payments</p>
            </div>
            <div style={{ background: "#f87171", color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 20px", borderRadius: 10, whiteSpace: "nowrap", marginLeft: 16 }}>Debate</div>
          </div>
        </Link>

        <Link href="/predictions" style={{ textDecoration: "none" }}>
          <div style={{ background: "#12121e", border: "1px solid #22c55e", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: 12 }} onMouseEnter={(e) => (e.currentTarget.style.background = "#0e1a0e")} onMouseLeave={(e) => (e.currentTarget.style.background = "#12121e")}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>Prediction Market</p>
              <p style={{ fontSize: 13, color: "#6b7280" }}>AI makes price predictions · Bet USDC · Auto settlement onchain</p>
            </div>
            <div style={{ background: "#22c55e", color: "#000", fontSize: 13, fontWeight: 600, padding: "8px 20px", borderRadius: 10, whiteSpace: "nowrap", marginLeft: 16 }}>Predict</div>
          </div>
        </Link>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 32px" }}>
        <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: "20px 24px" }}>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>How the agent pipeline works</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ background: "#0a0a0f", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", marginBottom: 4 }}>Research Agent</p>
              <p style={{ fontSize: 11, color: "#6b7280" }}>Pulls live OKX market data and researches topic</p>
              <p style={{ fontSize: 12, color: "#22c55e", marginTop: 6 }}>earns $0.004</p>
            </div>
            <div style={{ background: "#0a0a0f", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", marginBottom: 4 }}>Fact Check Agent</p>
              <p style={{ fontSize: 11, color: "#6b7280" }}>Verifies all research claims</p>
              <p style={{ fontSize: 12, color: "#22c55e", marginTop: 6 }}>earns $0.003</p>
            </div>
            <div style={{ background: "#0a0a0f", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", marginBottom: 4 }}>Writer Agent</p>
              <p style={{ fontSize: 11, color: "#6b7280" }}>Writes the final article</p>
              <p style={{ fontSize: 12, color: "#22c55e", marginTop: 6 }}>earns $0.003</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 24px" }}>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>Browse curated topics</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button key={cat.value} onClick={() => setFilter(cat.value)} style={{ padding: "6px 16px", borderRadius: 20, border: filter === cat.value ? "1px solid #6366f1" : "1px solid #1e1e2e", background: filter === cat.value ? "#6366f120" : "#12121e", color: filter === cat.value ? "#818cf8" : "#6b7280", fontSize: 13, cursor: "pointer" }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
        {filtered.map((article, i) => (
          <Link key={article.slug} href={"/article/" + article.slug} style={{ textDecoration: "none" }}>
            <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: "24px", cursor: "pointer", height: "100%" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e2e")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: "#6b7280", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 12, padding: "2px 10px" }}>#{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", background: "#22c55e15", border: "1px solid #22c55e30", borderRadius: 12, padding: "2px 10px" }}>$0.01</span>
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e8e8f0", lineHeight: 1.4, marginBottom: 12 }}>{article.title}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#4b5563" }}>
                <span>InkGate Research</span>
                <span>·</span>
                <span>3 agents</span>
                <span>·</span>
                <span>Live OKX data</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}