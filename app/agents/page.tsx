"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const AGENTS = [
  { name: "Research Agent", role: "Fetches live crypto data via 0G Compute (TEE-verified)", address: "", earns: "0.004 A0GI per article", color: "#6366f1", capability: "0G Compute + Market Data" },
  { name: "Fact Check Agent", role: "Verifies research via TEE inference on 0G Compute", address: "", earns: "0.003 A0GI per article", color: "#22c55e", capability: "0G Compute TEE/TeeML" },
  { name: "Writer Agent", role: "Writes articles, stores permanently on 0G Storage", address: "", earns: "0.003 A0GI per article", color: "#f59e0b", capability: "0G Compute + 0G Storage" },
  { name: "Orchestrator", role: "Routes A0GI payments, manages Agent ID on 0G", address: "", earns: "0.01 A0GI per request", color: "#ec4899", capability: "0G Agent ID + Payment Routing" },
];

export const dynamic = "force-dynamic";

export default function AgentsPage() {
  const [stats, setStats] = useState({ articlesGenerated: 0, totalPaid: 0 });
  const [agentData, setAgentData] = useState<any[]>([]);
  const [walletBalances, setWalletBalances] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(d => setStats(d)).catch(() => {});
    fetch("/api/agent-id").then(r => r.json()).then(d => {
      if (d.agents) setAgentData(d.agents);
    }).catch(() => {});
    fetch("/api/agent-wallet").then(r => r.json()).then(d => {
      if (d.agents) {
        const balances: Record<string, string> = {};
        d.agents.forEach((a: any) => { balances[a.id] = a.balances?.a0gi ?? "0"; });
        setWalletBalances(balances);
      }
    }).catch(() => {});
  }, []);

  const agentIds = ["research", "factcheck", "writer", "orchestrator"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "monospace" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        <Link href="/" style={{ color: "#6366f1", textDecoration: "none", fontSize: 13 }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>InkGate Agents</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 8 }}>Live agent wallets · Powered by 0G Network</p>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 32 }}>
          Every InkGate agent is a real autonomous wallet on 0G. Identities stored on 0G Storage via Agent ID protocol. All transactions verifiable on 0G Explorer.
        </p>

        <div style={{ display: "grid", gap: 16, marginBottom: 32 }}>
          <div style={{ background: "#111", border: "1px solid #1f1f2e", borderRadius: 12, padding: 20, display: "flex", gap: 32 }}>
            <div><p style={{ fontSize: 24, fontWeight: 800, color: "#6366f1" }}>{stats.articlesGenerated ?? 0}</p><p style={{ fontSize: 12, color: "#6b7280" }}>Articles Generated</p></div>
            <div><p style={{ fontSize: 24, fontWeight: 800, color: "#22c55e" }}>{Number(stats.totalPaid ?? 0).toFixed(3)}</p><p style={{ fontSize: 12, color: "#6b7280" }}>Total A0GI earned</p></div>
            <div><p style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b" }}>4</p><p style={{ fontSize: 12, color: "#6b7280" }}>Active Agents</p></div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {AGENTS.map((agent, i) => {
            const liveAgent = agentData.find(a => a.id === agentIds[i]);
            const address = liveAgent?.address ?? "";
            const balance = walletBalances[agentIds[i]] ?? "...";
            return (
              <div key={i} style={{ background: "#111", border: "1px solid #1f1f2e", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>{agent.name}</h2>
                    <p style={{ fontSize: 13, color: "#6b7280" }}>{agent.role}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: agent.color }}>{agent.earns}</p>
                    <span style={{ fontSize: 11, color: "#22c55e" }}>Online · 0G Mainnet</span>
                  </div>
                </div>
                <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <p style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>A0GI Balance</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#e8e8f0" }}>{balance} A0GI</p>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>0G Capability</p>
                  <span style={{ background: "#1f1f2e", padding: "2px 8px", borderRadius: 4, fontSize: 11, color: agent.color }}>{agent.capability}</span>
                </div>
                <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Wallet address on 0G</p>
                <p style={{ fontSize: 11, color: "#4b5563", wordBreak: "break-all" }}>{address || "Loading..."}</p>
                {address && (
                  <a href={"https://chainscan.0g.ai/address/" + address} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#6366f1", textDecoration: "none" }}>View on 0G Explorer →</a>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, background: "#111", border: "1px solid #1f1f2e", borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", marginBottom: 8 }}>0G Agent ID Integration</p>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
            Agent identities and state are stored on 0G Storage via the Agent ID protocol. Balances queried live from 0G chain.
          </p>
          <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 11, color: "#6366f1" }}>
            GET /api/agent-id → 0G Storage (Agent ID protocol)<br />
            GET /api/agent-wallet → 0G Mainnet RPC<br />
            POST inference → 0G Compute (qwen-2.5-7b TEE verified)
          </div>
        </div>

        <div style={{ marginTop: 24, background: "#111", border: "1px solid #1f1f2e", borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>How it works</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "User pays 0.01 A0GI to the Orchestrator wallet on 0G",
              "Orchestrator autonomously splits and sends A0GI to all 3 agent wallets",
              "Each agent calls 0G Compute for TEE-verified inference",
              "Final article stored permanently on 0G Storage",
              "All transactions permanently recorded on 0G chain",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ color: "#6366f1", fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
