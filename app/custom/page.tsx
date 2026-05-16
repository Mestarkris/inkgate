"use client";
import { useState } from "react";
import Layout from "../components/Layout";

export const dynamic = "force-dynamic";

export default function CustomPage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [txError, setTxError] = useState("");

  const generate = async () => {
    if (!topic.trim()) return;
    setTxError("");

    let txHash = "";
    let userAddress = "";

    try {
      if (!(window as any).ethereum) throw new Error("MetaMask not found. Please install MetaMask.");
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts?.length) throw new Error("Please unlock MetaMask and try again.");
      userAddress = accounts[0];

      const { BrowserProvider, parseEther } = await import("ethers");
      try { await (window as any).ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: "0x411D", chainName: "0G Mainnet", nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 }, rpcUrls: ["https://evmrpc.0g.ai"], blockExplorerUrls: ["https://chainscan.0g.ai"] }] }); } catch (_) {}
      try { await (window as any).ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x411D" }] }); } catch (_) {}

      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const recipient = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || "0x1ba840fb6fC2a1a9cd9880803d920228DCF919E9";
      const tx = await signer.sendTransaction({ to: recipient, value: parseEther("0.01") });
      await tx.wait();
      txHash = tx.hash;
    } catch (err: any) {
      setTxError(err?.message?.slice(0, 100) || "Payment failed");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, txHash, userAddress }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setTxError("Something went wrong. Please try again.");
    }
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
        .custom-body{padding:40px 0}
        .custom-input{width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:14px 18px;border-radius:8px;font-size:15px;font-family:var(--mono);margin-bottom:12px;outline:none;box-sizing:border-box}
        .custom-input:focus{border-color:var(--accent)}
        .custom-input::placeholder{color:var(--muted)}
        .result-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px;margin-top:32px}
        .result-title{font-size:22px;font-weight:800;font-family:var(--font);margin-bottom:20px;letter-spacing:-0.5px}
        .result-content{font-size:14px;color:var(--muted);line-height:1.85;white-space:pre-wrap;margin-bottom:24px}
        .result-meta{font-size:10px;font-family:var(--mono);color:var(--muted);background:var(--surface2);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:4px}
        .meta-row{display:flex;justify-content:space-between}
        .meta-val{color:var(--accent2)}
        .tx-err{color:#f87171;font-size:12px;font-family:var(--mono);margin-bottom:8px}
        @media(max-width:768px){.wrap{padding:0 16px!important}h1{font-size:26px!important}}
      `}</style>
      <div className="custom-body">
        <div className="wrap">
          <input className="custom-input" placeholder="e.g. The future of decentralized AI on 0G Network..." value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && generate()} />
          {txError && <div className="tx-err">⚠ {txError}</div>}
          <button className="btn-primary" onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? "Agents writing..." : "Generate article · 0.01 0G"}
          </button>
          {result?.content && (
            <div className="result-card">
              <div className="result-title">{result.title}</div>
              <div className="result-content">{result.content}</div>
              <div className="result-meta">
                <div className="meta-row"><span>Network</span><span className="meta-val">{result.network}</span></div>
                <div className="meta-row"><span>Generated</span><span className="meta-val">{new Date(result.generatedAt).toLocaleString()}</span></div>
                {result.agentPipeline && Object.entries(result.agentPipeline).map(([k,v]:any) => (
                  <div key={k} className="meta-row"><span>{k}</span><span className="meta-val">{String(v).slice(0,24)}...</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
