# Economy router — price comparison and per-task savings (2026-06-13)

_How much the NUXS Economy router cuts off the bill of a single delegated task.
The companion to the **coverage-economics** study (which measures what fraction of
the traffic gets delegated). This study measures what one delegated task costs in
each available model._

## Honesty labels

- All prices are public list prices as of 2026-06-13 (USD per million tokens).
- "Same task" = 10M tokens of work delegated to a subagent, modeled as 8M input
  + 2M output (~80/20, typical agent profile: read heavy, write light).
- We report **three axes separately** — input-only, output-only, and blended —
  because the right number depends on the workload mix. Picking the one biggest
  axis to advertise is marketing; the honest number is the **blended** column,
  and we publish all three so anyone can recheck.
- Two cost reductions exist but are **not** included in the headline figures
  (we keep them conservative): prompt caching (up to 98% off on cached input)
  and DeepSeek off-peak (~50% off, 16:30–00:30 UTC).
- Speed trade-off: DeepSeek V4-Flash is ~40–60 tok/s vs ~80–100 on Claude
  models. The Economy router accepts the latency in exchange for the price cut
  on mechanical/code tasks; interactive tasks stay on Claude.

---

## 1. Price table (USD per million tokens, list, 2026-06-13)

| Subagent role | Model | $/M input | $/M output |
|---|---|---:|---:|
| baseline (top tier) | **Claude Fable 5** | $10.00 | $50.00 |
| baseline | **Claude Opus 4.8** | $5.00 | $25.00 |
| `codador-sonnet` | Claude Sonnet 4.6 | $3.00 | $15.00 |
| `mecanico-haiku` | Claude Haiku 4.5 | $1.00 | $5.00 |
| `executor-deepseek` | **DeepSeek V4-Flash** | $0.14 | $0.28 |

Notes:
- Fable 5 was released 2026-06-09 by Anthropic, positioned 2× the price of
  Opus 4.8 ($10/$50 vs $5/$25). Same Anthropic pricing dropped the older
  Opus 4.x ($15/$75) to today's $5/$25.
- DeepSeek V4-Flash is the current endpoint when calling `api.deepseek.com`
  with `deepseek-chat` (the legacy `deepseek-chat`/`deepseek-reasoner` names
  resolve to V4-Flash non-thinking/thinking modes until 2026-07-24).
- DeepSeek V3 variants (V3 0324, V3.1, V3.2) remain available via OpenRouter
  with separate pricing — V3 0324 is $0.20/$0.77, V3.2 is $0.23/$0.34. The
  router targets V4-Flash because it is both cheaper and stronger on the
  current code benchmarks (Aider Polyglot).

---

## 2. Same task, every model — 10M tokens (8M in + 2M out)

| Subagent | Model | Cost of the task | vs Fable 5 | vs Opus 4.8 |
|---|---|---:|---:|---:|
| baseline (top) | Fable 5 | **$180.00** | 1× | — |
| baseline | Opus 4.8 | **$90.00** | 2× | 1× |
| `codador-sonnet` | Sonnet 4.6 | **$54.00** | 3.3× | 1.7× |
| `mecanico-haiku` | Haiku 4.5 | **$18.00** | 10× | 5× |
| `executor-deepseek` | DeepSeek V4-Flash | **$1.68** | **107×** | **54×** |

Read: the same 10M-token task that costs $180 on Fable 5 costs $1.68 when the
Economy router delegates it to DeepSeek V4-Flash — a **107× reduction** on a
typical agent workload.

---

## 3. Multipliers per axis (where the headline numbers come from)

The honest number depends on which axis you compare. We publish all three.

### vs Claude Fable 5 (top tier)

| Subagent | Input-only | Output-only | **Blended 80/20 (typical)** |
|---|---:|---:|---:|
| Opus 4.8 | 2× | 2× | 2× |
| Sonnet 4.6 | 3.3× | 3.3× | 3.3× |
| Haiku 4.5 | 10× | 10× | 10× |
| DeepSeek V4-Flash | 71× | **179×** | **107×** |

### vs Claude Opus 4.8 (current Anthropic mid baseline)

