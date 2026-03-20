# InkGate

> 3 autonomous AI agents research, fact-check and write articles — paying each other in USDC on X Layer.

## What is InkGate?

InkGate is a multi-agent AI content platform built on X Layer. A user pays $0.01 USDC once. The Orchestrator autonomously splits that payment to 3 AI agents onchain. Each agent does its job and pays the next agent — all without human involvement.

## How the agent pipeline works

1. User pays $0.01 USDC on X Layer mainnet
2. Orchestrator splits payment to 3 agents onchain
3. Research Agent searches web for live data → pays Fact Check Agent
4. Fact Check Agent verifies the research → pays Writer Agent
5. Writer Agent writes the final article
6. User receives article + 5 verifiable onchain transaction links

## Agent payment flow

| Agent | Role | Receives |
|---|---|---|
| Orchestrator | Routes payment | $0.01 from user |
| Research Agent | Searches web for data | $0.004 |
| Fact Check Agent | Verifies research | $0.003 |
| Writer Agent | Writes final article | $0.003 |

## Tech stack

- Frontend: Next.js 16, Tailwind CSS
- AI: Groq API (llama-3.3-70b-versatile)
- Payments: x402 protocol, viem
- Blockchain: X Layer mainnet (Chain ID: 196)
- Wallet: OKX Wallet
- Stats: Upstash Redis
- Deploy: Netlify

## X Layer integration

- Chain ID: 196
- Network: X Layer Mainnet
- Payment token: USDC
- Explorer: https://www.oklink.com/xlayer

## Hackathon submission

- Live demo: https://inkgate.vercel.app
- GitHub: https://github.com/Mestarkris/inkgate
- Transaction hash: 0x3943fe4c8ff30770560421d8f0fba34954b0fad9d55c1c3292aeca5bc79ee35b
- Network: X Layer Mainnet

## Local development

1. Clone the repo
2. Install dependencies:
```
npm install --legacy-peer-deps
```
3. Create .env.local with:
```
GROQ_API_KEY=
NEXT_PUBLIC_CHAIN_ID=196
NEXT_PUBLIC_NETWORK=mainnet
PAYMENT_RECIPIENT_ADDRESS=
NEXT_PUBLIC_PAYMENT_RECIPIENT=
PAYMENT_RECIPIENT_PRIVATE_KEY=
AGENT1_ADDRESS=
AGENT1_PRIVATE_KEY=
AGENT2_ADDRESS=
AGENT2_PRIVATE_KEY=
AGENT3_ADDRESS=
AGENT3_PRIVATE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
4. Run:
```
npm run dev
```

## License

MIT