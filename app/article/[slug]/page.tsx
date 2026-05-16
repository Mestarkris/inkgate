"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { parseEther } from "viem";
import Layout from "../../components/Layout";

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [teaser, setTeaser] = useState("");
  const [error, setError] = useState("");
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (slug) {
      fetch(`/api/teaser/${slug}`).then(r => r.json()).then(d => setTeaser(d.teaser || "")).catch(() => {});
    }
  }, [slug]);

  const unlock = async () => {
    setError("");
    setLoading(true);
    try {
      let txHash = "";

      if (isConnected && address && walletClient) {
        const hash = await walletClient.sendTransaction({
          to: (process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || "0x1ba840fb6fC2a1a9cd9880803d920228DCF919E9") as `0x${string}`,
          value: parseEther("0.01"),
        });
        txHash = hash;
      }

      const res = await fetch(`/api/article/${slug}`, {
        headers: {
          "X-PAYMENT": txHash || "demo",
          "X-READER-ADDRESS": address || "",
        },
      });
      const data = await res.json();
      if (data.error && !data.content) {
        setError(data.error);
      } else {
        setArticle(data);
      }
    } catch (err: any) {
      setError(err?.message?.includes("rejected") ? "Transaction rejected." : (err?.message?.slice(0, 120) || "Something went wrong"));
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
        .article-meta{display:flex;gap:16px;font-size:12px;font-family:var(--mono);color:var(--muted);margin-bottom:24px;flex-wrap:wrap}
        .meta-green{color:var(--accent2)}
        .article-teaser{font-size:16px;color:var(--muted);line-height:1.7;margin-bottom:32px;font-style:italic;border-left:2px solid var(--accent);padding-left:16px}
        .unlock-box{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:32px;margin-bottom:32px}
        .unlock-title{font-size:18px;font-weight:700;font-family:var(--font);margin-bottom:8px}
        .unlock-sub{font-size:13px;color:var(--muted);font-family:var(--mono);margin-bottom:24px}
        .pipeline-visual{display:flex;align-items:center;gap:8px;margin-bottom:24px;flex-wrap:wrap}
        .pipe-badge{font-size:11px;font-family:var(--mono);padding:6px 12px;border-radius:4px;border:1px solid var(--border)}
        .pipe-arrow{color:var(--muted);font-size:12px}
        .wallet-info{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:12px;font-family:var(--mono);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .wallet-dot{width:6px;height:6px;border-radius:50%;background:var(--accent2);flex-shrink:0}
        .wallet-addr{color:var(--accent2)}
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
                  <span>Connected:</span>
                  <span className="wallet-addr">{address.slice(0,6)}...{address.slice(-4)}</span>
                  <span style={{color:"var(--muted)",marginLeft:"auto"}}>Pay 0.01 0G · Confirm in MetaMask</span>
                </div>
              ) : (
                <div className="wallet-info">
                  <span style={{color:"var(--warn)"}}>⚠ Connect your wallet using the button in the top right to pay with MetaMask</span>
                </div>
              )}
              {error && <div className="error-box">{error}</div>}
              <button className="btn-primary" onClick={unlock} disabled={loading || !isConnected} style={{fontSize:15,padding:"14px 32px"}}>
                {loading ? "Agents writing..." : isConnected ? "Unlock with MetaMask · 0.01 0G →" : "Connect wallet to unlock →"}
              </button>
            </div>
          ) : (
            <>
              <div className="article-meta">
                <span className="meta-green">0.01 0G paid</span>
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
                      <a href={`https://chainscan.0g.ai/tx/${v}`} target="_blank" rel="noopener noreferrer" className="proof-link">{String(v).slice(0,16)}...</a>
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
