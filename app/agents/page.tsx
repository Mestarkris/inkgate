"use client";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export const dynamic = "force-dynamic";

export default function AgentsPage() {
  const [stats, setStats] = useState({ articlesGenerated: 0, totalPaid: 0 });
  const [agents, setAgents] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(d => setStats(d)).catch(() => {});
    fetch("/api/agent-id").then(r => r.json()).then(d => setAgents(d.agents || [])).catch(() => {});
    fetch("/api/agent-wallet").then(r => r.json()).then(d => setWallets(d.agents || [])).catch(() => {});
  }, []);

  const colors = ["#c084fc", "#7b6ef6", "#4fd1a5", "#f0a04b"];

  return (
    <Layout heroContent={
      <div>
        <div className="section-label">AGENT REGISTRY</div>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>Autonomous agent wallets</h1>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:14,fontFamily:"var(--mono)"}}>4 agents · 0G Agent ID · 0G Mainnet · TEE-verified inference</p>
      </div>
    }>
      <style>{`
        .agents-hero{padding:48px 0 32px;border-bottom:1px solid var(--border)}
        .agents-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding:40px 0}
        .agent-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;transition:border-color 0.2s}
        .agent-card:hover{border-color:var(--accent)}
        .agent-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
        .agent-name{font-size:16px;font-weight:700;font-family:var(--font);margin-bottom:4px}
        .agent-role{font-size:12px;color:var(--muted);line-height:1.5}
        .agent-earn{font-size:14px;font-weight:700}
        .agent-online{font-size:10px;color:var(--accent2);font-family:var(--mono);display:flex;align-items:center;gap:4px}
        .agent-balance{background:var(--bg);border-radius:8px;padding:12px 16px;margin-bottom:12px}
        .agent-bal-label{font-size:10px;color:var(--muted);font-family:var(--mono);margin-bottom:4px}
        .agent-bal-val{font-size:20px;font-weight:700;font-family:var(--mono)}
        .agent-caps{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
        .cap{font-size:10px;font-family:var(--mono);padding:3px 8px;border-radius:4px;background:rgba(123,110,246,0.1);color:var(--accent);border:1px solid rgba(123,110,246,0.15)}
        .agent-addr{font-size:10px;font-family:var(--mono);color:var(--muted);word-break:break-all;margin-top:8px}
        .agent-link{font-size:10px;color:var(--accent);font-family:var(--mono);text-decoration:none}
        .stats-bar{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:40px}
        .sbar-item{background:var(--surface);padding:20px;text-align:center}
        .sbar-val{font-size:28px;font-weight:800;color:var(--accent);font-family:var(--font)}
        .sbar-label{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:4px}
        .how-it-works{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:40px}
        .step{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border)}
        .step:last-child{border-bottom:none}
        .step-num{color:var(--accent);font-weight:700;font-family:var(--mono);min-width:20px}
        .step-text{font-size:13px;color:var(--muted);line-height:1.5}

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

      <div className="agents-hero">
        <div className="wrap">
          <div className="section-label">AGENT REGISTRY</div>
          <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>Autonomous agent wallets</h1>
          <p style={{color:"var(--muted)",fontSize:15,fontFamily:"var(--mono)"}}>Every InkGate agent is a real autonomous wallet on 0G. Identities stored via Agent ID protocol.</p>
        </div>
      </div>

      <div className="wrap" style={{paddingTop:40}}>
        <div className="stats-bar">
          <div className="sbar-item"><div className="sbar-val">{stats.articlesGenerated || 0}</div><div className="sbar-label">Articles generated</div></div>
          <div className="sbar-item"><div className="sbar-val">4</div><div className="sbar-label">Active agents</div></div>
          <div className="sbar-item"><div className="sbar-val">{Number(stats.totalPaid || 0).toFixed(3)}</div><div className="sbar-label">0G total paid</div></div>
        </div>

        <div className="agents-grid">
          {(agents.length > 0 ? agents : [
            {id:"orchestrator",name:"InkGate Orchestrator",role:"Routes payments and orchestrates the full agent pipeline",capabilities:["payment-routing","0g-storage","agent-id"],pricePerCall:"0.01 0G",address:""},
            {id:"research",name:"InkGate Research Agent",role:"Fetches live crypto data via 0G Compute (TEE-verified)",capabilities:["market-data","0g-compute","tee-inference"],pricePerCall:"0.004 0G",address:""},
            {id:"factcheck",name:"InkGate Fact Check Agent",role:"Verifies research accuracy via TeeML verified inference",capabilities:["fact-checking","tee-inference","0g-memory"],pricePerCall:"0.003 0G",address:""},
            {id:"writer",name:"InkGate Writer Agent",role:"Writes final articles, stores permanently on 0G Storage",capabilities:["content-writing","0g-storage","article-generation"],pricePerCall:"0.003 0G",address:""},
          ]).map((agent:any, i:number) => {
            const wallet = wallets.find((w:any) => w.id === agent.id);
            return (
              <div key={i} className="agent-card">
                <div className="agent-header">
                  <div>
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-role">{agent.role}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div className="agent-earn" style={{color:colors[i]}}>{agent.pricePerCall}</div>
                    <div className="agent-online"><span style={{width:5,height:5,borderRadius:"50%",background:"var(--accent2)",display:"inline-block"}}></span>Online · 0G Mainnet</div>
                  </div>
                </div>
                <div className="agent-balance">
                  <div className="agent-bal-label">0G Balance</div>
                  <div className="agent-bal-val" style={{color:colors[i]}}>{wallet?.balances?.zeroG ?? "..."} 0G</div>
                </div>
                <div className="agent-caps">
                  {(agent.capabilities || []).map((c:string,j:number) => <span key={j} className="cap">{c}</span>)}
                </div>
                <div className="agent-addr">{agent.address || "Loading..."}</div>
                {agent.address && <a href={`https://chainscan.0g.ai/address/${agent.address}`} target="_blank" rel="noopener noreferrer" className="agent-link">View on 0G Explorer →</a>}
              </div>
            );
          })}
        </div>

        <div className="how-it-works">
          <div className="section-label" style={{marginBottom:16}}>HOW IT WORKS</div>
          {[
            "User pays 0.01 0G to the Orchestrator wallet on 0G",
            "Orchestrator splits 0G to Research, FactCheck, and Writer agents",
            "Each agent calls 0G Compute for TEE-verified inference",
            "Final article stored permanently on 0G Storage",
            "Agent identities verifiable via 0G Agent ID protocol",
          ].map((step,i) => (
            <div key={i} className="step">
              <span className="step-num">{i+1}.</span>
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
