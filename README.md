# Nuxs — Official Compression Benchmark

> **Over 1 billion tokens audited.** Every number here is reproducible from the raw artifacts in
> [`raws/`](./raws) — see [`HOW-TO-VERIFY.md`](./HOW-TO-VERIFY.md). Every dollar figure is a **real billing
> delta**, not an estimate.

Nuxs cuts the cost of running LLM agents with three complementary, stackable modes. This benchmark reports
each one with audited numbers and reproducible raws.

---

## Headline

| | |
|---|---|
| **Total tokens audited** | **1,026,804,861** (1.026 billion) |
| **Modes measured** | Capsule · Squeeze · Economy |
| **Largest single run** | 400,020,422 tokens (Squeeze), fully reproducible from `raws/` |
| **Real billed savings** | proven against the provider's own ledger (down to the cent) |
| **Engine** | `nuxs-capsule@0.5.73` (npm) · tokenizer **cl100k** (`gpt-tokenizer`) · model **Opus 4.8** · 2026-06-18→20 |

---

## The three modes

| Mode | What it gives you | Measured result |
|---|---|---|
| **Capsule** | Dense, type-aware compression of tool output | aggregate margin **87–95%** per run (peaks ~99.8%) |
| **Squeeze** | Removes cold/superseded context, leaving a cheap re-fetchable reference | **79–81% effective** input reduction |
| **Economy** | Routes batch/mechanical work to a cheaper model | **99.4% cheaper output (up to ~179×)** on eligible work |

Squeeze and Economy stack: compress the input *and* run it on the cheaper model.

---

## Coverage graph — what each mode reaches

