"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bettingId, setBettingId] = useState<string | null>(null);
  const [bettingSide, setBettingSide] = useState<string | null>(null);
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
    loadPredictions();
  }, []);

  async function loadPredictions() {
    setLoading(true);
    try {
      const res = await fetch("/api/predictions");
      const data = await res.json();
      setPredictions(data.predictions ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function generatePrediction() {
    setGenerating(true);
    try {
      const res = await fetch("/api/predictions", { method: "POST" });
      const data = await res.json();
      if (data.prediction) {
        setPredictions(prev => [data.prediction, ...prev]);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function placeBet(predictionId: string, side: "yes" | "no") {
    if (!mounted || !isConnected) return;
    setBettingId(predictionId);
    setBettingSide(side);
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
      const A0GI = "process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT" as `0x${string}`;
      const RECIPIENT = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT as `0x${string}`;
      const AMOUNT = parseUnits("0.01", 6);
      const paddedRecipient = RECIPIENT.slice(2).padStart(64, "0");
      const paddedAmount = AMOUNT.toString(16).padStart(64, "0");
      const data = ("0xa9059cbb" + paddedRecipient + paddedAmount) as `0x${string}`;
      const hash = await walletClient.sendTransaction({
        account: address,
        to: A0GI,
        data,
        chain: ogChain,
      });
      await fetch("/api/predictions/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predictionId,
          side,
          txHash: hash,
          bettor: address,
          amount: 0.01,
        }),
      });
      await loadPredictions();
    } catch (err: any) {
      console.error(err);
    } finally {
      setBettingId(null);
      setBettingSide(null);
    }
  }

  async function settle(predictionId: string) {
    try {
      const res = await fetch("/api/predictions/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId }),
      });
      const data = await res.json();
      console.log("Settlement:", data);
      await loadPredictions();
    } catch (err) {
      console.error(err);
    }
  }

  function timeLeft(settlesAt: number) {
    const diff = settlesAt - Date.now();
    if (diff <= 0) return "Ready to settle";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h + "h " + m + "m left";
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0" }}>
      <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>Back</Link>
          <span style={{ fontSize: 13, color: "#6366f1" }}>InkGate — Prediction Market</span>
        </div>
        {mounted && !isConnected && <ConnectButton />}
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "inline-block", background: "#f59e0b20", border: "1px solid #f59e0b33", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#f59e0b", marginBottom: 20 }}>
          AI predictions · A0GI betting · Auto settlement
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: "#e8e8f0" }}>Prediction Market</h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 32, lineHeight: 1.6 }}>
          An AI agent analyzes live crypto price data and makes 24-hour predictions. Bet A0GI on YES or NO. Winners get paid automatically onchain.
        </p>

        <button
          onClick={generatePrediction}
          disabled={generating}
          style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: generating ? "not-allowed" : "pointer", marginBottom: 32, opacity: generating ? 0.7 : 1 }}
        >
          {generating ? "Agent analyzing market..." : "Generate new prediction"}
        </button>

        {loading ? (
          <p style={{ color: "#6b7280" }}>Loading predictions...</p>
        ) : predictions.length === 0 ? (
          <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <p style={{ color: "#6b7280", marginBottom: 16 }}>No predictions yet</p>
            <p style={{ fontSize: 13, color: "#4b5563" }}>Click the button above to have the AI agent analyze the market and make a prediction</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {predictions.map((p: any, i: number) => {
              const pred = typeof p === "string" ? JSON.parse(p) : p;
              const totalPool = (pred.yesPool ?? 0) + (pred.noPool ?? 0);
              const yesPercent = totalPool > 0 ? Math.round((pred.yesPool / totalPool) * 100) : 50;
              const noPercent = 100 - yesPercent;
              const isSettleable = Date.now() > pred.settlesAt && pred.status === "open";

              return (
                <div key={i} style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, background: pred.direction === "up" ? "#22c55e20" : "#f8717120", color: pred.direction === "up" ? "#22c55e" : "#f87171", border: "1px solid " + (pred.direction === "up" ? "#22c55e30" : "#f8717130"), borderRadius: 12, padding: "2px 10px" }}>
                          {pred.name}
                        </span>
                        <span style={{ fontSize: 11, color: "#6b7280", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 12, padding: "2px 10px" }}>
                          {pred.status === "settled" ? "Settled" : timeLeft(pred.settlesAt)}
                        </span>
                      </div>
                      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#e8e8f0", lineHeight: 1.4, marginBottom: 8 }}>
                        {pred.prediction}
                      </h2>
                      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{pred.reasoning}</p>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 16, flexShrink: 0 }}>
                      <p style={{ fontSize: 12, color: "#6b7280" }}>Agent confidence</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#6366f1" }}>{pred.confidence}%</p>
                    </div>
                  </div>

                  {pred.status === "settled" && (
                    <div style={{ background: pred.agentWasRight ? "#0d1f13" : "#1f0d0d", border: "1px solid " + (pred.agentWasRight ? "#166534" : "#7f1d1d"), borderRadius: 10, padding: 12, marginBottom: 16 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: pred.agentWasRight ? "#22c55e" : "#f87171" }}>
                        {pred.agentWasRight ? "Agent was correct" : "Agent was wrong"} · Final price: ${Number(pred.finalPrice).toLocaleString()}
                      </p>
                      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                        {pred.winnerSide === "yes" ? "YES bettors" : "NO bettors"} won · {pred.payoutTxs?.length ?? 0} payouts sent
                      </p>
                    </div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                      <span>YES {yesPercent}% · ${(pred.yesPool ?? 0).toFixed(2)} A0GI</span>
                      <span>NO {noPercent}% · ${(pred.noPool ?? 0).toFixed(2)} A0GI</span>
                    </div>
                    <div style={{ height: 8, background: "#0a0a0f", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: yesPercent + "%", background: "linear-gradient(90deg, #22c55e, #16a34a)", borderRadius: 4 }} />
                    </div>
                  </div>

                  {pred.status === "open" && (
                    <div style={{ display: "flex", gap: 10 }}>
                      {!mounted || !isConnected ? (
                        <ConnectButton label="Connect to bet" />
                      ) : (
                        <>
                          <button
                            onClick={() => placeBet(pred.id, "yes")}
                            disabled={bettingId === pred.id}
                            style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #22c55e", background: "#22c55e20", color: "#22c55e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                          >
                            {bettingId === pred.id && bettingSide === "yes" ? "Betting..." : "YES 0.01"}
                          </button>
                          <button
                            onClick={() => placeBet(pred.id, "no")}
                            disabled={bettingId === pred.id}
                            style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #f87171", background: "#f8717120", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                          >
                            {bettingId === pred.id && bettingSide === "no" ? "Betting..." : "NO 0.01"}
                          </button>
                          {isSettleable && (
                            <button
                              onClick={() => settle(pred.id)}
                              style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #6366f1", background: "#6366f120", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                            >
                              Settle
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}