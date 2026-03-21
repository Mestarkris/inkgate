"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const AGENTS = [
  {
    name: "Research Agent",
    role: "Searches web for live data on every topic",
    address: process.env.NEXT_PUBLIC_AGENT1_ADDRESS ?? "",
    earns: "$0.004 per article",
    color: "#6366f1",
  },
  {
    name: "Fact Check Agent",
    role: "Verifies all research claims before writing",
    address: process.env.NEXT_PUBLIC_AGENT2_ADDRESS ?? "",
    earns: "$0.003 per article",
    color: "#22c55e",
  },
  {
    name: "Writer Agent",
    role: "Writes the final polished article",
    address: process.env.NEXT_PUBLIC_AGENT3_ADDRESS ?? "",
    earns: "$0.003 per article",
    color: "#f59e0b",
  },
];

export default function AgentsPage() {
  const [stats, setStats] = useState({ totalSales: 0, totalEarned: "0.00" });
  const [walletData, setWalletData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});

    AGENTS.forEach((agent) => {
      if (agent.address) {
        fetch("/api/wallet?address=" + agent.address)
          .then((r) => r.json())
          .then((d) => setWalletData(prev => ({ ...prev, [agent.address]: d })))
          .catch(() => {});
      }
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0" }}>
      <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>Back</Link>
        <span style={{ fontSize: 13, color: "#6366f1" }}>InkGate — Agent Status</span>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "inline-block", background: "#22c55e20", border: "1px solid #22c55e33", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#22c55e", marginBottom: 20 }}>
          Live agent wallets · Powered by OKX Wallet API
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: "#e8e8f0" }}>Agent Status</h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 40, lineHeight: 1.6 }}>
          Every InkGate agent is a real autonomous wallet on X Layer. Balances queried live via OKX Wallet API. All transactions publicly verifiable on OKLink.
        </p>

        <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
          <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: "20px 28px", minWidth: 140 }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#6366f1", marginBottom: 4 }}>{stats.totalSales}</p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>Total articles processed</p>
          </div>
          <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: "20px 28px", minWidth: 140 }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#22c55e", marginBottom: 4 }}>${stats.totalEarned}</p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>Total USDC earned</p>
          </div>
          <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: "20px 28px", minWidth: 140 }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#f59e0b", marginBottom: 4 }}>3</p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>Active agents</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
          {AGENTS.map((agent, i) => {
            const oklinkBase = "https://www.oklink.com/xlayer/address/" + agent.address;
            const wallet = walletData[agent.address];
            return (
              <div key={i} style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }}></div>
                      <span style={{ fontSize: 11, color: "#22c55e" }}>Online · X Layer Mainnet</span>
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>{agent.name}</h2>
                    <p style={{ fontSize: 13, color: "#6b7280" }}>{agent.role}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Earns per article</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: agent.color }}>{agent.earns}</p>
                  </div>
                </div>

                {/* OKX Wallet API balances */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <div style={{ background: "#0a0a0f", borderRadius: 8, padding: "8px 12px", flex: 1 }}>
                    <p style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>USDC Balance</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>
                      ${wallet ? wallet.usdcBalance ?? "0" : "..."}
                    </p>
                  </div>
                  <div style={{ background: "#0a0a0f", borderRadius: 8, padding: "8px 12px", flex: 1 }}>
                    <p style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>OKB Balance</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>
                      {wallet ? wallet.okbBalance ?? "0" : "..."} OKB
                    </p>
                  </div>
                  <div style={{ background: "#0a0a0f", borderRadius: 8, padding: "8px 12px", flex: 1 }}>
                    <p style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>Transactions</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#6366f1" }}>
                      {wallet ? wallet.totalTransactions ?? "0" : "..."}
                    </p>
                  </div>
                </div>

                <div style={{ background: "#0a0a0f", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Wallet address on X Layer</p>
                  <p style={{ fontSize: 12, color: "#e8e8f0", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {agent.address || "Address not configured"}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a href={oklinkBase} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, background: "#12121e", color: "#6366f1", border: "1px solid #6366f1", padding: "6px 14px", borderRadius: 8, textDecoration: "none" }}>View on OKLink</a>
                  <a href={oklinkBase + "#transfers"} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, background: "#12121e", color: "#6b7280", border: "1px solid #1e1e2e", padding: "6px 14px", borderRadius: 8, textDecoration: "none" }}>Transaction history</a>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", marginBottom: 16 }}>How agent payments work</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "User pays $0.01 USDC to the Orchestrator wallet on X Layer",
              "Orchestrator autonomously splits and sends USDC to all 3 agent wallets",
              "Each agent does its job then pays the next agent from its own wallet",
              "All transactions are permanently recorded on X Layer and verifiable on OKLink",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#6366f120", border: "1px solid #6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#6366f1", flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", marginBottom: 8 }}>OKX Wallet API integration</p>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12, lineHeight: 1.6 }}>
            Agent wallet balances are queried live using the OKX Wallet API. This is part of the Onchain OS infrastructure that powers InkGate.
          </p>
          <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
            <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>API endpoint used</p>
            <p style={{ fontSize: 12, color: "#6366f1", fontFamily: "monospace" }}>
              GET web3.okx.com/api/v5/wallet/asset/wallet-all-token-assets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}