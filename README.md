# InkGate — Autonomous AI Publishing on 0G Network

> **0G APAC Hackathon 2026 — Track 3: Agentic Economy & Autonomous Applications**

**Live Demo**: https://inkgate.vercel.app  
**GitHub**: https://github.com/Mestarkris/inkgate  
**Explorer**: https://chainscan.0g.ai

---

## Project Overview

InkGate is a fully autonomous AI publishing platform where 4 onchain agents research, fact-check, write, and get paid — all on the 0G Network. Users pay **0.01 A0GI** to unlock any article. The Orchestrator agent autonomously splits the payment to 3 specialist agents, each calling **0G Compute** for TEE-verified inference. The final article is stored permanently on **0G Storage**. Every agent has a tokenized identity via **0G Agent ID**.

No human intervention. No centralized AI. Pure onchain autonomous intelligence.

---

## System Architecture
User pays 0.01 A0GI
│
▼
┌─────────────────────┐
│   Orchestrator      │  ← 0G Agent ID + 0G Chain
│   0x1ba840fb...     │    Receives payment, splits to agents
└────────┬────────────┘
│ splits A0GI
┌────┴────┬──────────┐
▼         ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Research│ │ Fact   │ │ Writer │  ← All use 0G Compute
│ Agent  │ │ Check  │ │ Agent  │    TEE/TeeML verified
│0xe319..│ │0x655C..│ │0x5FfB..│    inference
└───┬────┘ └───┬────┘ └───┬────┘
│           │          │
└───────────┴──────────┘
│
▼
┌───────────────────────┐
│     0G Storage        │  ← Permanent article storage
│  indexer-storage-     │    Agent state, predictions
│  turbo.0g.ai          │    KV + Log layer
└───────────────────────┘

**Tech Stack**:
- Frontend: Next.js 16, React 19, RainbowKit, Syne/DM Mono fonts
- Chain: 0G Mainnet (Chain ID: 16661, native token: A0GI)
- Storage: `@0glabs/0g-ts-sdk`
- Compute: `@0gfoundation/0g-compute-ts-sdk`
- Wallets: viem + ethers.js
- Deployment: Vercel

---

## 0G Modules Used

### 1. 0G Storage
**What it does**: Decentralized storage with dual-layer architecture (Log permanent archival + KV millisecond queries).

**How InkGate uses it**:
- Every generated article is stored permanently on 0G Storage after generation
- Agent state and identities (Agent ID) are stored on 0G KV layer
- Prediction market data persists across sessions on 0G Storage
- Platform stats (articles generated, total A0GI paid) stored on 0G

```typescript
// lib/0g.ts
await storeArticle({ slug, title, content, agentPipeline, generatedAt });
await registerAgentIdentity({ id, name, role, address, capabilities });
await storePrediction(id, predictionData);
```

**Indexer**: `https://indexer-storage-turbo.0g.ai`

---

### 2. 0G Compute Network (TEE-verified Inference)
**What it does**: Decentralized GPU marketplace with TEE/TeeML verified inference — every AI output is cryptographically proven.

**How InkGate uses it**:
- All 4 agents call 0G Compute for inference instead of centralized AI
- Model: `qwen/qwen-2.5-7b-instruct`
- Provider: `0xa48f01287233509FD694a22Bf840225062E67836`
- Every inference response is TEE verified — judges can verify onchain
- Falls back to Groq only if 0G Compute is unavailable

```typescript
// lib/0g-compute.ts
const { content, verified } = await ogInference(systemPrompt, userPrompt);
// verified = true means TEE proof confirmed onchain
```

---

### 3. 0G Agent ID
**What it does**: Tokenized identity standard for AI agents — stores capabilities, memory, behavior, and ownership on 0G Storage.

**How InkGate uses it**:
- All 4 InkGate agents are registered with tokenized identities on startup
- Each agent has: `id`, `name`, `role`, `address`, `capabilities`, `pricePerCall`
- Identities persist on 0G Storage and are queryable via `/api/agent-id`
- Protocol: `InkGate-AgentID-v1`
GET https://inkgate.vercel.app/api/agent-id
→ Returns all 4 agent identities from 0G Storage

---

### 4. 0G Mainnet (Chain ID: 16661)
**What it does**: EVM-compatible L1 with native A0GI token.

**How InkGate uses it**:
- All payments in native A0GI (not wrapped tokens, not USDC)
- 4 agent wallets live on 0G chain — real autonomous wallets
- Payment splitting happens onchain via `sendA0GI()`
- All transactions verifiable on https://chainscan.0g.ai
- RPC: `https://evmrpc.0g.ai`

---

## How 0G Modules Support the Product

| Feature | 0G Module | Why it matters |
|---|---|---|
| Article generation | 0G Compute (TEE) | Verifiable AI — judges can prove inference happened |
| Article storage | 0G Storage | Permanent, decentralized, censorship-resistant |
| Agent identities | 0G Agent ID | Each agent is a tokenized, composable service |
| A0GI payments | 0G Mainnet | Native token payments, no bridges needed |
| Predictions | 0G Storage | Market data persists across sessions |
| Agent chat | 0G Compute (TEE) | Every chat response is TEE-verified |
| AI debates | 0G Compute (TEE) | 3 agents debate, all TEE-verified |

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/agent-id` | GET | All 4 agent identities from 0G Storage |
| `/api/agent-id` | POST | Bootstrap/refresh agent identities on 0G |
| `/api/agent-wallet` | GET | Live A0GI balances from 0G chain |
| `/api/registry` | GET | Agent-as-a-Service catalog |
| `/api/article/[slug]` | GET | Pay-gated article (requires X-PAYMENT header) |
| `/api/custom` | POST | Custom topic article generation |
| `/api/chat` | POST | Agent chat with TEE-verified response |
| `/api/debate` | POST | 3-agent debate on any topic |
| `/api/predictions` | GET/POST | AI price predictions stored on 0G |
| `/api/stats` | GET | Platform stats from 0G Storage |
| `/api/trending` | GET | Live crypto prices + 0G token price |

---

## Local Deployment

### Prerequisites
- Node.js 18+
- npm or yarn
- A0GI tokens on 0G Mainnet (get from faucet below)
- Groq API key (free at https://console.groq.com)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Mestarkris/inkgate.git
cd inkgate

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Create .env.local
cp .env.example .env.local
# Fill in your values (see below)

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

```env
# AI (fallback when 0G Compute unavailable)
GROQ_API_KEY=your_groq_key

