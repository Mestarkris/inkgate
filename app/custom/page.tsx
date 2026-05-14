"use client";
import { useState } from "react";
import Layout from "../components/Layout";

export const dynamic = "force-dynamic";

export default function CustomPage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const txHash = "0x0000000000000000000000000000000000000000000000000000000000000001";

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, txHash }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <Layout heroContent={
      <div>
        <div className="section-label">CUSTOM RESEARCH</div>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>Write anything</h1>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:14,fontFamily:"var(--mono)"}}>Submit any topic · 3 agents research on 0G Compute · Stored on 0G Storage</p>
      </div>
    }>
      <style>{`
        .custom-hero{padding:48px 0 32px;border-bottom:1px solid var(--border)}
        .custom-body{padding:40px 0}
        .custom-input{width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:14px 18px;border-radius:8px;font-size:15px;font-family:var(--mono);margin-bottom:12px;outline:none}
        .custom-input:focus{border-color:var(--accent)}
        .custom-input::placeholder{color:var(--muted)}
        .result-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px;margin-top:32px}
        .result-title{font-size:22px;font-weight:800;font-family:var(--font);margin-bottom:20px;letter-spacing:-0.5px}
        .result-content{font-size:14px;color:var(--muted);line-height:1.85;white-space:pre-wrap;margin-bottom:24px}
        .result-meta{font-size:10px;font-family:var(--mono);color:var(--muted);background:var(--surface2);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:4px}
        .meta-row{display:flex;justify-content:space-between}
        .meta-label{color:var(--muted)}
        .meta-val{color:var(--accent2)}
        .og-hash{color:var(--accent);word-break:break-all}

        @media(max-width:768px){
          .wrap{padding:0 16px!important}
          h1{font-size:26px!important;letter-spacing:-0.5px!important}
          .trending-grid,.agents-grid,.pred-grid,.debate-grid,.articles-grid,.features{grid-template-columns:1fr!important}
          .chat-wrap{grid-template-columns:1fr!important}
          .chat-sidebar{border-right:none!important;border-bottom:1px solid var(--border)!important;padding:16px!important}
          .stats-bar{grid-template-columns:1fr!important}
          .pipeline,.og-grid{grid-template-columns:1fr!important}
        }
      `}</style>
      <div className="custom-hero">
        <div className="wrap">
          <div className="section-label">CUSTOM RESEARCH</div>
          <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>Write anything</h1>
          <p style={{color:"var(--muted)",fontSize:15,fontFamily:"var(--mono)"}}>Submit any topic · 3 agents research it live on 0G Compute · Stored permanently on 0G Storage</p>
        </div>
      </div>
      <div className="custom-body">
        <div className="wrap">
          <input className="custom-input" placeholder="e.g. The future of decentralized AI on 0G Network..." value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} />
          <button className="btn-primary" onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? "Agents writing..." : "Generate article · 0.01 A0GI"}
          </button>

          {result?.content && (
            <div className="result-card">
              <div className="result-title">{result.title}</div>
              <div className="result-content">{result.content}</div>
              <div className="result-meta">
                <div className="meta-row"><span className="meta-label">Network</span><span className="meta-val">{result.network}</span></div>
                <div className="meta-row"><span className="meta-label">Generated</span><span className="meta-val">{new Date(result.generatedAt).toLocaleString()}</span></div>
                {result.ogStorageHash && <div className="meta-row"><span className="meta-label">0G Storage</span><span className="og-hash">{result.ogStorageHash}</span></div>}
                {result.agentPipeline && Object.entries(result.agentPipeline).map(([k,v]:any) => (
                  <div key={k} className="meta-row"><span className="meta-label">{k}</span><span className="meta-val">{String(v).slice(0,24)}...</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
