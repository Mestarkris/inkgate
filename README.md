# InkGate

> 3 autonomous AI agents research, fact-check and write articles — paying each other in USDC on X Layer.

**Live Demo:** https://inkgate.vercel.app  
**GitHub:** https://github.com/Mestarkris/inkgate  
**Agent Registry:** https://inkgate.vercel.app/api/registry  
**Agentic Wallet:** https://inkgate.vercel.app/api/agent-wallet  
**Swap Quotes:** https://inkgate.vercel.app/api/swap?from=OKB&to=USDC&amount=1

---

## Project Introduction

InkGate is a multi-agent AI content platform where autonomous agents collaborate, verify, and create crypto content — all while paying each other onchain in USDC on X Layer mainnet.

A user pays $0.01 USDC once. The Orchestrator Agent receives the payment and autonomously splits it to 3 specialist AI agents. Each agent completes its task and pays the next agent onchain — no human involvement, no custodians.

---

## Architecture Overview

```
User
  │
  │  $0.01 USDC (X Layer mainnet)
  ▼
┌─────────────────────────────────┐
│       Orchestrator Agent        │  ← Agentic Wallet (onchain identity)
│  Wallet: PAYMENT_RECIPIENT_ADDR │
└────────┬───────┬────────────────┘
         │       │
    $0.004│  $0.003│  $0.003
         ▼       ▼       ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Research │ │FactCheck │ │  Writer  │
  │  Agent   │ │  Agent   │ │  Agent   │
  │ Agent 1  │ │ Agent 2  │ │ Agent 3  │
  └────┬─────┘ └────┬─────┘ └──────────┘
       │             │
  OKX Market    Verifies
  API + News    Research
  Live Data
       │
       └──────────► FactCheck ──────────► Writer
                                              │
                                              ▼
                                      Final Article
                                      + NFT Minted
                                      + 5 TX Hashes
```

### Agent Roles

| Agent | Address | Role | Receives |
|---|---|---|---|
| Orchestrator | `PAYMENT_RECIPIENT_ADDRESS` | Routes payment, mints NFT | $0.01 from user |
| Research Agent | `AGENT1_ADDRESS` | Live OKX data + news research | $0.004 |
| Fact Check Agent | `AGENT2_ADDRESS` | Verifies research accuracy | $0.003 |
| Writer Agent | `AGENT3_ADDRESS` | Writes final article | $0.003 |

**Agentic Wallet endpoint:** `/api/agent-wallet` — returns live onchain balances and identities for all 4 agents.

---

## Onchain OS & Uniswap Skill Usage

### OKX DEX Aggregator (Uniswap / Onchain OS Swap Skill)

InkGate integrates the OKX DEX aggregator to provide token swap quotes directly on X Layer.

**Endpoint:** `GET /api/swap?from=OKB&to=USDC&amount=1`

```json
{
  "quote": {
    "fromToken": "OKB",
    "toToken": "USDC",
    "fromAmount": "1",
    "toAmount": "48.23",
    "priceImpact": "< 0.01",
    "router": "OKX DEX Aggregator",
    "chainId": "196"
  },
  "network": "X Layer Mainnet"
}
```

Swap quotes are fed into the Research Agent's context so articles on DeFi topics include live swap rate data.

### OKX Market API (Onchain OS Market Data Skill)

All agents consume live OKX market data via `/api/v5/market/ticker`:
- Real-time prices for 50+ tokens
- 24h high / low / change
- Used in: Research Agent, Fact Check Agent, Predictor Agent, Chat Agents

### x402 Protocol (Onchain OS Payment Skill)

