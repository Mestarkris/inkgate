"use client";
import { useState } from "react";
import Layout from "../components/Layout";

export const dynamic = "force-dynamic";

export default function DebatePage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [txError, setTxError] = useState("");

  const runDebate = async () => {
    if (!topic.trim()) return;
    setTxError("");

    // Request MetaMask payment first
    let txHash = "";
    try {
      const { BrowserProvider, parseEther } = await import("ethers");
      const provider = new BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // Switch to 0G Mainnet
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0x411D" }]);
      } catch (switchErr: any) {
        if (switchErr.code === 4902) {
          await provider.send("wallet_addEthereumChain", [{
            chainId: "0x411D",
            chainName: "0G Mainnet",
            nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
            rpcUrls: ["https://evmrpc.0g.ai"],
            blockExplorerUrls: ["https://chainscan.0g.ai"],
          }]);
        }
      }

      const tx = await signer.sendTransaction({
        to: (process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || "0x1ba840fb6fC2a1a9cd9880803d920228DCF919E9") as string,
        value: parseEther("0.01"),
      });
      await tx.wait();
      txHash = tx.hash;
    } catch (err: any) {
      setTxError(err?.message?.slice(0, 80) || "Payment cancelled");
      return;
    }

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

  const suggestions = [
    "0G Network will surpass Filecoin in storage adoption",
    "Decentralized AI will replace centralized models by 2028",
    "Bitcoin will reach $200k in 2026",
    "0G Compute will disrupt AWS and Google Cloud",
  ];

  return (
    <Layout heroContent={
      <div>
        <div className="section-label">AI DEBATES</div>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>Bull vs Bear vs Judge</h1>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:14,fontFamily:"var(--mono)"}}>Type any topic · 3 agents debate · 0G Compute TEE inference · 0G payments</p>
      </div>
    }>
      <style>{`
        .debate-hero{padding:48px 0 32px;border-bottom:1px solid var(--border)}
        .debate-body{padding:40px 0}
        .debate-input{width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:14px 18px;border-radius:8px;font-size:15px;font-family:var(--mono);margin-bottom:12px;outline:none}
        .debate-input:focus{border-color:var(--accent)}
        .debate-input::placeholder{color:var(--muted)}
        .suggestions{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
        .suggestion{background:var(--surface2);border:1px solid var(--border);padding:6px 14px;border-radius:20px;font-size:12px;color:var(--muted);cursor:pointer;font-family:var(--mono);transition:all 0.2s}
        .suggestion:hover{border-color:var(--accent);color:var(--text)}
        .debate-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .debate-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px}
        .debate-side{font-size:11px;font-family:var(--mono);letter-spacing:1px;margin-bottom:12px;font-weight:700}
        .bull{color:var(--accent2)}
        .bear{color:#f87171}
        .judge-label{color:var(--warn)}
        .debate-text{font-size:13px;color:var(--muted);line-height:1.7}
        .debate-verdict{background:var(--surface);border:1px solid rgba(240,160,75,0.2);border-radius:12px;padding:24px;margin-bottom:16px}
        .debate-tx{font-size:10px;font-family:var(--mono);color:var(--muted);background:var(--surface2);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:4px}
        .tx-row{display:flex;justify-content:space-between}
        .tx-val{color:var(--accent2)}
        .hint{font-size:12px;color:var(--muted);font-family:var(--mono);margin-bottom:8px}

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

      <div className="debate-hero">
        <div className="wrap">
          <div className="section-label">AI DEBATES</div>
          <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>Bull vs Bear vs Judge</h1>
          <p style={{color:"var(--muted)",fontSize:15,fontFamily:"var(--mono)"}}>Type any topic · 3 agents debate it · All powered by 0G Compute TEE inference</p>
        </div>
      </div>

      <div className="debate-body">
        <div className="wrap">
          <input
            className="debate-input"
            placeholder="Enter any topic to debate e.g. 0G will be the top AI blockchain..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runDebate()}
          />
          <div className="hint">Or pick a suggestion:</div>
          <div className="suggestions">
            {suggestions.map((s, i) => (
              <span key={i} className="suggestion" onClick={() => setTopic(s)}>{s}</span>
            ))}
          </div>
          {txError && <div style={{color:"#f87171",fontSize:12,fontFamily:"var(--mono)",marginBottom:8}}>⚠ {txError}</div>}
          <button className="btn-primary" onClick={runDebate} disabled={loading || !topic.trim()} style={{marginBottom:32}}>
            {loading ? "Agents debating on 0G Compute..." : "Start debate · 0.01 0G"}
          </button>

          {result && (
            <>
              <div style={{fontSize:13,fontFamily:"var(--mono)",color:"var(--muted)",marginBottom:20,padding:"10px 16px",background:"var(--surface2)",borderRadius:8}}>
                Topic: <span style={{color:"var(--text)"}}>{result.topic}</span>
              </div>
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
                <div className="debate-side judge-label">⚖ JUDGE VERDICT</div>
                <div className="debate-text">{result.verdict}</div>
              </div>
              <div className="debate-tx">
                <div className="tx-row"><span>Network</span><span className="tx-val">{result.network}</span></div>
                <div className="tx-row"><span>Compute</span><span className="tx-val">{result.computeProvider}</span></div>
                {result.agentPipeline && Object.entries(result.agentPipeline).map(([k,v]:any) => (
                  <div key={k} className="tx-row"><span>{k}</span><span className="tx-val">{String(v).slice(0,24)}...</span></div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
