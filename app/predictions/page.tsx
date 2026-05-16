"use client";
import { useState, useEffect } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import Layout from "../components/Layout";

export const dynamic = "force-dynamic";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [betting, setBetting] = useState<string | null>(null);
  const [betAmounts, setBetAmounts] = useState<Record<string, string>>({});
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();

  useEffect(() => {
    fetch("/api/predictions").then(r => r.json()).then(d => setPredictions(d.predictions || [])).catch(() => {});
  }, []);

  const generatePrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/predictions", { method: "POST" });
      const data = await res.json();
      if (data.id) setPredictions(p => [data, ...p]);
    } catch {}
    setLoading(false);
  };

  const placeBet = async (predictionId: string, direction: "YES" | "NO") => {
    setBetting(predictionId + direction);
    try {
      const amount = parseFloat(betAmounts[predictionId] || "0.01");
      let txHash = "0x0000000000000000000000000000000000000000000000000000000000000001";
      if (isConnected && address) {
        txHash = await sendTransactionAsync({
          to: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT as `0x${string}`,
          value: parseEther(amount.toString()),
        });
      }
      const res = await fetch("/api/predictions/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId, direction, amount, txHash }),
      });
      const data = await res.json();
      if (data.prediction) {
        setPredictions(p => p.map(pred => pred.id === predictionId ? data.prediction : pred));
      }
    } catch (e: any) {
      console.error(e);
    }
    setBetting(null);
  };

  const settle = async (predictionId: string) => {
    const res = await fetch("/api/predictions/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predictionId }),
    });
    const data = await res.json();
    if (data.prediction) {
      setPredictions(p => p.map(pred => pred.id === predictionId ? data.prediction : pred));
    }
  };

  return (
    <Layout heroContent={
      <div>
        <div className="section-label">PREDICTION MARKET</div>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>AI price predictions</h1>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:14,fontFamily:"var(--mono)"}}>AI makes predictions · Bet OG on YES or NO · Winners paid automatically onchain · Stored on 0G Storage</p>
      </div>
    }>
      <style>{`
        .pred-body{padding:40px 0}
        .pred-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
        .pred-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;transition:border-color 0.2s}
        .pred-card:hover{border-color:rgba(123,110,246,0.3)}
        .pred-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
        .pred-topic{font-size:11px;font-family:var(--mono);color:var(--accent);letter-spacing:1px}
        .pred-time{font-size:10px;font-family:var(--mono);color:var(--muted)}
        .pred-direction{font-size:32px;font-weight:800;font-family:var(--font);margin-bottom:8px;display:flex;align-items:center;gap:8px}
        .pred-up{color:var(--accent2)}
        .pred-down{color:#f87171}
        .pred-text{font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:16px}
        .pred-pools{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
        .pool{border-radius:8px;padding:12px;text-align:center}
        .pool-yes{background:rgba(79,209,165,0.08);border:1px solid rgba(79,209,165,0.2)}
        .pool-no{background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2)}
        .pool-label{font-size:10px;font-family:var(--mono);margin-bottom:4px}
        .pool-yes .pool-label{color:var(--accent2)}
        .pool-no .pool-label{color:#f87171}
        .pool-amount{font-size:18px;font-weight:700;font-family:var(--mono)}
        .pool-yes .pool-amount{color:var(--accent2)}
        .pool-no .pool-amount{color:#f87171}
        .pool-pct{font-size:10px;font-family:var(--mono);color:var(--muted)}
        .bet-row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
        .bet-input{background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:6px;font-size:12px;font-family:var(--mono);width:80px;outline:none}
        .bet-input:focus{border-color:var(--accent)}
        .bet-btn-yes{background:rgba(79,209,165,0.1);color:var(--accent2);border:1px solid rgba(79,209,165,0.3);padding:8px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all 0.2s}
        .bet-btn-yes:hover{background:rgba(79,209,165,0.2)}
        .bet-btn-no{background:rgba(248,113,113,0.1);color:#f87171;border:1px solid rgba(248,113,113,0.3);padding:8px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all 0.2s}
        .bet-btn-no:hover{background:rgba(248,113,113,0.2)}
        .bet-label{font-size:10px;font-family:var(--mono);color:var(--muted)}
        .settled-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(107,107,138,0.2);border:1px solid var(--border);padding:3px 10px;border-radius:20px;font-size:10px;font-family:var(--mono);color:var(--muted)}
        .settle-btn{background:transparent;border:1px solid var(--border);color:var(--muted);padding:6px 12px;border-radius:6px;font-size:11px;cursor:pointer;font-family:var(--mono);transition:all 0.2s}
        .settle-btn:hover{border-color:var(--warn);color:var(--warn)}
        .tee-badge{font-size:10px;font-family:var(--mono);color:var(--accent2)}
        .empty{text-align:center;padding:60px 0;color:var(--muted);font-family:var(--mono)}
        .progress-bar{height:4px;border-radius:2px;background:var(--surface2);overflow:hidden;margin-bottom:12px}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--accent2),var(--accent));border-radius:2px;transition:width 0.3s}
        @media(max-width:768px){.pred-grid{grid-template-columns:1fr!important}.pred-body{padding:24px 0}.bet-row{flex-wrap:wrap}}
      `}</style>

      <div className="pred-body">
        <div className="wrap">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32,flexWrap:"wrap",gap:12}}>
            <div style={{fontSize:13,fontFamily:"var(--mono)",color:"var(--muted)"}}>
              {predictions.length} prediction{predictions.length !== 1 ? "s" : ""} · Stored on 0G Storage
              {isConnected && <span style={{color:"var(--accent2)",marginLeft:12}}>● Wallet connected</span>}
            </div>
            <button className="btn-primary" onClick={generatePrediction} disabled={loading}>
              {loading ? "AI generating..." : "+ New prediction"}
            </button>
          </div>

          {predictions.length === 0 ? (
            <div className="empty">No predictions yet. Click "+ New prediction" to start.</div>
          ) : (
            <div className="pred-grid">
              {predictions.map((p:any) => {
                const total = (p.yesPool || 0) + (p.noPool || 0);
                const yesPct = total > 0 ? Math.round((p.yesPool / total) * 100) : 50;
                const noPct = 100 - yesPct;
                const isBetting = betting === p.id + "YES" || betting === p.id + "NO";

                return (
                  <div key={p.id} className="pred-card">
                    <div className="pred-header">
                      <div className="pred-topic">{p.topic}</div>
                      <div className="pred-time">{new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>

                    <div className={`pred-direction ${p.direction === "UP" ? "pred-up" : "pred-down"}`}>
                      {p.direction === "UP" ? "▲" : "▼"}
                      <span>{p.direction}</span>
                      {p.teeVerified && <span className="tee-badge" style={{fontSize:11}}>✓ TEE</span>}
                    </div>

                    <div className="pred-text">{p.prediction}</div>

                    <div className="progress-bar">
                      <div className="progress-fill" style={{width:`${yesPct}%`}}></div>
                    </div>

                    <div className="pred-pools">
                      <div className="pool pool-yes">
                        <div className="pool-label">YES POOL</div>
                        <div className="pool-amount">{(p.yesPool || 0).toFixed(3)}</div>
                        <div className="pool-pct">{yesPct}% · OG</div>
                      </div>
                      <div className="pool pool-no">
                        <div className="pool-label">NO POOL</div>
                        <div className="pool-amount">{(p.noPool || 0).toFixed(3)}</div>
                        <div className="pool-pct">{noPct}% · OG</div>
                      </div>
                    </div>

                    {!p.settled ? (
                      <>
                        <div className="bet-row">
                          <span className="bet-label">Bet:</span>
                          <input
                            className="bet-input"
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={betAmounts[p.id] || "0.01"}
                            onChange={e => setBetAmounts(prev => ({...prev, [p.id]: e.target.value}))}
                          />
                          <span className="bet-label">OG</span>
                          <button className="bet-btn-yes" disabled={isBetting} onClick={() => placeBet(p.id, "YES")}>
                            {betting === p.id + "YES" ? "..." : "▲ YES"}
                          </button>
                          <button className="bet-btn-no" disabled={isBetting} onClick={() => placeBet(p.id, "NO")}>
                            {betting === p.id + "NO" ? "..." : "▼ NO"}
                          </button>
                        </div>
                        <button className="settle-btn" onClick={() => settle(p.id)}>Settle prediction</button>
                      </>
                    ) : (
                      <div className="settled-badge">✓ Settled · {new Date(p.settledAt).toLocaleDateString()}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