# 0G Network
OG_RPC_URL=https://evmrpc.0g.ai
OG_INDEXER_URL=https://indexer-storage-turbo.0g.ai
OG_CHAIN_ID=16661

# Agent Wallets on 0G Mainnet
# Generate 4 EVM wallets and fund them with A0GI
PAYMENT_RECIPIENT_ADDRESS=0x...         # Orchestrator
PAYMENT_RECIPIENT_PRIVATE_KEY=0x...
OG_PRIVATE_KEY=0x...                    # Same as orchestrator
NEXT_PUBLIC_PAYMENT_RECIPIENT=0x...

AGENT1_ADDRESS=0x...                    # Research Agent
AGENT1_PRIVATE_KEY=0x...
AGENT2_ADDRESS=0x...                    # Fact Check Agent
AGENT2_PRIVATE_KEY=0x...
AGENT3_ADDRESS=0x...                    # Writer Agent
AGENT3_PRIVATE_KEY=0x...

NEXT_PUBLIC_AGENT1_ADDRESS=0x...
NEXT_PUBLIC_AGENT2_ADDRESS=0x...
NEXT_PUBLIC_AGENT3_ADDRESS=0x...
```

### Generate Agent Wallets

```bash
node -e "
const {ethers} = require('ethers');
const labels = ['Orchestrator','Research','FactCheck','Writer'];
labels.forEach(l => {
  const w = ethers.Wallet.createRandom();
  console.log(l+': '+w.address+' | '+w.privateKey);
});
"
```

---

## Test Account & Faucet Instructions

### Live Demo Wallets (0G Mainnet)

| Agent | Address | Role |
|---|---|---|
| Orchestrator | `0x1ba840fb6fC2a1a9cd9880803d920228DCF919E9` | Payment routing |
| Research | `0xe319c0A261523614319B620205E1A2d2db647686` | Data fetching |
| FactCheck | `0x655Cb1Da29e64650537Bd4B8b0eA032A8135B529` | Verification |
| Writer | `0x5FfBC77D1D83842cE74BcBA70ad5f8454130375d` | Article writing |

View all on explorer: https://chainscan.0g.ai

### Getting A0GI Tokens

**0G Mainnet faucet**: Not yet available for mainnet  
**0G Testnet faucet**: https://faucet.0g.ai (0.1 A0GI per wallet per day)  
**Buy A0GI**: Available on Binance, Gate.io, Bitget

### Testing Without A0GI

The app supports **optimistic payment verification** — you can test the full pipeline by passing a dummy transaction hash:

```bash
curl -s "https://inkgate.vercel.app/api/article/0g-storage-deep-dive" \
  -H "X-PAYMENT: 0x0000000000000000000000000000000000000000000000000000000000000001"
```

Or simply click any article on https://inkgate.vercel.app and click "Unlock" — it works in demo mode.

---

## Reviewer Notes

1. **Article generation**: Click any article → "Unlock with 0.01 A0GI" → Full pipeline runs (~10-15 seconds)
2. **Agent identities**: Visit https://inkgate.vercel.app/api/agent-id to see all 4 agents on 0G Storage
3. **0G Compute**: Check server logs — `[0G Compute] inference OK model=qwen/qwen-2.5-7b-instruct verified=true`
4. **Predictions**: Visit https://inkgate.vercel.app/predictions → "Generate new prediction" → stored on 0G Storage
5. **Debate**: Visit https://inkgate.vercel.app/debate → type any topic → 3 agents debate via 0G Compute
6. **Custom articles**: Visit https://inkgate.vercel.app/custom → type any topic → agents write it live

---

## Track 3 Alignment

**Financial Rails**
- Micropayments: 0.01 A0GI per article, auto-split to 3 agents
- Automated billing: payment gate on every endpoint
- Revenue sharing: Orchestrator → Research (0.002) → FactCheck (0.002) → Writer (0.002)

**AI Commerce & Social**
- AI-driven marketplace: pay-per-article, pay-per-chat, pay-per-debate
- Agent-as-a-Service: `/api/registry` exposes all 4 agents as callable services
- Prediction market: A0GI betting on AI-generated price forecasts

**Operational Tools**
- Self-custodial agent wallets: 4 real 0G wallets, each controls its own key
- Agent ID protocol: tokenized identities stored on 0G Storage
- Autonomous orchestration: no human intervention in the pipeline

---

## Built With

- [0G Labs](https://0g.ai) — Storage, Compute, Agent ID, Mainnet
- [Next.js](https://nextjs.org) — React framework
- [RainbowKit](https://rainbowkit.com) — Wallet connection
- [viem](https://viem.sh) — EVM interactions
- [Groq](https://groq.com) — Fallback inference
- [CoinGecko](https://coingecko.com) — Price data

---

*Built for 0G APAC Hackathon 2026*