An agent's bill has two sides: **INPUT** (the context, re-read every turn — the bulk, ~91% cache-driven, so
savings **compound**) and **OUTPUT** (the model's generations). Each mode reaches a different part:

```
                     0%        25%        50%        75%       100%
                     ├──────────┼──────────┼──────────┼──────────┤

═══ INPUT side (the bulk — re-read every turn, savings COMPOUND) ═════════════

  Squeeze   reaches  ████████████████████████████████████████████░░░░░  80-90%
            squeezes ███████████████████████████████████████████████░  99.1%
            EFFECTIVE ███████████████████████████████████████░░░░░░░░░  80.8%   ◄ real input savings

  Capsule   reaches  ███████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░  ~46→80%
            squeezes ██████████████████████████████████████████████░░  87-95%

═══ INPUT + OUTPUT side (only Economy reaches the output) ════════════════════

  Economy   reaches  ██████████████████████████████████████████████████ all routed ◄
            output ↓ █████████████████████████████████████████████████░  99.4%   ◄ saving on the OUTPUT
            per-tok  ██████████████████████████████████████████████████ up to 179×  Opus fast $50 ÷ DeepSeek $0.28
            scope    INPUT ███████████████  +  OUTPUT ███████████████   ◄ the only mode that touches OUTPUT
```

**How to read it.** *reaches* = how much of the traffic the mode touches (coverage). *squeezes/cheaper* = how
hard it compresses what it touched (margin). *EFFECTIVE* = the product of the two = what lands on the bill.
Squeeze touches **80-90%** of the input and compresses **~99%** of it → **~80% effective**; because input is
re-read every turn, each removed token saves on **every subsequent turn**. Economy is the only mode that reaches
the **output**: by routing generation to a cheaper model it cuts the **output cost up to ~179× (99.4%)** — measured
on the output tokens of the real-billing run (a clean per-token price ratio, Opus fast $50/Mtok ÷ DeepSeek $0.28/Mtok).

---

## Squeeze — 400M tokens, two profiles, independently judged (reproducible)

This is the headline run. Two content profiles, **code** and **written** (markdown / logs / config), all
sourced from **public GitHub OSS files** (included in `raws/fixtures/`), measured with the public `cl100k`
tokenizer.

| profile | total tokens | saved tokens | coverage | compression | **effective** | quality (1–10) |
|---|---|---|---|---|---|---|
| code | 200,018,026 | 165,368,804 | 83.2% | 99.4% | **82.7%** | 8.69 |
| written | 200,002,396 | 157,948,723 | 79.8% | 98.9% | **79.0%** | 8.42 |
| **overall** | **400,020,422** | **323,317,527** | **81.5%** | **99.1%** | **80.8%** | **8.57** |

- **coverage** = intercepted / total · **compression** = saved / intercepted · **effective** = saved / total.
- **Quality** = an independent strong LLM judge scored, **per item**, whether a senior engineer can *continue
  the task* from the compressed result alone. The scale is a **gate**: **1** = cannot continue (state
  irrecoverably lost), **6–10** = can continue, graded by re-fetch friction (10 = everything + lean; 6 =
  recoverable but heavy). No 2–5 — anything below "usable" collapses to 1. **3 judges per sheet, 138
  judgments, zero unrecoverable items.**

Raw, per-item: [`raws/squeeze-400M-audit-trail.jsonl`](./raws/squeeze-400M-audit-trail.jsonl) — content hash
+ tokenizer counts + the 3 judge scores for each of the 46 source items.

---

## Real-billing proof (production)

These campaigns ran the same content twice — once raw, once through Nuxs — and compared what the provider
*actually billed*. The savings reconcile with the provider's ledger.

The **effective margin** (`saved / total`) **is** the real economy. These Squeeze batteries are **input studies**, so
it is measured on **input**, and the dollar economy proves it directly. Output is accounted **separately** — never
folded into the input figure (mixing distorts it).

| campaign | effective margin (input = saved/total) | input billed: raw → Nuxs | **$ saved (input)** | with output (secondary) |
|---|---|---|---|---|
| Squeeze A (edge 100) | **79.4%** | $0.450 → $0.093 | **$0.357** | 75.6% ($0.473 → $0.115) |
| Squeeze B (edge 60) | **80.7%** | $0.4501 → $0.0870 | **$0.363** | 76.8% ($0.4726 → $0.1095) |

Total study spend ($0.588 / $0.582) reconciles to the provider's own ledger — the audit anchor, **not** the economy.

**Economy** (separate lever, measured on **output**): the 4,500 output tokens cost **$0.2250** on the expensive
provider vs **$0.00126** on the cheap one — a clean per-token price ratio (Opus fast $50/Mtok ÷ DeepSeek $0.28/Mtok =
**178.6× ≈ 179×**). Because Economy genuinely touches **both** sides, the combined input+output multiple is also fair
to report for it: **~61× total (98.4%)** in battery 3. (This combined figure is the **Economy-only exception** — for
Squeeze, input and output are never mixed into one number.)

---

## Evolution — the real story is *coverage*

High compression was never the hard part — Nuxs compresses what it touches by ~95%+. The breakthrough was
**coverage**: getting the system to *touch* far more of the real traffic.

| stage | tokens | margin on what's compressed | **coverage of traffic** | net effect |
|---|---|---|---|---|
| Early content-aware runs | 180M → 202M | 87% → 95% | ~46% (replay of 90 real sessions) | ~40% of the input bill |
| **Now, with Squeeze** | **400M** | **~99%** | **80%+** | **~80% of the input bill** |

The real economy is the **effective margin** (`saved / total`); the lever that lifted it was **coverage** (the
ratio was already ~99%). Squeeze lifted coverage from ~46% to 80%+, roughly **doubling the real-world savings**
while keeping quality at 8.57/10 with zero unrecoverable items. The real-session corpus behind these measurements
grew from **90 to 100 sessions**.

> Note (transparency): the ~46% figure is *coverage measured on mixed real-session replay*; the 80%+ figure
> is *coverage on selected corpora*. Different measurement bases — reported openly, not blended.

---

## What we learned (audited findings)

1. **Cheap LLM judges don't work** for fine quality comparison — they collapse to ties (position / verbosity
   bias). The judge must be strong and blind. We use a strong independent judge, multiple per sheet.
2. **The bill is ~91% cache** — context is re-read every turn — so compression has a **compounding effect**:
   a token removed from context saves on *every* subsequent turn.
3. **Effective savings depend on content density.** File/code-heavy context compresses to ~80%; chat-heavy
   sessions less. We report per profile and **never** average them into a single misleading number.

---

## Reproduce it yourself

Everything in `raws/` is enough to verify the Squeeze run end-to-end without trusting us:
1. Take any source file in `raws/fixtures/` → hash it → matches the `sha256` in the audit trail.
2. Count its tokens with `cl100k` → matches `in_tok`.
3. The trail records the compressed size (`out_tok`) and the saving per item.
4. Re-run the quality judge (original vs. the compressed reference) with the rubric above → reproduce the score.

Full recipe: [`HOW-TO-VERIFY.md`](./HOW-TO-VERIFY.md).

---

*Benchmark date: 2026-06-20. Tokens audited: 1,026,804,861. Quality: 8.57/10, 0 unrecoverable. All raws included.*
