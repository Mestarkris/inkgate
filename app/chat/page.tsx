"use client";
import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const AGENTS = [
  {
    id: "research",
    name: "Research Agent",
    tagline: "Expert researcher with live market data",
    color: "#6366f1",
    bg: "#6366f120",
    border: "#6366f1",
  },
  {
    id: "factcheck",
    name: "Fact Check Agent",
    tagline: "Sharp analyst who questions everything",
    color: "#f59e0b",
    bg: "#f59e0b20",
    border: "#f59e0b",
  },
  {
    id: "writer",
    name: "Writer Agent",
    tagline: "Creative writer who crafts compelling narratives",
    color: "#22c55e",
    bg: "#22c55e20",
    border: "#22c55e",
  },
];

type Message = {
  role: "user" | "assistant";
  content: string;
  txHash?: string;
  agentTx?: string;
};

export default function ChatPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useAccount();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const agent = AGENTS.find((a) => a.id === selectedAgent);

  async function sendMessage() {
    if (!input.trim() || !selectedAgent || loading) return;
    setLoading(true);
    setError(null);
    const userMessage = input.trim();
    setInput("");

    try {
      const { createWalletClient, custom, defineChain, parseUnits } = await import("viem");
      const ogChain = defineChain({
        id: 16661,
        name: "0G Mainnet",
        nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
        rpcUrls: { default: { http: ["https://rpc.ogChain.tech"] } },
      });
      const walletClient = createWalletClient({
        chain: ogChain,
        transport: custom(window.ethereum),
      });
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
      const address = accounts[0] as `0x${string}`;
      const A0GI = "process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT" as `0x${string}`;
      const RECIPIENT = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT as `0x${string}`;
      const AMOUNT = parseUnits("0.01", 6);
      const paddedRecipient = RECIPIENT.slice(2).padStart(64, "0");
      const paddedAmount = AMOUNT.toString(16).padStart(64, "0");
      const data = ("0xa9059cbb" + paddedRecipient + paddedAmount) as `0x${string}`;
      const hash = await walletClient.sendTransaction({
        account: address,
        to: A0GI,
        data,
        chain: ogChain,
      });

      const newMessages: Message[] = [
        ...messages,
        { role: "user", content: userMessage, txHash: hash },
      ];
      setMessages(newMessages);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: selectedAgent,
          message: userMessage,
          txHash: hash,
          userAddress: address,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Chat failed");
      const responseData = await res.json();

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: responseData.reply,
          agentTx: responseData.agentTx,
        },
      ]);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!selectedAgent) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0" }}>
        <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>Back</Link>
          <span style={{ fontSize: 13, color: "#6366f1" }}>InkGate — Agent Chat</span>
        </nav>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>
          <div style={{ display: "inline-block", background: "#6366f120", border: "1px solid #6366f133", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#818cf8", marginBottom: 20 }}>
            Pay per message · Real onchain payments · Agent tips back
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: "#e8e8f0" }}>Agent Chat</h1>
          <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 40, lineHeight: 1.6 }}>
            Talk directly to any InkGate agent. Pay 0.01 A0GI per message. The agent even tips you back $0.001 for every reply. All payments onchain.
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>Choose an agent to chat with</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {AGENTS.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelectedAgent(a.id)}
                style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 16, padding: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = a.color)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e2e")}
              >
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>{a.name}</p>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>{a.tagline}</p>
                </div>
                <div style={{ background: a.bg, color: a.color, fontSize: 13, fontWeight: 600, padding: "8px 20px", borderRadius: 10, whiteSpace: "nowrap", marginLeft: 16, border: "1px solid " + a.border }}>
                  Chat
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", display: "flex", flexDirection: "column" }}>
      <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => { setSelectedAgent(null); setMessages([]); }} style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Back</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}></div>
            <span style={{ fontSize: 13, color: agent?.color }}>{agent?.name}</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>0.01 per message · agent tips $0.001 back</div>
      </nav>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: 680, width: "100%", margin: "0 auto" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 8 }}>Start chatting with {agent?.name}</p>
            <p style={{ fontSize: 13, color: "#4b5563" }}>Each message costs 0.01 A0GI · Paid onchain · Agent tips you back</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 20, display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 12 }}>
            <div style={{ maxWidth: "75%" }}>
              <div style={{
                background: msg.role === "user" ? "#6366f1" : "#12121e",
                border: msg.role === "assistant" ? "1px solid #1e1e2e" : "none",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "12px 16px",
                fontSize: 14,
                lineHeight: 1.7,
                color: "#e8e8f0",
              }}>
                {msg.content}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.txHash && (
                  <a href={"https://chainscan.0g.ai/tx/" + msg.txHash} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#4b5563", textDecoration: "none" }}>
                    payment tx
                  </a>
                )}
                {msg.agentTx && (
                  <a href={"https://chainscan.0g.ai/tx/" + msg.agentTx} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#22c55e", textDecoration: "none" }}>
                    agent tip tx
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "#12121e", border: "1px solid #1e1e2e", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>
              Agent is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ borderTop: "1px solid #1e1e2e", padding: "16px 24px", maxWidth: 680, width: "100%", margin: "0 auto" }}>
        {error && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>{error}</p>}
        {!mounted || !isConnected ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
            <ConnectButton label="Connect Wallet to Chat" />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
              placeholder={"Ask " + agent?.name + " anything... (0.01 A0GI)"}
              style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid #1e1e2e", background: "#12121e", color: "#e8e8f0", fontSize: 14, outline: "none" }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: loading || !input.trim() ? "#3730a3" : "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading || !input.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
            >
              {loading ? "Paying..." : "Send 0.01"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}