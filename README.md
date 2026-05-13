# InkGate — AI-Powered Publishing on 0G Network

> **0G APAC Hackathon 2026 — Track 3: Agentic Economy & Autonomous Applications**

InkGate is a fully autonomous AI publishing platform where 4 onchain agents research, fact-check, write, and get paid — all on the 0G Network.

## 🔗 Live Demo
- **App**: http://95.179.186.20:3000
- **Agent IDs**: http://95.179.186.20:3000/api/agent-id
- **Registry**: http://95.179.186.20:3000/api/registry
- **Explorer**: https://chainscan.0g.ai

## 0G Integrations

### 1. 0G Storage
Every generated article is stored permanently on 0G's decentralized storage layer.
Agent state, stats, and prediction market data all persist on 0G Storage.
lib/0g.ts → storeArticle(), storeAgentStats(), storePrediction()

### 2. 0G Compute Network (TEE-verified Inference)
All 4 agents run inference via 0G Compute using `qwen/qwen-2.5-7b-instruct`.
Every inference call is TEE/TeeML verified — cryptographically proven output.
lib/0g-compute.ts → ogInference()
Provider: 0xa48f01287233509FD694a22Bf840225062E67836

### 3. 0G Agent ID
All 4 agents have tokenized identities stored on 0G Storage via the Agent ID protocol.
Each agent has: name, role, address, capabilities, pricePerCall.
app/api/agent-id → bootstrapAgentIdentities()
GET /api/agent-id → returns all 4 agent identities

### 4. 0G Mainnet (Chain ID: 16661)
- Native token: A0GI
- All payments in A0GI
- Agent wallets on 0G chain
- Transactions verifiable on https://chainscan.0g.ai

## Agent Pipeline
User pays 0.01 A0GI
↓
Orchestrator (0x1ba8...)
├→ Research Agent (0xe319...) — 0G Compute inference + live data
├→ Fact Check Agent (0x655C...) — TEE-verified verification
└→ Writer Agent (0x5FfB...) — final article + 0G Storage

## Features

| Feature | Description | 0G Component |
|---|---|---|
| Pay-per-article | 0.01 A0GI unlocks full AI article | 0G Chain + Storage |
| Custom articles | Any topic, researched live | 0G Compute |
| Agent chat | Talk to any agent, pay per message | 0G Compute + Chain |
| AI Debates | 3 agents debate any topic | 0G Compute |
| Predictions | AI price predictions + A0GI betting | 0G Storage |
| Agent registry | All agents exposed as AaaS | 0G Agent ID |

## Tech Stack

- **Frontend**: Next.js 16, React 19, RainbowKit
- **Chain**: 0G Mainnet (Chain ID: 16661)
- **Storage**: 0G Storage SDK (`@0glabs/0g-ts-sdk`)
- **Compute**: 0G Compute SDK (`@0gfoundation/0g-compute-ts-sdk`)
- **Inference**: qwen/qwen-2.5-7b-instruct (TEE/TeeML verified)
- **Wallets**: viem + ethers.js

## API Endpoints
GET  /api/agent-id          — 0G Agent ID registry
GET  /api/agent-wallet      — Live A0GI balances on 0G
GET  /api/registry          — Agent-as-a-Service catalog
GET  /api/article/[slug]    — Pay-gated article generation
POST /api/custom            — Custom topic article
POST /api/chat              — Agent chat
POST /api/debate            — AI agent debate
GET  /api/predictions       — Prediction market
POST /api/predictions       — Generate new prediction
GET  /api/stats             — Platform stats (stored on 0G)
GET  /api/trending          — Trending crypto topics

## Environment Variables

```env
# AI
GROQ_API_KEY=                    # Fallback inference

# 0G Network
OG_RPC_URL=https://evmrpc.0g.ai
OG_INDEXER_URL=https://indexer-storage-turbo.0g.ai
OG_CHAIN_ID=16661
OG_PRIVATE_KEY=                  # Orchestrator key

# Agent Wallets (0G Mainnet)
PAYMENT_RECIPIENT_ADDRESS=
PAYMENT_RECIPIENT_PRIVATE_KEY=
AGENT1_ADDRESS=                  # Research
AGENT1_PRIVATE_KEY=
AGENT2_ADDRESS=                  # FactCheck
AGENT2_PRIVATE_KEY=
AGENT3_ADDRESS=                  # Writer
AGENT3_PRIVATE_KEY=
```

## Track 3 Alignment

**Financial Rails**: Micropayments (0.01 A0GI/article), automated agent payment splitting, revenue sharing across 4 autonomous wallets.

**AI Commerce**: Pay-per-article marketplace, Agent-as-a-Service via `/api/registry`, prediction market with A0GI betting.

**Operational Tools**: Self-custodial agent wallets on 0G chain, Agent ID tokenization, autonomous orchestration without human intervention.

## Team
Built for the 0G APAC Hackathon 2026
