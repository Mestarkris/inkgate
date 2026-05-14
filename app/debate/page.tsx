"use client";
import { useState } from "react";
import Layout from "../components/Layout";

const TOPICS = [
  "0G Network will surpass Filecoin in storage adoption",
  "Decentralized AI will replace centralized models by 2028",
  "Bitcoin will reach $200k in 2026",
  "AI agents will manage more wealth than humans by 2030",
  "0G Compute will disrupt AWS and Google Cloud",
];

export const dynamic = "force-dynamic";

export default function DebatePage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [txHash] = useState("0x0000000000000000000000000000000000000000000000000000000000000001");

  const runDebate = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/debate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, txHash }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <Layout>
      <style>{`
        .debate-hero{padding:48px 0 32px;border-bottom:1px solid var(--border)}
        .debate-body{padding:40px 0}
        .topic-select{width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:12px 16px;border-radius:8px;font-size:14px;font-family:var(--mono);margin-bottom:16px;appearance:none}
        .debate-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .debate-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px}
        .debate-side{font-size:11px;font-family:var(--mono);letter-spacing:1px;margin-bottom:12px;font-weight:700}
        .bull{color:var(--accent2)}
        .bear{color:#f87171}
        .judge{color:var(--warn)}
        .debate-text{font-size:13px;color:var(--muted);line-height:1.7}
        .debate-verdict{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:16px}
        .debate-tx{font-size:10px;font-family:var(--mono);color:var(--muted);background:var(--surface2);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:4px}
        .tx-row{display:flex;justify-content:space-between}
        .tx-label{color:var(--muted)}
        .tx-val{color:var(--accent2)}
      `}</style>
      <div className="debate-hero">
        <div className="wrap">
          <div className="section-label">AI DEBATES</div>
          <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>Bull vs Bear vs Judge</h1>
          <p style={{color:"var(--muted)",fontSize:15,fontFamily:"var(--mono)"}}>3 agents debate any topic · All powered by 0G Compute TEE inference · Payments in A0GI</p>
        </div>
      </div>
      <div className="debate-body">
        <div className="wrap">
          <select className="topic-select" value={topic} onChange={e => setTopic(e.target.value)}>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn-primary" onClick={runDebate} disabled={loading} style={{marginBottom:32}}>
            {loading ? "Agents debating..." : "Start debate"}
          </button>

          {result && (
            <>
              <div className="debate-grid">
                <div className="debate-card">
                  <div className="debate-side bull">▲ BULL CASE</div>
                  <div className="debate-text">{result.bullArg}</div>
                </div>
                <div className="debate-card">
                  <div className="debate-side bear">▼ BEAR CASE</div>
                  <div className="debate-text">{result.bearArg}</div>
                </div>
              </div>
              <div className="debate-verdict">
                <div className="debate-side judge">⚖ JUDGE VERDICT</div>
                <div className="debate-text">{result.verdict}</div>
              </div>
              <div className="debate-tx">
                <div className="tx-row"><span className="tx-label">Network</span><span className="tx-val">{result.network}</span></div>
                <div className="tx-row"><span className="tx-label">Compute</span><span className="tx-val">{result.computeProvider}</span></div>
                {result.agentPipeline && Object.entries(result.agentPipeline).map(([k,v]:any) => (
                  <div key={k} className="tx-row"><span className="tx-label">{k}</span><span className="tx-val">{String(v).slice(0,20)}...</span></div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
