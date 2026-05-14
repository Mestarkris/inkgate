"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "../../components/Layout";

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [teaser, setTeaser] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/teaser/${slug}`).then(r => r.json()).then(d => setTeaser(d.teaser || "")).catch(() => {});
  }, [slug]);

  const unlock = async () => {
    setLoading(true);
    const res = await fetch(`/api/article/${slug}`, {
      headers: { "X-PAYMENT": "0x0000000000000000000000000000000000000000000000000000000000000001" },
    });
    const data = await res.json();
    setArticle(data);
    setUnlocked(true);
    setLoading(false);
  };

  const title = slug?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Layout>
      <style>{`
        .article-hero{padding:48px 0 32px;border-bottom:1px solid var(--border)}
        .article-body{padding:40px 0;max-width:720px}
        .article-tag{font-size:10px;font-family:var(--mono);color:var(--accent);background:rgba(123,110,246,0.1);border:1px solid rgba(123,110,246,0.2);padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:16px}
        .article-title{font-size:36px;font-weight:800;letter-spacing:-1px;margin-bottom:16px;font-family:var(--font);line-height:1.2}
        .article-meta{display:flex;gap:16px;font-size:12px;font-family:var(--mono);color:var(--muted);margin-bottom:24px}
        .meta-green{color:var(--accent2)}
        .article-teaser{font-size:16px;color:var(--muted);line-height:1.7;margin-bottom:32px;font-style:italic}
        .unlock-box{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:32px;text-align:center;margin-bottom:32px}
        .unlock-title{font-size:18px;font-weight:700;font-family:var(--font);margin-bottom:8px}
        .unlock-sub{font-size:13px;color:var(--muted);font-family:var(--mono);margin-bottom:24px}
        .unlock-agents{display:flex;justify-content:center;gap:8px;margin-bottom:24px;flex-wrap:wrap}
        .unlock-agent{font-size:11px;font-family:var(--mono);padding:4px 10px;border-radius:4px;border:1px solid var(--border);color:var(--muted)}
        .article-content{font-size:15px;color:rgba(245,245,240,0.8);line-height:1.9;white-space:pre-wrap;margin-bottom:32px;font-weight:300}
        .article-proof{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:20px}
        .proof-title{font-size:11px;font-family:var(--mono);color:var(--accent);letter-spacing:2px;margin-bottom:14px}
        .proof-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;font-family:var(--mono)}
        .proof-row:last-child{border-bottom:none}
        .proof-key{color:var(--muted)}
        .proof-val{color:var(--accent2);word-break:break-all;max-width:60%;text-align:right}
        .proof-hash{color:var(--accent)}
        .pipeline-visual{display:flex;align-items:center;gap:8px;margin-bottom:32px;flex-wrap:wrap}
        .pipe-badge{font-size:11px;font-family:var(--mono);padding:6px 12px;border-radius:4px;border:1px solid var(--border)}
        .pipe-arrow{color:var(--muted);font-size:12px}

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

      <div className="article-hero">
        <div className="wrap">
          <span className="article-tag">0G ECOSYSTEM</span>
          <div className="article-title">{article?.title || title}</div>
          <div className="article-meta">
            <span className="meta-green">0.01 A0GI</span>
            <span>3 autonomous agents</span>
            <span>TEE verified · 0G Compute</span>
            <span>Stored on 0G Storage</span>
          </div>
          {teaser && !unlocked && <div className="article-teaser">"{teaser}"</div>}
        </div>
      </div>

      <div className="wrap">
        <div className="article-body">
          {!unlocked ? (
            <div className="unlock-box">
              <div className="unlock-title">Unlock this article</div>
              <div className="unlock-sub">3 agents will research, fact-check and write this article live on 0G Compute</div>
              <div className="pipeline-visual" style={{justifyContent:"center",marginBottom:24}}>
                <span className="pipe-badge" style={{background:"#1a1233",color:"#c084fc",borderColor:"rgba(192,132,252,0.2)"}}>Orchestrator</span>
                <span className="pipe-arrow">→</span>
                <span className="pipe-badge" style={{background:"#1a1a3e",color:"var(--accent)",borderColor:"rgba(123,110,246,0.2)"}}>Research</span>
                <span className="pipe-arrow">→</span>
                <span className="pipe-badge" style={{background:"#0f2e22",color:"var(--accent2)",borderColor:"rgba(79,209,165,0.2)"}}>FactCheck</span>
                <span className="pipe-arrow">→</span>
                <span className="pipe-badge" style={{background:"#2e1f0f",color:"var(--warn)",borderColor:"rgba(240,160,75,0.2)"}}>Writer</span>
              </div>
              <button className="btn-primary" onClick={unlock} disabled={loading} style={{fontSize:15,padding:"14px 32px"}}>
                {loading ? "Agents writing..." : "Unlock with 0.01 A0GI →"}
              </button>
            </div>
          ) : (
            <>
              <div className="article-content">{article?.content}</div>
              <div className="article-proof">
                <div className="proof-title">PROOF OF WORK · 0G NETWORK</div>
                <div className="proof-row"><span className="proof-key">Network</span><span className="proof-val">{article?.network}</span></div>
                <div className="proof-row"><span className="proof-key">Generated</span><span className="proof-val">{article?.generatedAt && new Date(article.generatedAt).toLocaleString()}</span></div>
                {article?.ogStorageHash && <div className="proof-row"><span className="proof-key">0G Storage hash</span><span className="proof-val proof-hash">{article.ogStorageHash}</span></div>}
                {article?.agentPipeline && Object.entries(article.agentPipeline).map(([k,v]:any) => (
                  <div key={k} className="proof-row"><span className="proof-key">{k}</span><span className="proof-val">{String(v).slice(0,28)}...</span></div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