Every API endpoint is payment-gated using the [x402 protocol](https://x402.org):
- HTTP 402 response with `X-PAYMENT` header requirement
- Payments verified onchain via X Layer RPC (`eth_getTransactionReceipt`)
- 5 verifiable transaction hashes returned per article unlock

### OKX Wallet API (Onchain OS Wallet Skill)

- Live agent wallet balance queries at `/api/agent-wallet`
- Agents tip users back via `sendUSDC()` after chat interactions
- USDC transfers encoded manually via ERC-20 ABI (`0xa9059cbb`)

---

## Working Mechanics

### 1. Article Pipeline

1. User connects OKX Wallet and pays $0.01 USDC on X Layer
2. Frontend sends `X-PAYMENT: <txHash>` header to `/api/article/[slug]`
3. Orchestrator verifies payment via X Layer RPC
4. Orchestrator splits: Research ($0.004), FactCheck ($0.003), Writer ($0.003)
5. Research Agent fetches live OKX prices + CoinDesk/CoinTelegraph RSS
6. Fact Check Agent verifies the research
7. Writer Agent produces the final article
8. Article NFT minted to reader's wallet address
9. Response includes article + 5 onchain TX hashes

### 2. Agent Chat

- Pay per message with USDC
- Agent fetches live price data for your query
- Agent tips you back 0.001 USDC automatically

### 3. Prediction Market

- AI predicts 24h price direction for BTC/ETH/OKB/SOL
- Users bet USDC on Yes/No
- Auto-settlement at expiry via Predictor Agent

### 4. Agent Debate

- Bull Agent and Bear Agent argue any crypto topic
- Judge Agent declares winner
- Each agent pays the Judge Agent onchain

### 5. Swap Quotes (new)

- `/api/swap` returns live DEX swap quotes for any X Layer token pair
- Powered by OKX DEX Aggregator
- Integrated into agent research context for DeFi articles

---

## Deployment

| Component | URL |
|---|---|
| Live App | https://inkgate.vercel.app |
| Agent Registry | https://inkgate.vercel.app/api/registry |
| Agentic Wallet | https://inkgate.vercel.app/api/agent-wallet |
| Swap API | https://inkgate.vercel.app/api/swap |
| Prediction Market | https://inkgate.vercel.app/predictions |
| Article Pipeline | https://inkgate.vercel.app/article/[slug] |

**Deployment transaction:**  
`0x3943fe4c8ff30770560421d8f0fba34954b0fad9d55c1c3292aeca5bc79ee35b`  
Network: X Layer Mainnet (Chain ID: 196)  
Explorer: https://www.oklink.com/xlayer

---

## X Layer Ecosystem Integration

- **Chain ID:** 196 — X Layer Mainnet
- **Payment token:** USDC (`0x74b7F16337b8972027F6196A17a631aC6dE26d22`)
- **Native currency:** OKB
- **RPC:** `https://rpc.xlayer.tech`
- **Explorer:** https://www.oklink.com/xlayer
- **Wallet:** OKX Wallet (primary)

InkGate is purpose-built for X Layer. All agent wallets, payments, NFT mints, and swap quotes run exclusively on X Layer mainnet. The platform demonstrates a real-world use case: AI agents as autonomous economic actors that earn, spend, and interact with DeFi on X Layer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| AI | Groq API — llama-3.3-70b-versatile |
| Blockchain | X Layer Mainnet (Chain ID: 196) |
| Payments | x402 protocol + viem |
| DEX | OKX DEX Aggregator |
| Market Data | OKX Market API v5 |
| News | CoinDesk + CoinTelegraph RSS |
| Storage | Upstash Redis |
| Wallet | OKX Wallet |
| Deploy | Vercel |

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/Mestarkris/inkgate.git
cd inkgate

# 2. Install
npm install --legacy-peer-deps

# 3. Configure environment
cp .env.example .env.local
# Fill in your keys (see below)

# 4. Run
npm run dev
```

### Environment Variables

```env
GROQ_API_KEY=
NEXT_PUBLIC_CHAIN_ID=196
NEXT_PUBLIC_NETWORK=mainnet

# Orchestrator wallet
PAYMENT_RECIPIENT_ADDRESS=
PAYMENT_RECIPIENT_PRIVATE_KEY=
NEXT_PUBLIC_PAYMENT_RECIPIENT=

# Agent wallets
AGENT1_ADDRESS=
AGENT1_PRIVATE_KEY=
AGENT2_ADDRESS=
AGENT2_PRIVATE_KEY=
AGENT3_ADDRESS=
AGENT3_PRIVATE_KEY=
NEXT_PUBLIC_AGENT1_ADDRESS=
NEXT_PUBLIC_AGENT2_ADDRESS=
NEXT_PUBLIC_AGENT3_ADDRESS=

# OKX API (for DEX + market data)
OKX_API_KEY=
OKX_SECRET_KEY=
OKX_PASSPHRASE=

# Upstash Redis (for prediction market)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Team

| Name | Role |
|---|---|
| Mestarkris | Founder, Full-Stack Developer |

---

## Project Positioning in X Layer Ecosystem

InkGate occupies a unique position in the X Layer ecosystem as the **first AI agent network where agents are economic participants** — not just tools.

Unlike traditional AI platforms where agents are stateless API calls, InkGate agents:
- **Hold wallets** with real USDC balances on X Layer
- **Earn fees** for their services autonomously
- **Spend onchain** by paying downstream agents
- **Mint NFTs** for content they produce
- **Quote DeFi swaps** via OKX DEX aggregator

This creates a blueprint for **agent-native DeFi** on X Layer: AI agents that participate in the economy the same way humans do, using the same infrastructure — OKX Wallet, USDC, X Layer RPC, and OKX DEX.

---

## License

MIT

