"use client";
import { useState } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import Layout from "../components/Layout";

export const dynamic = "force-dynamic";

export default function CustomPage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      let txHash = "0x0000000000000000000000000000000000000000000000000000000000000001";
      if (isConnected && address) {
        txHash = await sendTransactionAsync({
          to: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT as `0x${string}`,
          value: parseEther("0.01"),
        });
      }
      const res = await fetch("/api/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, txHash, userAddress: (await (window as any).ethereum?.request({ method: "eth_accounts" }))?.[0] || "" }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <Layout heroContent={
      <div>
        <div className="section-label">CUSTOM RESEARCH</div>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>Write anything</h1>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:14,fontFamily:"var(--mono)"}}>Submit any topic · 3 agents research on 0G Compute · Stored permanently on 0G Storage</p>
      </div>
    }>
      <style>{`
        .custom-body{padding:40px 0}
        .custom-input{width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:14px 18px;border-radius:8px;font-size:15px;font-family:var(--mono);margin-bottom:12px;outline:none;display:block}
        .custom-input:focus{border-color:var(--accent)}
        .custom-input::placeholder{color:var(--muted)}
        .result-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px;margin-top:32px}
        .result-title{font-size:22px;font-weight:800;font-family:var(--font);margin-bottom:20px;letter-spacing:-0.5px}
        .result-content{font-size:14px;color:var(--muted);line-height:1.85;white-space:pre-wrap;margin-bottom:24px}
        .result-meta{font-size:10px;font-family:var(--mono);color:var(--muted);background:var(--surface2);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:4px}
        .meta-row{display:flex;justify-content:space-between}
        .meta-val{color:var(--accent2)}
        .meta-link{color:var(--accent);text-decoration:none}
        .error-box{color:#f87171;font-size:12px;font-family:var(--mono);margin-bottom:8px;padding:10px;background:rgba(248,113,113,0.1);border-radius:6px;border:1px solid rgba(248,113,113,0.2)}
        @media(max-width:768px){.custom-body{padding:24px 0}.result-card{padding:16px}}
      `}</style>

      <div className="custom-body">
        <div className="wrap">
          <input
            className="custom-input"
            placeholder="e.g. The future of decentralized AI on 0G Network..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
          />
          {error && <div className="error-box">⚠ {error}</div>}
          <button className="btn-primary" onClick={generate} disabled={loading || !topic.trim()} style={{marginBottom:32}}>
            {loading ? "Agents writing on 0G Compute..." : isConnected ? "Generate article · Pay 0.01 OG via MetaMask" : "Generate article · Demo mode"}
          </button>

          {result?.content && (
            <div className="result-card">
              <div className="result-title">{result.title}</div>
              <div className="result-content">{result.content}</div>
              <div className="result-meta">
                <div className="meta-row"><span>Network</span><span className="meta-val">{result.network}</span></div>
                <div className="meta-row"><span>Generated</span><span className="meta-val">{new Date(result.generatedAt).toLocaleString()}</span></div>
                {result.ogStorageHash && <div className="meta-row"><span>0G Storage</span><span className="meta-val">{result.ogStorageHash}</span></div>}
                {result.agentPipeline && Object.entries(result.agentPipeline).map(([k,v]:any) => (
                  <div key={k} className="meta-row">
                    <span>{k}</span>
                    {String(v) !== "0x0" && String(v).length > 10 ? (
                      <a href={`https://chainscan.0g.ai/tx/${v}`} target="_blank" rel="noopener noreferrer" className="meta-link">
                        {String(v).slice(0,16)}...↗
                      </a>
                    ) : (
                      <span className="meta-val">{String(v).slice(0,20)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
