"use client";
import { useState, use, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getArticle } from "@/lib/articles";
import Link from "next/link";

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const article = getArticle(slug);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teaser, setTeaser] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
    fetch("/api/teaser/" + slug)
      .then((r) => r.json())
      .then((d) => setTeaser(d.teaser))
      .catch(() => {});
  }, [slug]);

  if (!article) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Article not found</p>
      </div>
    );
  }

  async function unlock() {
    setLoading(true);
    setError(null);
    try {
      const { createWalletClient, custom, defineChain, parseUnits } = await import("viem");

      const xlayer = defineChain({
        id: 196,
        name: "X Layer",
        nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
        rpcUrls: { default: { http: ["https://rpc.xlayer.tech"] } },
      });

      const walletClient = createWalletClient({
        chain: xlayer,
        transport: custom(window.ethereum),
      });

      // Request accounts explicitly first
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
      const address = accounts[0] as `0x${string}`;

      const USDC_ADDRESS = "0x74b7F16337b8972027F6196A17a631aC6dE26d22" as `0x${string}`;
      const RECIPIENT = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT as `0x${string}`;
      const AMOUNT = parseUnits("0.01", 6);

      const paddedRecipient = RECIPIENT.slice(2).padStart(64, "0");
      const paddedAmount = AMOUNT.toString(16).padStart(64, "0");
      const transferData = ("0xa9059cbb" + paddedRecipient + paddedAmount) as `0x${string}`;

      const hash = await walletClient.sendTransaction({
        account: address,
        to: USDC_ADDRESS,
        data: transferData,
        chain: xlayer,
      });

      const response = await fetch("/api/article/" + slug, {
        method: "GET",
        headers: {
          "X-PAYMENT": hash,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error("Error " + response.status + ": " + text);
      }

      const data = await response.json();
      setContent(data.content);
      setTxHash(hash);

    } catch (err: any) {
      console.error("Full error:", err);
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copyHash() {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (content) {
    const oklink = "https://www.oklink.com/xlayer/tx/" + txHash;
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0" }}>
        <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>Back</Link>
          <span style={{ fontSize: 13, color: "#6366f1" }}>InkGate</span>
        </nav>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 32, color: "#e8e8f0" }}>
            {article.title}
          </h1>
          <div style={{ fontSize: 16, lineHeight: 1.8, color: "#9ca3af" }}>
            {content.split("\n").filter(p => p.trim()).map((para, i) => (
              <p key={i} style={{ marginBottom: 20 }}>{para}</p>
            ))}
          </div>
          {txHash && (
            <div style={{ marginTop: 48, background: "#0d1f13", border: "1px solid #166534", borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#22c55e", marginBottom: 8 }}>
                Payment confirmed on X Layer
              </p>
              <p style={{ fontSize: 11, color: "#4ade80", wordBreak: "break-all", marginBottom: 12, fontFamily: "monospace" }}>
                {txHash}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={oklink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, background: "#166534", color: "#22c55e", padding: "6px 14px", borderRadius: 8, textDecoration: "none" }}>
                  View on OKLink
                </a>
                <button onClick={copyHash} style={{ fontSize: 12, background: "#1e1e2e", color: "#e8e8f0", padding: "6px 14px", borderRadius: 8, border: "1px solid #374151", cursor: "pointer" }}>
                  {copied ? "Copied!" : "Copy TX Hash"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", display: "flex", flexDirection: "column" }}>
      <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>Back</Link>
        <span style={{ fontSize: 13, color: "#6366f1" }}>InkGate</span>
      </nav>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440, background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 24, padding: 32 }}>
          {process.env.NEXT_PUBLIC_NETWORK !== "mainnet" && (
            <div style={{ background: "#451a03", border: "1px solid #92400e", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "#fbbf24", marginBottom: 20, textAlign: "center" }}>
              TESTNET MODE - transactions will not count for submission
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1" }}></div>
            <span style={{ fontSize: 12, color: "#6b7280" }}>InkGate Research · Live web data</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 16, color: "#e8e8f0" }}>
            {article.title}
          </h1>
          <div style={{ borderLeft: "2px solid #6366f1", paddingLeft: 14, marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, fontStyle: "italic" }}>
              {teaser ?? "Loading preview..."}
            </p>
          </div>
          <div style={{ background: "#0a0a0f", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "center" }}>
            <p style={{ fontSize: 36, fontWeight: 800, color: "#6366f1", marginBottom: 4 }}>$0.01</p>
            <p style={{ fontSize: 12, color: "#4b5563" }}>USDC on X Layer · 0 gas fee · Instant</p>
          </div>
          {!mounted ? (
            <div style={{ height: 48 }} />
          ) : !isConnected ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ConnectButton label="Connect Wallet to Unlock" />
            </div>
          ) : (
            <button
              onClick={unlock}
              disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: loading ? "#3730a3" : "#6366f1", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Researching & writing your article..." : "Pay $0.01 & Read Now"}
            </button>
          )}
          {error && (
            <p style={{ fontSize: 13, color: "#f87171", marginTop: 12, textAlign: "center" }}>{error}</p>
          )}
          <p style={{ fontSize: 11, color: "#374151", marginTop: 16, textAlign: "center" }}>
            Powered by x402 · X Layer · InkGate
          </p>
        </div>
      </div>
    </div>
  );
}