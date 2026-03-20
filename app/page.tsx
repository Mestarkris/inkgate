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

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            ✦
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>InkGate</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 20, padding: "6px 12px", fontSize: 12, color: "#6366f1" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
          X Layer Mainnet
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 40px" }}>
        <div style={{ display: "inline-block", background: "#12121e", border: "1px solid #6366f133", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#818cf8", marginBottom: 20 }}>
          Powered by x402 · 0 gas · Instant settlement
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 16, background: "linear-gradient(135deg, #e8e8f0 0%, #818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          InkGate Research,<br />pay to unlock.
        </h1>
        <p style={{ color: "#6b7280", fontSize: 17, maxWidth: 480, lineHeight: 1.6 }}>
          Every article is researched and written live by InkGate at the moment you pay. $0.01 USDC. No account needed.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: "20px 28px", minWidth: 140 }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#6366f1", marginBottom: 4 }}>{stats.totalSales}</p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>InkGate Research · Live web data · Unlocks instantly</p>
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

      {/* Filter tabs */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 24px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: filter === cat.value ? "1px solid #6366f1" : "1px solid #1e1e2e",
                background: filter === cat.value ? "#6366f120" : "#12121e",
                color: filter === cat.value ? "#818cf8" : "#6b7280",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article grid */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
        {filtered.map((article, i) => (
          <Link
            key={article.slug}
            href={"/article/" + article.slug}
            style={{ textDecoration: "none" }}
          >
            <div style={{
              background: "#12121e",
              border: "1px solid #1e1e2e",
              borderRadius: 16,
              padding: "24px",
              cursor: "pointer",
              transition: "border-color 0.15s",
              height: "100%",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e2e")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: "#6b7280", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 12, padding: "2px 10px" }}>
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", background: "#22c55e15", border: "1px solid #22c55e30", borderRadius: 12, padding: "2px 10px" }}>
                  $0.01
                </span>
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e8e8f0", lineHeight: 1.4, marginBottom: 12 }}>
                {article.title}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#4b5563" }}>
                <span>InkGate Research</span>
                <span>·</span>
                <span>Live web data</span>
                <span>·</span>
                <span>USDC on X Layer</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}