| Subagent | Input-only | Output-only | **Blended 80/20 (typical)** |
|---|---:|---:|---:|
| Sonnet 4.6 | 1.7× | 1.7× | 1.7× |
| Haiku 4.5 | 5× | 5× | 5× |
| DeepSeek V4-Flash | 36× | **89×** | **54×** |

### Honest headline

> "Up to **179× cheaper on output**, **107× on a typical agent task** — DeepSeek
> V4-Flash vs Claude Fable 5. The same 10M-token task costs $180 on Fable 5 and
> $1.68 through the Economy router."

The 179× is the ceiling (output-only vs top tier). The 107× is the conservative
realistic figure for a typical agent workload. We do not chase the larger numbers
that appear elsewhere in the market by hiding the input cost — both eaten.

---

## 4. How the router actually chooses

The Economy router does not pick "cheapest always" — it routes by task type and
falls back on quality. Three subagents are wired today:

- **`executor-deepseek`** (DeepSeek V4-Flash) takes **all routable tasks**
  (code + mechanical) when a DeepSeek key is set in the Economy panel.
- **`codador-sonnet`** (Sonnet 4.6) and **`mecanico-haiku`** (Haiku 4.5) are
  the **fallback** when no DeepSeek key is configured.
- **Quality fallback:** if DeepSeek errors on a code task, the orchestrating
  Claude redoes it (instructed in the deny message). The routing is graded,
  not blind.
- **Interactive tasks** (chat, ambiguous requests) stay on the main Claude
  model — the router only handles delegable, spec-complete work.

---

## 5. Other cheap models in the market (June 2026)

We do not route to these today, but list them so the decision is auditable. The
ranking is by output price, which is the axis where heavy agent traffic hurts.

| Model | $/M in | $/M out | Provider | Notes |
|---|---:|---:|---|---|
| **DeepSeek V4-Flash** | $0.14 | **$0.28** | DeepSeek | current router target — best on Aider Polyglot for the price |
| DeepSeek V3.2 | $0.23 | $0.34 | OpenRouter | legacy V3 variant, still active |
| Gemini 3.1 Flash-Lite | $0.10 | $0.40 | Google | lighter tasks |
| DeepSeek V3.2 Exp | $0.27 | $0.41 | OpenRouter | experimental |
| Mistral Small 3.2 | $0.10 | $0.60 | Mistral | mid-tier general |
| Gemini 2.5 Flash | $0.15 | $0.60 | Google | mid-tier general |
| DeepSeek V3 0324 | $0.20 | $0.77 | OpenRouter | original V3 |
| DeepSeek V4-Pro | $0.435 | $0.87 | DeepSeek | heavy code |

Why DeepSeek V4-Flash and not Gemini 3.1 Flash-Lite: Flash-Lite is $0.40 output
(vs $0.28) and weaker on code benchmarks (Aider Polyglot leadership belongs to
DeepSeek V3.2/V4 family). The router prefers the model that wins the relevant
benchmark, not the one with the lowest sticker.

---

## 6. What this study is not

- **Not** the engine margin (that is 91.62% on the 626M cumulative benchmark —
  see `BENCHMARK-626M.md`).
- **Not** the coverage (that is ~46% on the code profile — see `coverage-economics/`).
- **Not** a full bill saving for a real client (the three axes — engine, coverage,
  routing — are independent and only compose to a single number per real
  workload, which we publish per client through the in-product meter).
- This study only measures the **routing axis**: given a delegated task,
  what does it cost in each available model. The Economy router converts that
  axis into client-side savings by sending the right tasks to the right model.

---

## Method

Prices are taken from the providers' published list pricing as of 2026-06-13
(Anthropic, DeepSeek official, OpenRouter for the V3 family). Per-task cost is
linear: cost = M_input × price_input + M_output × price_output. The 8M/2M split
is a public default for typical agent workloads (read-heavy, write-light); we
publish the per-axis multipliers so a reader with a different split can recompute
without rerunning anything.

Sources:
- Anthropic: https://www.cloudzero.com/blog/claude-mythos-pricing/
- DeepSeek: https://api-docs.deepseek.com/quick_start/pricing
- Cross-provider: https://www.cloudzero.com/blog/llm-api-pricing-comparison/
- LLM API Pricing 2026: https://www.tldl.io/resources/llm-api-pricing-2026
