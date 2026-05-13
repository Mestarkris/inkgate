"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const SUGGESTED = [
  "Bitcoin will reach $200k in 2026",
  "Ethereum will flip Bitcoin",
  "DeFi will replace traditional banking",
  "AI agents will replace human traders",
  "0G Mainnet will be the top ZK rollup",
  "Memecoins are a net positive for crypto",
];

export default function DebatePage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => { setMounted(true); }, []);

  async function startDebate() {
    if (!topic.trim()) { setError("Please enter a debate topic"); return; }
    setLoading(true);
    setError(null);
    try {
      const { createWalletClient, custom, defineChain, parseUnits } = await import("viem");
      const ogChain = defineChain({
        id: 16661,
        name: "0G Mainnet",
        nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
        rpcUrls: { default: { http: ["https://rpc.ogChain.tech"] } },
      });
      const walletClient = createWalletClient({
        chain: ogChain,
        transport: custom(window.ethereum),
      });
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
      const address = accounts[0] as `0x${string}`;
      const A0GI_ADDRESS = "process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT" as `0x${string}`;
      const RECIPIENT = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT as `0x${string}`;
      const AMOUNT = parseUnits("0.01", 6);
      const paddedRecipient = RECIPIENT.slice(2).padStart(64, "0");
      const paddedAmount = AMOUNT.toString(16).padStart(64, "0");
      const transferData = ("0xa9059cbb" + paddedRecipient + paddedAmount) as `0x${string}`;
      const hash = await walletClient.sendTransaction({
        account: address,
        to: A0GI_ADDRESS,
        data: transferData,
        chain: ogChain,
      });
      setTxHash(hash);
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), txHash: hash }),
      });
      if (!response.ok) throw new Error("Debate failed");
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copyHash() {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (result) {
    const oklink = "https://chainscan.0g.ai/tx/";
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0" }}>
        <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/debate" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>New debate</Link>
          <span style={{ fontSize: 13, color: "#6366f1" }}>InkGate — Agent Debate</span>
        </nav>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: "#e8e8f0" }}>{result.topic}</h1>
          <div style={{ display: "inline-block", background: result.winner === "bull" ? "#22c55e20" : "#f8717120", border: "1px solid " + (result.winner === "bull" ? "#22c55e" : "#f87171"), borderRadius: 20, padding: "6px 20px", fontSize: 14, fontWeight: 700, color: result.winner === "bull" ? "#22c55e" : "#f87171", marginBottom: 40 }}>
            {result.winner === "bull" ? "BULL WINS" : "BEAR WINS"}
          </div>

          {/* Arguments */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
            <div style={{ background: "#12121e", border: "2px solid " + (result.winner === "bull" ? "#22c55e" : "#1e1e2e"), borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 11, background: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e30", borderRadius: 12, padding: "2px 10px" }}>BULL</span>
                {result.winner === "bull" && <span style={{ fontSize: 11, color: "#22c55e" }}>Winner</span>}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "#9ca3af" }}>
                {result.bull.split("\n").filter((p: string) => p.trim()).map((para: string, i: number) => (
                  <p key={i} style={{ marginBottom: 12 }}>{para}</p>
                ))}
              </div>
            </div>
            <div style={{ background: "#12121e", border: "2px solid " + (result.winner === "bear" ? "#f87171" : "#1e1e2e"), borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 11, background: "#f8717120", color: "#f87171", border: "1px solid #f8717130", borderRadius: 12, padding: "2px 10px" }}>BEAR</span>
                {result.winner === "bear" && <span style={{ fontSize: 11, color: "#f87171" }}>Winner</span>}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "#9ca3af" }}>
                {result.bear.split("\n").filter((p: string) => p.trim()).map((para: string, i: number) => (
                  <p key={i} style={{ marginBottom: 12 }}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Judge verdict */}
          <div style={{ background: "#12121e", border: "1px solid #6366f1", borderRadius: 16, padding: 20, marginBottom: 32 }}>
            <p style={{ fontSize: 12, color: "#6366f1", marginBottom: 12, fontWeight: 600 }}>Judge Agent verdict</p>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#9ca3af" }}>{result.reasoning}</p>
          </div>

          {/* Transactions */}
          {txHash && (
            <div style={{ background: "#0d1f13", border: "1px solid #166534", borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#22c55e", marginBottom: 16 }}>Agent debate pipeline</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>User payment</p>
                  <a href={oklink + txHash} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{txHash.slice(0, 20) + "..."}</a>
                </div>
                {result.agentPipeline && (
                  <>
                    <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                      <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Orchestrator paid Bull Agent ($0.004)</p>
                      <a href={oklink + result.agentPipeline.bullTx} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{result.agentPipeline.bullTx.slice(0, 20) + "..."}</a>
                    </div>
                    <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                      <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Orchestrator paid Bear Agent ($0.004)</p>
                      <a href={oklink + result.agentPipeline.bearTx} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{result.agentPipeline.bearTx.slice(0, 20) + "..."}</a>
                    </div>
                    <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                      <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Bull Agent paid Judge Agent ($0.002)</p>
                      <a href={oklink + result.agentPipeline.bullToJudgeTx} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{result.agentPipeline.bullToJudgeTx.slice(0, 20) + "..."}</a>
                    </div>
                    <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                      <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Bear Agent paid Judge Agent ($0.002)</p>
                      <a href={oklink + result.agentPipeline.bearToJudgeTx} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{result.agentPipeline.bearToJudgeTx.slice(0, 20) + "..."}</a>
                    </div>
                  </>
                )}
              </div>
              <button onClick={copyHash} style={{ marginTop: 12, fontSize: 12, background: "#1e1e2e", color: "#e8e8f0", padding: "6px 14px", borderRadius: 8, border: "1px solid #374151", cursor: "pointer" }}>
                {copied ? "Copied!" : "Copy TX Hash"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", display: "flex", flexDirection: "column" }}>
      <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>Back</Link>
        <span style={{ fontSize: 13, color: "#6366f1" }}>InkGate — Agent Debate</span>
      </nav>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 520 }}>
          <div style={{ display: "inline-block", background: "#6366f120", border: "1px solid #6366f133", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#818cf8", marginBottom: 20 }}>
            Bull Agent vs Bear Agent · Judge decides winner
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: "#e8e8f0" }}>Agent Debate</h1>
          <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 32, lineHeight: 1.6 }}>
            Two AI agents argue opposite sides of any crypto topic. A Judge Agent decides the winner. All payments settle onchain.
          </p>

          {/* Suggested topics */}
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>Suggested topics</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {SUGGESTED.map((s, i) => (
              <button
                key={i}
                onClick={() => setTopic(s)}
                style={{ fontSize: 12, padding: "6px 12px", borderRadius: 20, border: "1px solid #1e1e2e", background: topic === s ? "#6366f120" : "#12121e", color: topic === s ? "#818cf8" : "#6b7280", cursor: "pointer" }}
              >
                {s}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Or type your own debate topic..."
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #1e1e2e", background: "#12121e", color: "#e8e8f0", fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }}
          />

          {/* Agent breakdown */}
          <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: "#22c55e" }}>Bull Agent argues FOR</span>
              <span style={{ color: "#22c55e" }}>$0.004</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: "#f87171" }}>Bear Agent argues AGAINST</span>
              <span style={{ color: "#22c55e" }}>$0.004</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#6366f1" }}>Judge Agent decides winner</span>
              <span style={{ color: "#22c55e" }}>$0.004</span>
            </div>
          </div>

          <div style={{ background: "#0a0a0f", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "center" }}>
            <p style={{ fontSize: 36, fontWeight: 800, color: "#6366f1", marginBottom: 4 }}>0.01</p>
            <p style={{ fontSize: 12, color: "#4b5563" }}>A0GI on 0G Mainnet · 3 agents · 4 onchain payments</p>
          </div>

          {!mounted ? (
            <div style={{ height: 48 }} />
          ) : !isConnected ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ConnectButton label="Connect Wallet to Start Debate" />
            </div>
          ) : (
            <button
              onClick={startDebate}
              disabled={loading || !topic.trim()}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: loading || !topic.trim() ? "#3730a3" : "#6366f1", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading || !topic.trim() ? "not-allowed" : "pointer" }}
            >
              {loading ? "Agents debating..." : "Pay 0.01 & Start Debate"}
            </button>
          )}

          {error && (
            <p style={{ fontSize: 13, color: "#f87171", marginTop: 12, textAlign: "center" }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}