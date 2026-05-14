"use client";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export const dynamic = "force-dynamic";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/predictions").then(r => r.json()).then(d => setPredictions(d.predictions || [])).catch(() => {});
  }, []);

  const generatePrediction = async () => {
    setLoading(true);
    const res = await fetch("/api/predictions", { method: "POST" });
    const data = await res.json();
    if (data.id) setPredictions(p => [data, ...p]);
    setLoading(false);
  };

  return (
    <Layout heroContent={
      <div>
        <div className="section-label">PREDICTIONS</div>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>AI price predictions</h1>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:14,fontFamily:"var(--mono)"}}>AI predicts 0G, BTC, ETH · TEE-verified via 0G Compute · Stored on 0G Storage</p>
      </div>
    }>
      <style>{`
        .pred-hero{padding:48px 0 32px;border-bottom:1px solid var(--border)}
        .pred-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding:40px 0}
        .pred-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px}
        .pred-topic{font-size:11px;font-family:var(--mono);color:var(--accent);margin-bottom:10px;letter-spacing:1px}
        .pred-direction{font-size:28px;font-weight:800;font-family:var(--font);margin-bottom:8px}
        .pred-up{color:var(--accent2)}
        .pred-down{color:#f87171}
        .pred-text{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:16px}
        .pred-meta{font-size:10px;font-family:var(--mono);color:var(--muted);display:flex;gap:12px}
        .pred-tee{color:var(--accent2)}
        .empty{text-align:center;padding:60px 0;color:var(--muted);font-family:var(--mono)}
      `}</style>
      <div className="pred-hero">
        <div className="wrap">
          <div className="section-label">PREDICTIONS</div>
          <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>AI price predictions</h1>
          <p style={{color:"var(--muted)",fontSize:15,fontFamily:"var(--mono)",marginBottom:32}}>AI predicts 0G, BTC, ETH prices · TEE-verified via 0G Compute · Stored on 0G Storage</p>
          <button className="btn-primary" onClick={generatePrediction} disabled={loading}>
            {loading ? "Generating..." : "Generate new prediction"}
          </button>
        </div>
      </div>
      <div className="wrap">
        {predictions.length === 0 ? (
          <div className="empty">No predictions yet. Click "Generate new prediction" to start.</div>
        ) : (
          <div className="pred-grid">
            {predictions.map((p:any, i:number) => (
              <div key={i} className="pred-card">
                <div className="pred-topic">{p.topic}</div>
                <div className={`pred-direction ${p.direction === "UP" ? "pred-up" : "pred-down"}`}>{p.direction === "UP" ? "▲ UP" : "▼ DOWN"}</div>
                <div className="pred-text">{p.prediction}</div>
                <div className="pred-meta">
                  <span>{new Date(p.createdAt).toLocaleString()}</span>
                  {p.teeVerified && <span className="pred-tee">✓ TEE verified</span>}
                  <span>0G Storage</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
