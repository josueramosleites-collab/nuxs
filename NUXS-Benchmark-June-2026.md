# NUXS Benchmark — June 2026

**An auditable context-compression study**

---

- **Scope:** 17 text/code capsules + 3 multimodal capabilities + Squeeze + Economy.
- **Cumulative audited volume:** 1,026,804,861 tokens (Capsules 626,784,439 · Squeeze 400,020,422).
- **Capsules:** 91.62% margin (saved÷intercepted) · **Squeeze:** 80.8% effective (saved÷total) — different bases, reported separately.
- **Headline run this round:** 400,020,422 tokens (Squeeze) — 80.8% effective, 8.57/10 quality, zero unrecoverable items across 138 judgments.
- **Tokenizer:** `cl100k_base`, declared as a reproducible proxy.
- **Engine:** `nuxs-capsule@0.5.73` (SDK `compress` + `compressMessages`) · npm Jun 19.
- **Date:** June 20, 2026.

---

This document consolidates the full NUXS audit conducted through June 20, 2026 and introduces, alongside the capsules already published in the [previous Benchmark](https://nuxs.ai/benchmark), two newly measured axes — **Squeeze** (cross-message demand paging) and **Economy** (routing to a cheaper model) — plus three real-billing campaigns reconciled against the provider's official ledger. Every number is recomputable from the artifacts published on [GitHub](https://github.com/josueramosleites-collab/nuxs): harness, execution log, and per-sample raw records.

---

## Contents

1. [Executive summary](#1--executive-summary)
2. [How the engine works — three layers](#2--how-the-engine-works--three-layers)
3. [Coverage graph](#3--the-coverage-graph--what-each-layer-reaches)
4. [Measurement protocol](#4--measurement-protocol)
5. [Results — Squeeze 400M](#5--results--squeeze-400m-tokens-two-profiles)
6. [Capsules — recap](#6--capsules--recap-and-update)
7. [Financial validation — 3 batteries](#7--financial-validation--the-three-real-billing-batteries)
8. [Production validation — the wild run](#8--production-validation--the-wild-run)
9. [Coverage is the lever — evolution](#9--coverage-is-the-lever--the-evolution)
10. [Quality — the Arena and guards](#10--quality--the-arena-and-the-guards)
11. [Compression is not savings](#11--compression-is-not-savings--the-three-quantities-we-report)
12. [Limitations and intent](#12--limitations-and-intent)
13. [Cumulative total and distribution](#13--cumulative-total-and-per-capsule-distribution)
14. [Reproducibility](#14--reproducibility)

---

## 1 — Executive summary

NUXS is a context-compression engine for AI agents (Claude Code, Cursor, Cline, any MCP agent), built as **three stacking layers** — Capsule (specialist compressors, runs first), Squeeze (catches what the capsules did not compress, cross-message) and Economy (model swap) — each reaching a saving the previous one cannot. This study measures all three and adds what the whole field was missing: **real money reconciled to the provider's ledger**.

| Metric | Value |
|---|---|
| Cumulative audited volume | **1,026,804,861 tokens** |
| Tokens saved (cumulative) | 897,569,721 |
| Capsule margin (saved÷intercepted) | 91.62% |
| Squeeze effective (saved÷total) | 80.8% |
| Engine layers | Capsule · Squeeze · Economy |
| Largest single run | 400,020,422 tokens (Squeeze) |
| Coverage in the Squeeze run | 81.5% |
| Compression in the Squeeze run | 99.1% |
| Effective margin in the Squeeze run | **80.8%** |
| Quality in the Squeeze run | 8.57/10 · 0 unrecoverable |
| Economy, output | **up to 179× cheaper (99.4%)** |
| Economy, combined (in+out) | ~61× (98.4%) |
| Real billing reconciled | campaigns A, B (Squeeze) + B3 (Economy) vs official ledger |
| Algorithmic capsules (local, zero cost) | 11 |
| LLM-based capsules (real calls) | 6 |
| Multimodal capabilities | 3 |
| Real Claude Code sessions in corpus | 100 |
| Public raws | [github.com/josueramosleites-collab/nuxs](https://github.com/josueramosleites-collab/nuxs) |

Four commitments distinguish this study from the prevailing practice in context-compression measurement:

- **Full auditability.** Every run publishes its harness, execution log, and per-sample raw records (one line per item, with the SHA-256 of the input). Every number is recomputable from the artifacts.
- **Quality as a gate, not a footnote.** Margin only becomes product after passing the Arena — real agents performing real tasks on the result, with judges scoring quality. As of v0.5.36 this gate is a formal release rule.
- **Three honest quantities where the industry publishes one.** We distinguish **compression** (saved ÷ intercepted), **coverage** (intercepted ÷ total) and **effective margin** (saved ÷ total — the real economy on the bill) — a distinction most published measurements do not make.
- **Cent-level financial reconciliation.** Three real-billing campaigns were run with the same load sent twice (raw and compressed), and what the provider charged was checked against three independent sources: account screenshots, per-call audit trail, and Anthropic's official ledger via the Admin API.

---

## 2 — How the engine works — three layers

The technical thesis is that **context compression is mapping, not encoding**: each data type has its own structure, and a specialized parser that understands that structure preserves the load-bearing signal and discards the noise — in contrast to generic perplexity-based compressors, which prune token by token without a model of the data.

The real economy is the **effective margin** = tokens saved ÷ total tokens. "Saved" already encodes what was removed from the intercepted slice (you can only save from what you touch), so the effective margin **is** the realized economy, reported as a single number — not as "coverage × margin". The binding constraint on that effective margin is **coverage**: a 99% ratio over 46% of traffic yields ~40% effective; the same ratio over 80% coverage yields ~80% effective. Coverage and ratio are *decompositions* of the effective margin — the reported number is the effective margin itself.

NUXS is a **three-layer engine**. The layers stack: each reaches a saving the previous one cannot.

### Layer 1 — Capsule (specialist compressors, runs first)

**17 specialist capsules + 3 multimodal.** The capsule is the **first stage of the pipeline**. Each capsule is an *expert for one data type* (logs, SQL, stack traces, diffs, test output, network, build, API spec, …): when the data **is its type**, it compresses it the best way possible — a dense, structure-preserving representation, and better than any generic compressor could achieve. Aggregate margin **87–95%** per run on the slice it touches (peaks 99–100%). Whatever the capsule *does not* catch flows on to the next layer.

### Layer 2 — Squeeze (catches the rest + cross-message, runs AFTER the capsules)

Squeeze runs **after** the capsules, on **what they did NOT compress** — content with no specialist-capsule match — and adds the cross-message layer: it **scans and maps the whole conversation**, evicts cold or superseded context, and leaves a **recoverable** re-fetchable reference at a quality that **keeps the work going and avoids rework**. **What a capsule already compressed does not re-pass through Squeeze** — no double work. This lifts **coverage to 80%+** and delivers **80.8% effective margin** on input at **99.1%** compression (audited over 400M tokens, quality 8.57/10, zero unrecoverable).

### Layer 3 — Economy (model swap — reaches the OUTPUT)

Capsule and Squeeze act only on **input**. Economy adds the third axis: it routes eligible work to a cheaper model, so it reaches the **output** too. On output it is **up to 179× cheaper** (Opus fast $50/Mtok ÷ DeepSeek $0.28/Mtok; 89× vs the standard tier) = **99.4% on output**; on input it cut **98.2%** in battery 3.

### The engine flow — in sequence

```
Agent input  →  [1] Capsule  →  (what's left)  →  [2] Squeeze  →  [3] Economy
tool output,    specialist by                     catches what     optional · routes
context,        type · compresses                 had no capsule   generation to
history         what is its type                  match · cross-   cheaper model ·
                (87–95%)                           message          reaches the output
                                                   (coverage 80%+)  (179×)
```

The capsule always runs first because it compresses what is its type best. What it does not compress falls to Squeeze — and what the capsule already compressed does not re-pass through Squeeze (no double work). Economy is orthogonal and optional, acting on generation.

| Layer | Reaches | Headline (audited) |
|---|---|---|
| **Capsule** | input (its type) | margin 87–95% (peaks 99–100%) |
| **Squeeze** | input (any) | **80.8% effective · 99.1% compression · coverage 80%+** |
| **Economy** | output + input | **up to 179× output (99.4%) · ~61× combined (98.4%)** |

Capsule + Squeeze stack on input; Economy stacks on top (compress the input *and* run it on the cheaper model).

> **Accounting rule (kept strict).** Input savings are counted **on input only**, output savings **on output only** — never summed into one figure (mixing distorts). The **one exception is Economy**, which genuinely affects both sides, so for it we report input-only, output-only **and** the combined multiple (~61×). Every table ships the input-only figure and, separately, the with-output figure.

---

## 3 — The coverage graph — what each layer reaches

An agent's bill has two sides: **input** (the context, re-read every turn — the bulk of the bill, ~91% driven by cache, so savings **compound** across the session) and **output** (the model's generations). Capsule and Squeeze reach the input; only Economy reaches the output. Each layer touches a different region of the bill — that is why they stack rather than compete.

**Coverage by layer** — what each layer reaches · where it compounds · effective on the bill

*INPUT side — re-read every turn, savings compound*

| Layer | Metric | Value |
|---|---|---|
| **Squeeze** | reaches | 80–90% |
| | compresses | 99.1% |
| | **effective** | **80.8%** |
| **Capsule** | reaches | ~46% |
| | compresses | 87–95% |

*INPUT + OUTPUT side — only Economy reaches the output*

| Layer | Metric | Value |
|---|---|---|
| **Economy** | reaches | 100% |
| | output ↓ | 99.4% |
| | per token | **up to 179×** |

**How to read.** *reaches* = coverage (intercepted ÷ total). *compresses / cheaper* = compression (saved ÷ intercepted). **effective** = effective margin (saved ÷ total), the saving that lands on the bill — measured directly, not estimated. For Squeeze, the ~80% effective is proven in real billing (campaign A 79.4%, campaign B 80.7%). Economy is the only mode that reaches the output (Opus fast $50/Mtok ÷ DeepSeek $0.28/Mtok = 178.6×).

---

## 4 — Measurement protocol

The protocol eliminates the three most common weaknesses in compression benchmarks: fixtures that favor the compressor, numbers that cannot be recomputed, and margin reported without any quality verification.

### 4.1 — Wild fixtures with digit-level mutation

Inputs are "wild giants": large real-world data (production logs, SQL schemas, real git diffs, technical PDFs, codebases) under digit-level mutation that preserves structure and vocabulary while preventing cache or memorization from inflating the result. Where synthetic input penalizes the parser (artificially high entropy), we declare this as a **conservative floor** — the codebase capsule measured 77.6% on synthetics and 95.2% on 40 real files; both are published.

> This is why the same capsule appears with different margins in different sections: codebase measures 95.2% in the 40-real-files study (F4) and 97.6% in the 200M run of Section 13.1 — distinct regimes and corpora, both audited, neither replacing the other. Not an inconsistency; it is the same capsule measured under different conditions, all declared.

### 4.2 — Two margin bases

Each capsule reports margin over accumulated volume and margin on a single pass (the more conservative number). In the current capsule run, the two bases converge within 0.2 percentage points — the convergence is itself a consistency result.

### 4.3 — Real LLM, real cost

The 6 LLM capsules are measured with real provider calls (deepseek-v3 in the current run), never simulated. Where processing the full volume would be unnecessary spend, the measurement is sampled and extrapolated — and this is declared, reported separately from the genuinely processed volume.

### 4.4 — Tokenizer declared as a proxy

All counting uses `cl100k_base`. The margin percentage is stable across tokenizers; the absolute dollar value is an approximation (±15%) because providers use their own tokenizers. This limitation is declared, not hidden.

### 4.5 — Raw record per sample

Each sample produces a `.jsonl` line with the input's SHA-256, input tokens, output tokens, and metadata. The full harness ships with every run. Any third party can recompute the aggregates.

### 4.6 — Passthrough counted, not hidden

When the output does not compress enough (`assertCompressed`) or would be a stub with no semantics (`assertNotEmpty`), the capsule is rejected and the data passes through raw — and the passthrough rate is reported per capsule. In the wild run through the production hook, rates of 30% to 61% are published. Passthrough is a **product guarantee**: the worst case is costing exactly zero extra.

### 4.7 — Real billing reconciled to the cent

The three real-billing batteries (B1, B2, B3) send the **same content twice** — raw and compressed — and compare what the provider actually charged. Reconciliation is threefold: account screenshots with before/after timestamps, a per-call trail with raw `usage` and the sample's SHA-256, and the official ledger via the Admin API (`/v1/organizations/usage_report/messages`, 1-minute buckets). The three sources agree. Details in Section 7.

### 4.8 — Squeeze quality protocol · binary gate with a strong judge

Compression is only useful if the agent can still **do the work**. For each item, a strong independent LLM judge sees the ORIGINAL and the COMPRESSED and answers a single gated question:

> Working ONLY from the compressed result, could a senior engineer CONTINUE the task? A re-fetch marker counts as available. **1** = cannot continue (state irrecoverably lost). **6–10** = can continue, graded by re-fetch friction (10 = everything present and lean, zero re-fetch; 9 = one trivial re-fetch; 8 = 1–2 re-fetches; 7 = 2–3; 6 = recoverable but heavy). **No 2–5** — anything below "usable" collapses to 1.

Three judges per sheet (46 items × 3 = **138 judgments**) smooth the 6-vs-9 friction variance. We use a **strong** judge by design: weaker judges (tested) collapse to ties via position and verbosity bias.

---

## 5 — Results — Squeeze, 400M tokens, two profiles

This is the headline run of this round. Two content profiles — **code** and **written** (markdown, logs, configuration) — sourced exclusively from **public GitHub OSS files** (included in `raws/fixtures/` of the public package), measured with the public `cl100k` tokenizer.

### 5.1 — Aggregates by profile

| Profile | Total tokens | Saved | Coverage | Compression | Effective | Quality |
|---|---|---|---|---|---|---|
| code | 200,018,026 | 165,368,804 | 83.2% | 99.4% | **82.7%** | 8.69 |
| written | 200,002,396 | 157,948,723 | 79.8% | 98.9% | **79.0%** | 8.42 |
| **overall** | **400,020,422** | **323,317,527** | **81.5%** | **99.1%** | **80.8%** | **8.57** |

**coverage** = intercepted / total · **compression** = saved / intercepted · **effective** = saved / total. **Quality**: a strong independent LLM judge scored, per item, whether a senior engineer can *continue the task* from the compressed result. **3 judges per sheet, 138 judgments, zero unrecoverable items.**

### 5.2 — Quality distribution

**Distribution of the 138 judgments by score** — 138 individual judgments (46 items × 3 judges) · scale 1 or 6–10

| Score | Count |
|---|---|
| 1 | 0 |
| 6 | 8 |
| 7 | 9 |
| 8 | 20 |
| 9 | 98 |
| 10 | 3 |

Sum: 8 + 9 + 20 + 98 + 3 = **138 judgments**. Mean = **8.57**. **Zero occurrences of score 1** — no analyzed item would need "start over". The scale is a binary gate (1 or 6–10): the gradation between 6 and 10 captures re-fetch friction, not viability.

---

## 6 — Capsules — recap and update

The 17 capsules remain active and measured across five audited runs (180,322,482 + 127,586,488 + 20,227,044 wild + 96,626,712 + 202,021,713 = **626,784,439** processed, 574,252,194 saved, 91.62% weighted margin). The per-capsule distribution of the most recent run (200M) is reproduced in Section 13. Here we record only the methodological evolution.

As of v0.5.36, every capsule that replaces whole content with a compact representation must pass a **mandatory task smoke test** before publishing — a rule formalized in `RELEASE-GATES`. The motivation is documented in Section 12 (the image-capsule episode).

### 6.1 — Two-tier strategy

For bulky data, the capsule delivers a **dense index (tier-1)** and keeps the raw body accessible via `retrieve` on demand (an MCP tool). The agent always receives the map and pulls exact content when the task demands full fidelity. This is what enables high margins without breaking operations that depend on exact bytes.

**Squeeze runs after the capsules** (Layer 2), on **what they did not compress** — content with no specialist-capsule match. The capsule runs first because it compresses what is its type best; what it already compressed **does not re-pass through Squeeze**, so there is no double work. Squeeze applies the same two-tier idea (index + retrieve) *across session messages*, scanning and mapping the **whole conversation** to evict cold or superseded context and leave a recoverable reference. Capsule and Squeeze do not compete: the capsule is a specialist by type (densifies what is its type, with the best margin); Squeeze catches the rest, recoverably. It is this chain — capsule first, Squeeze on what's left — that lifts coverage from ~46% to 80%+.

---

## 7 — Financial validation — the three real-billing batteries

A lab benchmark, however wild its input, is still a lab. Here we change the basis of measurement: **what leaves the account**. Three batteries run on a real account, with the same load sent twice (raw and compressed), checked against the provider's official ledger.

### 7.1 — Method

For each battery: record the account balance before each call, run the call, record the balance after. The balance drop is the real cost charged. The difference between the two sides (raw vs compressed) is the proven saving. **No estimate.**

**Triple reconciliation per battery:**

| Source | What it provides |
|---|---|
| Source 1 · Account screenshot | balance before − balance after |
| Source 2 · Per-call trail | raw usage + SHA-256 |
| Source 3 · Admin API ledger | usage_report 1m × Opus price |
| **Convergent result** | **three sources agree to the cent** |

### 7.2 — Squeeze · real-billing campaigns (input)

Campaigns A and B measure **Squeeze**, which acts exclusively on **input**. The same code conversation was sent twice to the provider: **raw** and **compressed by Squeeze**. These are **input studies**, so the effective margin is measured on input, and the dollar saving proves it directly. They are small campaigns by design (~110K tokens each): a **precise money proof on a small grain**, not a volume claim — the volume comes from the 400M + 626M corpora.

| Campaign | Effective (input = saved/total) | Input billed: raw → NUXS | $ saved (input) | With output (secondary) |
|---|---|---|---|---|
| **A** (production) | **79.4%** | $0.450 → $0.093 | $0.357 | 75.6% ($0.473 → $0.115) |
| **B** (aggressive) | **80.7%** | $0.4501 → $0.0870 | $0.363 | 76.8% ($0.4726 → $0.1095) |

**effective** = saved ÷ total. The effective margin is measured on **input** (where Squeeze acts), and the dollar saved proves it directly ($ saved ÷ $ total raw). Output is accounted **separately** and **never folded into the input figure** — mixing the two would distort the input economy. The "with output" column is secondary, for the record only.

The total study spend ($0.588 / $0.582) reconciles to the provider's own ledger — it is the **audit anchor, not the economy**. The economy is the **$ saved on input** above, which equals the effective margin to the cent.

**coverage** = intercepted / total · **compression** = saved / intercepted · **effective** = saved / total. The effective column is the real input saving that shows up on the bill. The cost drop (from $0.45 raw to ~$0.09 compressed) is the input saving measured directly, **with no output component in the figure** — because Squeeze does not change the output.

The Squeeze saving is accounted **on input** (where it acts); output enters only the total closure against the ledger, identical on both sides. Mixing output into the input-saving figure would distort the metric — which is why the effective margin (79.4% and 80.7%) is reported over input.

**Full input + output reconciliation (official ledger).** For accounting closure against Anthropic's ledger (Admin API), the full table for each call includes the output (1,800 tokens on each side, identical on both — they do not affect the input economy):

| Battery | Window (UTC) | Input tok | Output tok | Total cost (Opus) | Balance drop |
|---|---|---|---|---|---|
| **B1** | 21:37–38 | 108,539 | 1,800 | $0.588 | 32.67 → 32.08 ✓ |
| **B2** | 00:43 | 107,414 | 1,800 | $0.582 | 32.08 → 31.50 ✓ |

### 7.3 — Economy · one output battery

Battery 3: the **same task** run on **Opus 4.8** (expensive provider) and on **DeepSeek-v3** (cheap provider). The Economy gain is measured on the **output** — where the model swap bites:

| Side | Output tokens | Price/Mtok | Output cost |
|---|---|---|---|
| Opus fast (expensive) | 4,500 | $50 | $0.2250 |
| DeepSeek (cheap) | 4,500 | $0.28 | **$0.00126** |

> $0.2250 ÷ $0.00126 = 178.6× ≈ 179× · 99.44% saving on output

The ratio is measured on output because that is where the model swap bites: the output count is the same on both sides (same task, same answer), so the ratio becomes pure per-token price — Opus fast $50/Mtok ÷ DeepSeek $0.28/Mtok = 178.6× (89× against the expensive provider's *standard* tier). Dividing the total input+output task cost would understate the gain, because the task was input-heavy — a methodological trap we flag. **The locked number is 179× on output.**

Economy is the **only layer that affects both sides**, so we report all three numbers: **output-only 179×** (99.4%), **input cut 98.2%** in the same B3, and **combined ~61×** (98.4% on the total task cost). All three are reported separately, never fused into one misleading number.

### 7.4 — Reconciliation with the official ledger

| Battery | Input | Output | Opus price | Matches balance |
|---|---|---|---|---|
| **B1** | 108,539 | 1,800 | $0.588 | −$0.59 ✓ |
| **B2** | 107,414 | 1,800 | $0.582 | −$0.58 ✓ |
| **B3 · Opus side** | 90,155 | 4,500 | $0.563 | −$0.56 ✓ |

> Three independent sources — **account balance · per-call trail · Admin API** — converge on the same number, to the cent. **This is the hardest test in the study:** not a hash, not a tokenizer, but what the provider actually charged.

---

## 8 — Production validation — the wild run

To complement the batteries above, an entire run (20.2M tokens, recorded in the capsule benchmark) was executed by the real production hook — the same binary that runs on the user's machine, with guards active, router active, and passthrough counted.

Result: **91.97% aggregate margin** (text profile 80.6–89.4%; code profile 93.7–94.4%), with per-capsule passthrough published (log 61%, api 42%, schema 56%, among others). The gap from the fixtures benchmark (~95%) is expected and informative: in production the router rejects what is not worth compressing — conservative behavior that is measured, not hidden.

This run also exposed and fixed a real defect: the PDF capsule was silently failing in production due to an API change in `pdf-parse 2.x` (the data fell through to raw, with no visible error). Caught by the protocol's skip log, fixed in v0.5.33, validated at 86.3–96% on real PDFs. We record this episode because it shows the protocol working as an engineering instrument, not just a marketing one.

---

## 9 — Coverage is the lever — the evolution

High compression was never the hard part: NUXS compresses what it touches by ~95%+. The leap was **coverage** — making the system *touch* much more of the real traffic.

| Mechanism | Margin | Coverage | Effective |
|---|---|---|---|
| Capsules (mechanism 1) · ~46% of code traffic | 95% | ~46% | ~40% |
| Squeeze (mechanism 2) · after the capsule · 400M run | 99.1% | 81.5% | **80.8%** |

The compression ratio stayed at 95-99% in both mechanisms — a marginal increment. The real leap came from **coverage**: the capsule (which runs first, specialist by type) touched ~46% of the code traffic, and the rest passed through; **what the capsule did not compress now falls to Squeeze**, which scans the whole conversation across messages and captures that no-capsule-match traffic, lifting coverage to **81.5%**. With more traffic touched, the Squeeze effective margin (saved ÷ total) reaches **80.8%** — proven in real billing (campaign A 79.4%, campaign B 80.7%) — **at no quality cost** (8.57/10, zero unrecoverable). The corpus of real Claude Code sessions grew from 90 to 100 sessions over the program.

### Evolution table by run

| Run | Date | Tokens | Margin |
|---|---|---|---|
| Capsules official (v0.1.57) | Jun 06 | 180,322,482 | 87.45% |
| F4 (usage-weighted) | Jun 10 | 127,586,488 | 88.44% |
| Wild via production hook | Jun 10 | 20,227,044 | 91.97% |
| 100M · v0.5.32 | Jun 10 | 96,626,712 | 95.56% |
| 200M · v0.5.33 (pre-launch) | Jun 10 | 202,021,713 | 95.42% |
| **Squeeze 400M (v0.5.73)** | **Jun 20** | **400,020,422** | 99.1% margin · 81.5% cov · 80.8% effective |

---

## 10 — Quality — the Arena and the guards

Compression margin, on its own, is a dangerous number — you can "compress" 99% by destroying the agent's ability to do the task. NUXS treats quality as a three-layer gate.

### 10.1 — Deterministic runtime guards

`assertCompressed` rejects any capsule that does not reach its type's compression floor; `assertNotEmpty` rejects stubs (large input → tiny output with no semantics, the pattern that masks a broken parser behind a false high number); each rejection is logged locally and reported via beacon to the admin panel.

### 10.2 — The Arena

Real Claude agents perform real tasks on the capsules and judges score quality 0–10. Arena results have already changed the product: the two-tier schema graph was validated with a margin gain of +19 to +27 percentage points while holding quality at 8.5/10. **Margin that does not pass the Arena is not promoted to product.**

### 10.3 — The Arena as a release gate

As of v0.5.36, every capsule that replaces whole content with a compact representation must pass a mandatory task smoke test before publishing. The motivation is documented in Section 12.

### 10.4 — Binary gate for Squeeze

The Squeeze judge answers only 1 or 6–10. There is no 2–5. The reason: anything below "usable" must be treated as a total failure — there is no useful gradation between "lost irrecoverable information" and "recoverable information with friction". Score 1 is a product defect; 6–10 is operational friction.

---

## 11 — Compression is not savings — the three quantities we report

Most published measurements report a single number — the compression ratio over what was compressed. That number, in isolation, **overstates the real economy**, because no honest system compresses 100% of the traffic: part of the data passes raw by design (content the agent needs intact, small files where the overhead exceeds the gain).

We report three distinct quantities, with fixed definitions:

- **Coverage** = intercepted ÷ total. How much of the traffic the mechanism actually touches.
- **Compression (margin)** = saved ÷ intercepted. How hard it compresses what it touched. This is the usual marketing number: 99.1% in Squeeze, 95.42% in the capsule run.
- **Effective margin** = saved ÷ total. **This is the real economy that shows up on the bill.**

The effective margin is a **direct measurement**: saved divided by the total tokens that passed. It is not a product we estimate — the saved tokens already carry, by construction, the relationship with what was intercepted (you can only save from what was intercepted). So dividing saved by total already delivers the effective economy without multiplying anything. It is this number — 80.8% in the Squeeze run, proven in real billing (campaign A 79.4%, campaign B 80.7%) — that reports what the customer saves.

The effect is amplified by the mechanics of modern agents: since the session context is re-sent every turn, each token compressed out of context saves on **every subsequent turn** — context compression **compounds across the session**, rather than paying once. We publish compression because it is a property of the engine; we publish effective margin because it is the truth of the bill. As of this date, we are not aware of another public measurement in the space that separates the three quantities.

---

## 12 — Limitations and intent

We report our limitations openly — none harmful to the engineering, all in the spirit of honest work:

- **Coverage is corpus-dependent.** The ~46% vs 80%+ figures sit on different measurement bases (mixed real-session replay vs selected corpora) — reported separately, never blended.
- **Capsule is weak on undifferentiated content.** On a real coding session dominated by raw code/bash, the per-item capsule alone saves little; the cross-message **Squeeze** and **Economy** carry the economy there. Each layer covers what the previous one does not.
- **Effective margin tracks content density.** Code/file-heavy context compresses to ~80%; chat-heavy sessions less. We never average across profiles to form a single misleading number.
- **Real-billing campaigns are small by design** (~110K tokens each): a **precise money proof on a small grain**, not a volume claim. The volume is given by the 400M + 626M corpora.
- **Estimation caveat.** Headline figures use the public `cl100k` tokenizer and real provider usage; where a tokenizer is unavailable, bytes/4 is an explicit estimate, flagged as such.
- **image (99.4%) — retroactive caveat.** The number is a bytes→tokens estimate and measured an interception that, in early readings, replaced the image with a metadata pointer — blinding the agent to the visual content. Bug present from v0.5.7 to v0.5.35, fixed in v0.5.36. **This episode is the origin of the Arena-gate rule in Section 10.3.**
- **Economy ≠ Opus in quality.** Routing to a cheap model is appropriate for mechanical/batch work. Economy does not replace Opus on fine tasks — it is a conscious choice, with the gate on. The 179× output gain is real and audited, but applies to the routable slice.

> **Intent.** The goal is not only to economize *with quality*. The specialist capsules produce **dense, clean, structure-preserving representations** — which also **sharpen the model's own reasoning, agility, and intelligence**, feeding it *better* data, not merely *less* data. Cutting cost and sharpening the model are, here, the same lever.

---

## 13 — Cumulative total and per-capsule distribution

The study headline — **1,026,804,861 audited tokens** — is the sum of two independent tracks: **626,784,439** from earlier capsule runs (five rounds, June 2–11) + **400,020,422** from the Squeeze run. These are the official cumulative numbers, published at [nuxs.ai/benchmark](https://nuxs.ai/benchmark).

| Track | Processed | Saved | Metric |
|---|---|---|---|
| **Capsules** (5 cumulative runs) | 626,784,439 | 574,252,194 | 91.62% margin |
| **Squeeze** (400M run) | 400,020,422 | 323,317,527 | 80.8% effective |
| **TOTAL AUDITED** | **1,026,804,861** | **897,569,721** | — |

**Why there is no single "total margin".** The two tracks use different denominators: the capsule reports **margin** (saved ÷ *intercepted* = 91.62%); Squeeze reports **effective margin** (saved ÷ *total* = 80.8%). Mixing the two into a single percentage would compare incompatible bases — exactly what this study avoids. The two numbers are reported side by side, never fused.

### 13.1 — Per-capsule distribution (200M run · v0.5.33, TEXT profile)

The per-capsule distribution below is from the 200M run (the most recent capsule round), published on the site. The per-capsule margins hold in the CODE profile, which inverts the traffic weights (codebase, diff and stack become dominant).

| Capsule | Class | Processed | Margin | Samples |
|---|---|---|---|---|
| rag | LLM | 20,010,072 | 90.4% | 1,704 |
| log | algo | 16,063,645 | 98.8% | 95 |
| pdf | LLM | 12,023,183 | 96.0% | 401 |
| threads | LLM | 10,001,241 | 91.6% | 601 |
| events | LLM | 9,070,336 | 99.5% | 88 |
| prompt | algo | 8,012,934 | 99.8% | 398 |
| api | algo | 7,195,617 | 100% | 9 |
| sql | LLM | 5,010,920 | 99.2% | 34 |
| network | algo | 3,563,305 | 100% | 5 |
| stack | LLM | 2,004,372 | 90.5% | 277 |
| schema | algo | 2,000,200 | 77.0% | 292 |
| diff | algo | 1,537,461 | 94.5% | 37 |
| codebase | algo | 1,513,733 | 97.6% | 53 |
| build | algo | 1,013,132 | 96.0% | 68 |
| test | algo | 1,013,040 | 97.3% | 56 |
| apispec | algo | 708,552 | 86.7% | 78 |
| image† | algo | 304,934 | 99.4%† | 46 |

† The `image` line (99.4%) is a bytes→tokens estimate with a retroactive caveat: it measured an interception that, in early readings, blinded the agent to the visual content (bug v0.5.7–v0.5.35, fixed in v0.5.36). Kept here only for completeness of the published table; see Section 12. The 3 multimodal capabilities (image-LLM, meeting, video) are measured in a separate 1M-token phase and are not part of this text/code total.

---

## 14 — Reproducibility

Every run publishes:

- `README.md` — public summary with tables and chart
- `ARTICLE.md` — the academic version of the study (available in English and Portuguese)
- `HOW-TO-VERIFY.md` — full recipe to re-audit
- `raws/squeeze-400M-audit-trail.jsonl` — one line per item, 46 items, with sha256 + in_tok + out_tok + 3 scores
- `raws/squeeze-400M-summary.json` — per-profile + overall aggregate
- `raws/fixtures/` — the 46 GitHub OSS files used as input
- `raws/judge-sheets/` — 10 sheets with ORIGINAL vs COMPRESSED evaluated by the judges

> **How to re-verify.** Take any file in `raws/fixtures/`, SHA-256 the first 6000 characters → matches `sha256` in the trail. Tokenize the same slice with cl100k → matches `in_tok`. Tokenize the `[COMPRESSED — Squeeze]` block of the corresponding judge sheet → matches `out_tok`. Re-run the quality judge with the rubric in Section 4.8 → reproduces the score.

Nothing depends on our infrastructure, our billing, or any private code — only on public files and public tools.

---

*Benchmark published June 20, 2026 · Tokens audited: 1,026,804,861 · Capsules 91.62% margin · Squeeze 80.8% effective · Squeeze quality: 8.57/10, 0 unrecoverable · Real-session corpus: 100 Claude Code sessions · All raws included · Financial reconciliation with the official ledger via the Admin API.*

[Raw files on GitHub](https://github.com/josueramosleites-collab/nuxs) · [nuxs.ai](https://nuxs.ai/)
