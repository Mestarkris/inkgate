"use client";
import { useState } from "react";
import Layout from "../components/Layout";

const AGENTS = [
  { id: "research", name: "Research Agent", role: "Live crypto data + 0G ecosystem research", color: "#7b6ef6" },
  { id: "factcheck", name: "Fact Check Agent", role: "TEE-verified fact checking on 0G Compute", color: "#4fd1a5" },
  { id: "writer", name: "Writer Agent", role: "Sharp articles stored on 0G Storage", color: "#f0a04b" },
];

export const dynamic = "force-dynamic";

export default function ChatPage() {
  const [agentId, setAgentId] = useState("research");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const txHash = "0x0000000000000000000000000000000000000000000000000000000000000001";

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, agentId, txHash }),
    });
    const data = await res.json();
    setMessages(m => [...m, { role: "agent", content: data.reply, teeVerified: data.teeVerified, agentTx: data.agentTx }]);
    setLoading(false);
  };

  const agent = AGENTS.find(a => a.id === agentId);

  return (
    <Layout heroContent={
      <div>
        <div className="section-label">AGENT CHAT</div>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:-1,marginBottom:12,fontFamily:"var(--font)"}}>Talk to any agent</h1>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:14,fontFamily:"var(--mono)"}}>Direct chat · Pay per message · 0G Compute TEE inference · Agent tips you back</p>
      </div>
    }>
      <style>{`
        .chat-wrap{display:grid;grid-template-columns:240px 1fr;gap:0;min-height:calc(100vh - 120px)}
        .chat-sidebar{border-right:1px solid var(--border);padding:24px}
        .chat-agent-btn{width:100%;text-align:left;background:transparent;border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:8px;cursor:pointer;transition:all 0.2s;font-family:var(--font)}
        .chat-agent-btn:hover,.chat-agent-btn.active{border-color:var(--accent);background:var(--surface)}
        .chat-agent-name{font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px}
        .chat-agent-role{font-size:11px;color:var(--muted);line-height:1.4}
        .chat-main{display:flex;flex-direction:column}
        .chat-header{padding:20px 24px;border-bottom:1px solid var(--border)}
        .chat-agent-label{font-size:16px;font-weight:700;font-family:var(--font)}
        .chat-agent-sub{font-size:12px;color:var(--muted);font-family:var(--mono)}
        .chat-messages{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px;min-height:400px}
        .msg-user{align-self:flex-end;background:var(--accent);color:#fff;padding:12px 16px;border-radius:12px 12px 2px 12px;max-width:70%;font-size:14px;line-height:1.6}
        .msg-agent{align-self:flex-start;background:var(--surface);border:1px solid var(--border);padding:12px 16px;border-radius:2px 12px 12px 12px;max-width:70%;font-size:14px;line-height:1.6;color:var(--muted)}
        .msg-meta{font-size:10px;font-family:var(--mono);color:var(--muted);margin-top:6px}
        .msg-tee{color:var(--accent2)}
        .chat-input-row{display:flex;gap:8px;padding:16px 24px;border-top:1px solid var(--border)}
        .chat-input{flex:1;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:12px 16px;border-radius:8px;font-size:14px;font-family:var(--mono);outline:none}
        .chat-input:focus{border-color:var(--accent)}
        .chat-input::placeholder{color:var(--muted)}
        .empty-chat{text-align:center;padding:60px 20px;color:var(--muted);font-family:var(--mono)}
      `}</style>
      <div className="chat-wrap">
        <div className="chat-sidebar">
          <div className="section-label" style={{marginBottom:16}}>SELECT AGENT</div>
          {AGENTS.map(a => (
            <button key={a.id} className={`chat-agent-btn ${agentId === a.id ? "active" : ""}`} onClick={() => setAgentId(a.id)}>
              <div className="chat-agent-name" style={{color:a.color}}>{a.name}</div>
              <div className="chat-agent-role">{a.role}</div>
            </button>
          ))}
          <div style={{marginTop:24,padding:12,background:"var(--surface2)",borderRadius:8,fontSize:11,fontFamily:"var(--mono)",color:"var(--muted)"}}>
            <div style={{color:"var(--accent2)",marginBottom:4}}>0G Compute</div>
            TEE-verified inference · qwen-2.5-7b
          </div>
        </div>
        <div className="chat-main">
          <div className="chat-header">
            <div className="chat-agent-label" style={{color:agent?.color}}>{agent?.name}</div>
            <div className="chat-agent-sub">{agent?.role} · 0G Mainnet</div>
          </div>
          <div className="chat-messages">
            {messages.length === 0 && <div className="empty-chat">Ask {agent?.name} anything about 0G ecosystem, crypto, or AI...</div>}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "msg-user" : "msg-agent"}>
                {m.content}
                {m.role === "agent" && (
                  <div className="msg-meta">
                    {m.teeVerified && <span className="msg-tee">✓ TEE verified · </span>}
                    0G Compute
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="msg-agent">Thinking via 0G Compute...</div>}
          </div>
          <div className="chat-input-row">
            <input className="chat-input" placeholder={`Ask ${agent?.name} anything...`} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
            <button className="btn-primary" onClick={send} disabled={loading || !input.trim()}>Send</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
