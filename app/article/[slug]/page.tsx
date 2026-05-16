"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "../../components/Layout";

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [teaser, setTeaser] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkWallet = async () => {
      if (!(window as any).ethereum) return;
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
        if (accounts?.[0]) { setAddress(accounts[0]); setIsConnected(true); }
      } catch {}
    };
    checkWallet();
    // Re-check every 2 seconds in case MetaMask loads after page
    const interval = setInterval(checkWallet, 2000);
    if ((window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        setAddress(accounts[0] || ""); setIsConnected(!!accounts[0]);
      });
    }
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    if (!(window as any).ethereum) { alert("Please install MetaMask"); return; }
    const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    if (accounts[0]) { setAddress(accounts[0]); setIsConnected(true); }
  };

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/teaser/${slug}`).then(r => r.json()).then(d => setTeaser(d.teaser || "")).catch(() => {});
  }, [slug]);

  const switchToOG = async () => {
    try {
      await (window as any).ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x4115' }] });
    } catch (e: any) {
      if (e.code === 4902) {
        await (window as any).ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0x4115', chainName: '0G Mainnet', nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 }, rpcUrls: ['https://evmrpc.0g.ai'], blockExplorerUrls: ['https://chainscan.0g.ai'] }] });
      }
    }
  };
  const unlock = async () => {
    setError("");
    setLoading(true);
    try {
      let txHash = "0x0000000000000000000000000000000000000000000000000000000000000001";

      if (isConnected && address) {
        const { BrowserProvider, parseEther } = await import("ethers");
        const provider = new BrowserProvider((window as any).ethereum);
        try {
          await provider.send("wallet_addEthereumChain", [{
            chainId: "0x411D",
            chainName: "0G Mainnet",
            nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
            rpcUrls: ["https://evmrpc.0g.ai"],
            blockExplorerUrls: ["https://chainscan.0g.ai"],
          }]);
        } catch (_) {}
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0x411D" }]).catch(() => {});
        const signer = await provider.getSigner();
        const recipient = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || "0x1ba840fb6fC2a1a9cd9880803d920228DCF919E9";
        const tx = await signer.sendTransaction({ to: recipient, value: parseEther("0.01") });
        await tx.wait();
        txHash = tx.hash;
      }

      const res = await fetch(`/api/article/${slug}`, {
        headers: { "X-PAYMENT": txHash, "X-READER-ADDRESS": address || "" },
      });
      const data = await res.json();
      if (data.error && !data.content) {
        setError(data.error);
      } else {
        setArticle(data);
      }
    } catch (err: any) {
      setError(err?.message?.includes("rejected") ? "Transaction rejected in MetaMask." : (err?.message || "Something went wrong"));
    }
    setLoading(false);
  };

  const title = slug?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Layout heroContent={
      <div>
        <div className="section-label">ARTICLE</div>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>{article?.title || title}</h1>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:14,fontFamily:"var(--mono)"}}>0.01 0G · 3 agents · TEE verified · 0G Storage</p>
      </div>
    }>
      <style>{`
        .article-body{padding:40px 0;max-width:720px}
        .article-tag{font-size:10px;font-family:var(--mono);color:var(--accent);background:rgba(123,110,246,0.1);border:1px solid rgba(123,110,246,0.2);padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:16px}
        .article-meta{display:flex;gap:16px;font-size:12px;font-family:var(--mono);color:var(--muted);margin-bottom:24px;flex-wrap:wrap}
        .meta-green{color:var(--accent2)}
        .article-teaser{font-size:16px;color:var(--muted);line-height:1.7;margin-bottom:32px;font-style:italic;border-left:2px solid var(--accent);padding-left:16px}
        .unlock-box{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:32px;margin-bottom:32px}
        .unlock-title{font-size:18px;font-weight:700;font-family:var(--font);margin-bottom:8px}
        .unlock-sub{font-size:13px;color:var(--muted);font-family:var(--mono);margin-bottom:24px}
        .pipeline-visual{display:flex;align-items:center;gap:8px;margin-bottom:24px;flex-wrap:wrap}
        .pipe-badge{font-size:11px;font-family:var(--mono);padding:6px 12px;border-radius:4px;border:1px solid var(--border)}
        .pipe-arrow{color:var(--muted);font-size:12px}
        .wallet-info{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:12px;font-family:var(--mono);display:flex;align-items:center;gap:8px}
        .wallet-dot{width:6px;height:6px;border-radius:50%;background:var(--accent2)}
        .wallet-addr{color:var(--accent2)}
        .wallet-warning{color:var(--warn);font-size:11px;margin-top:8px}
        .error-box{background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#f87171;font-family:var(--mono)}
        .article-content{font-size:15px;color:rgba(245,245,240,0.8);line-height:1.9;white-space:pre-wrap;margin-bottom:32px;font-weight:300}
        .article-proof{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:20px}
        .proof-title{font-size:11px;font-family:var(--mono);color:var(--accent);letter-spacing:2px;margin-bottom:14px}
        .proof-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;font-family:var(--mono)}
        .proof-row:last-child{border-bottom:none}
        .proof-key{color:var(--muted)}
        .proof-val{color:var(--accent2);word-break:break-all;max-width:60%;text-align:right}
        .proof-link{color:var(--accent);text-decoration:none}
        .proof-link:hover{text-decoration:underline}
        @media(max-width:768px){.article-body{padding:24px 0}.pipeline-visual{gap:4px}.pipe-badge{font-size:10px;padding:4px 8px}}
      `}</style>

      <div className="wrap">
        <div className="article-body">
          {!article ? (
            <div className="unlock-box">
              <div className="unlock-title">Unlock this article</div>
              <div className="unlock-sub">3 agents will research, fact-check and write this article live on 0G Compute</div>

              <div className="pipeline-visual">
                <span className="pipe-badge" style={{background:"#1a1233",color:"#c084fc",borderColor:"rgba(192,132,252,0.2)"}}>Orchestrator</span>
                <span className="pipe-arrow">→</span>
                <span className="pipe-badge" style={{background:"#1a1a3e",color:"var(--accent)",borderColor:"rgba(123,110,246,0.2)"}}>Research</span>
                <span className="pipe-arrow">→</span>
                <span className="pipe-badge" style={{background:"#0f2e22",color:"var(--accent2)",borderColor:"rgba(79,209,165,0.2)"}}>FactCheck</span>
                <span className="pipe-arrow">→</span>
                <span className="pipe-badge" style={{background:"#2e1f0f",color:"var(--warn)",borderColor:"rgba(240,160,75,0.2)"}}>Writer</span>
              </div>

              {isConnected && address ? (
                <div className="wallet-info">
                  <span className="wallet-dot"></span>
                  <span>Connected: </span>
                  <span className="wallet-addr">{address.slice(0,6)}...{address.slice(-4)}</span>
                  <span style={{color:"var(--muted)",marginLeft:"auto"}}>Pay 0.01 0G · Confirm in MetaMask</span>
                </div>
              ) : (
                <div className="wallet-info">
                  <span style={{color:"var(--warn)"}}>⚠ No wallet connected · </span>
                  <button onClick={connectWallet} style={{background:"none",border:"none",color:"var(--accent)",cursor:"pointer",fontFamily:"var(--mono)",fontSize:12,textDecoration:"underline"}}>Connect MetaMask</button>
                </div>
              )}

              {error && <div className="error-box">{error}</div>}

              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <button className="btn-primary" onClick={unlock} disabled={loading} style={{fontSize:15,padding:"14px 32px"}}>
                  {loading ? "Agents writing..." : isConnected ? "Unlock with MetaMask · 0.01 0G →" : "Unlock in demo mode →"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="article-meta">
                <span className="meta-green">0.01 OG paid</span>
                <span>3 autonomous agents</span>
                <span>TEE verified · 0G Compute</span>
                <span>Stored on 0G Storage</span>
              </div>
              {teaser && <div className="article-teaser">"{teaser}"</div>}
              <div className="article-content">{article?.content}</div>
              <div className="article-proof">
                <div className="proof-title">PROOF OF WORK · 0G NETWORK</div>
                <div className="proof-row"><span className="proof-key">Network</span><span className="proof-val">{article?.network}</span></div>
                <div className="proof-row"><span className="proof-key">Generated</span><span className="proof-val">{article?.generatedAt && new Date(article.generatedAt).toLocaleString()}</span></div>
                {article?.ogStorageHash && <div className="proof-row"><span className="proof-key">0G Storage</span><span className="proof-val">{article.ogStorageHash}</span></div>}
                {article?.agentPipeline && Object.entries(article.agentPipeline).map(([k,v]:any) => (
                  <div key={k} className="proof-row">
                    <span className="proof-key">{k}</span>
                    {String(v) !== "0x0" && String(v).length > 10 ? (
                      <a href={`https://chainscan.0g.ai/tx/${v}`} target="_blank" rel="noopener noreferrer" className="proof-link">
                        {String(v).slice(0,16)}...
                      </a>
                    ) : (
                      <span className="proof-val">{String(v).slice(0,28)}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
