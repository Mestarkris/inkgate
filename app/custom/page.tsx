"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function CustomPage() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [agentPipeline, setAgentPipeline] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => { setMounted(true); }, []);

  async function unlock() {
    if (!topic.trim()) { setError("Please enter a topic"); return; }
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
      const response = await fetch("/api/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), txHash: hash }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error("Error " + response.status + ": " + text);
      }
      const data = await response.json();
      setContent(data.content);
      if (data.agentPipeline) setAgentPipeline(data.agentPipeline);
    } catch (err: any) {
      console.error(err);
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

  if (content) {
    const oklink = "https://chainscan.0g.ai/tx/";
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0" }}>
        <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>Back</Link>
          <span style={{ fontSize: 13, color: "#6366f1" }}>InkGate — Custom Article</span>
        </nav>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>
          <div style={{ display: "inline-block", background: "#6366f120", border: "1px solid #6366f133", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#818cf8", marginBottom: 16 }}>
            Custom topic · AI researched · Live data
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 32, color: "#e8e8f0" }}>
            {topic}
          </h1>
          <div style={{ fontSize: 16, lineHeight: 1.8, color: "#9ca3af" }}>
            {content.split("\n").filter(p => p.trim()).map((para, i) => (
              <p key={i} style={{ marginBottom: 20 }}>{para}</p>
            ))}
          </div>
          {txHash && (
            <div style={{ marginTop: 48, background: "#0d1f13", border: "1px solid #166534", borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#22c55e", marginBottom: 16 }}>
                Multi-agent pipeline complete
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>User payment</p>
                  <a href={oklink + txHash} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{txHash.slice(0, 20) + "..."}</a>
                </div>
                {agentPipeline && (
                  <>
                    <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                      <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Orchestrator paid Research Agent ($0.004)</p>
                      <a href={oklink + agentPipeline.agent1Tx} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{agentPipeline.agent1Tx.slice(0, 20) + "..."}</a>
                    </div>
                    <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                      <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Orchestrator paid Fact Check Agent ($0.003)</p>
                      <a href={oklink + agentPipeline.agent2Tx} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{agentPipeline.agent2Tx.slice(0, 20) + "..."}</a>
                    </div>
                    <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                      <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Orchestrator paid Writer Agent ($0.003)</p>
                      <a href={oklink + agentPipeline.agent3Tx} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{agentPipeline.agent3Tx.slice(0, 20) + "..."}</a>
                    </div>
                    <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                      <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Research Agent paid Fact Check Agent ($0.002)</p>
                      <a href={oklink + agentPipeline.researchTx} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{agentPipeline.researchTx.slice(0, 20) + "..."}</a>
                    </div>
                    <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12 }}>
                      <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Fact Check Agent paid Writer Agent ($0.001)</p>
                      <a href={oklink + agentPipeline.factCheckTx} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>{agentPipeline.factCheckTx.slice(0, 20) + "..."}</a>
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
        <span style={{ fontSize: 13, color: "#6366f1" }}>InkGate — Custom Article</span>
      </nav>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 480, background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 24, padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1" }}></div>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Write about anything · 3 AI agents · Live research</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#e8e8f0" }}>
            Custom Article
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
            Type any topic. Pay 0.01 A0GI. Our 3 AI agents research, verify and write a fresh article just for you.
          </p>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. The future of DeFi on 0G Mainnet"
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #1e1e2e", background: "#0a0a0f", color: "#e8e8f0", fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }}
          />
          <div style={{ background: "#0a0a0f", borderRadius: 12, padding: 12, marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>3 autonomous agents get paid onchain:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#9ca3af" }}>Research Agent</span>
                <span style={{ color: "#22c55e" }}>$0.004</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#9ca3af" }}>Fact Check Agent</span>
                <span style={{ color: "#22c55e" }}>$0.003</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#9ca3af" }}>Writer Agent</span>
                <span style={{ color: "#22c55e" }}>$0.003</span>
              </div>
            </div>
          </div>
          <div style={{ background: "#0a0a0f", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "center" }}>
            <p style={{ fontSize: 36, fontWeight: 800, color: "#6366f1", marginBottom: 4 }}>0.01</p>
            <p style={{ fontSize: 12, color: "#4b5563" }}>A0GI on 0G Mainnet · 0 gas fee · Instant</p>
          </div>
          {!mounted ? (
            <div style={{ height: 48 }} />
          ) : !isConnected ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ConnectButton label="Connect Wallet to Unlock" />
            </div>
          ) : (
            <button onClick={unlock} disabled={loading || !topic.trim()} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: loading || !topic.trim() ? "#3730a3" : "#6366f1", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading || !topic.trim() ? "not-allowed" : "pointer" }}>
              {loading ? "Agents researching..." : "Pay 0.01 & Generate Article"}
            </button>
          )}
          {error && (
            <p style={{ fontSize: 13, color: "#f87171", marginTop: 12, textAlign: "center" }}>{error}</p>
          )}
          <p style={{ fontSize: 11, color: "#374151", marginTop: 16, textAlign: "center" }}>
            Powered by 0G Compute · 0G Storage · 3 onchain agents
          </p>
        </div>
      </div>
    </div>
  );
}