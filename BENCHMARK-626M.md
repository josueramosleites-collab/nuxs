# NUXS Capsule — Consolidated Context-Compression Study
## 626.8 million audited tokens · Protocol, results, and methodological comparison

_June 2026 · nuxs-capsule v0.5.33–0.5.36 · cl100k_base tokenizer (declared as proxy) · LLM capsules measured via real provider calls · per-sample raw records with sha256 · zero errors across 9,333 samples in the current run_

---

## Executive summary

This document consolidates every audited benchmark run of NUXS Capsule conducted between June 2 and June 11, 2026, totaling **626,784,439 tokens processed** and **574,252,194 tokens saved** — a **weighted margin of 91.62%** over the cumulative volume. The current run (200M tokens, v0.5.33) records a **95.42%** aggregate margin with zero errors across 9,333 samples.

Three commitments distinguish this study from the prevailing practice in context-compression measurement:

1. **Full auditability.** Every run publishes its harness, execution log, and per-sample raw records (one line per sample, with the sha256 of the input). Every number in this document is recomputable from the artifacts.
2. **Quality as a gate, not a footnote.** Compression margin only becomes product after passing the Arena — real agents performing real tasks on the capsules, with judges scoring quality. As of v0.5.36, this gate is a formal release rule.
3. **Two honest numbers where the industry usually publishes one.** We report margin on two bases (volume and single-pass), and we explicitly distinguish **margin** (compression over what is intercepted) from **effective savings** (margin × coverage of real traffic) — a distinction most published measurements do not make.

---

## 1. Scope and thesis

NUXS Capsule is a context-compression layer for AI agents (Claude Code, Cursor, Cline, MCP tools). The product's technical thesis is that **context compression is mapping, not encoding**: each data type has its own structure, and a specialized parser that understands that structure preserves the load-bearing signal and discards the noise — in contrast to generic perplexity-based compressors, which prune token by token without a model of the data.

The system measured in this study comprises **17 text/code capsules** (11 algorithmic — deterministic, zero marginal cost, executed locally; 6 LLM-based — measured via real provider calls) and **3 multimodal capabilities** (image-LLM, meeting, video), coordinated by a content-sniffing router with confidence scoring and LLM pre-classification in the gray zone.

---

## 2. Measurement protocol

The protocol was designed to eliminate the three most common weaknesses in compression benchmarks: fixtures that favor the compressor, numbers that cannot be recomputed, and margin reported without any quality verification.

**2.1 — Wild fixtures with digit-level mutation.** Inputs are "wild giants": large real-world data (production logs, SQL schemas, real git diffs, technical PDFs, codebases) subjected to digit-level mutation that preserves structure and vocabulary while preventing any cache or memorization from inflating the result. Where synthetic input penalizes the parser (artificially high entropy), this is declared as a **conservative floor** — the F4 study measured the codebase capsule at 77.6% on synthetic fixtures and 95.2% on 40 real files, and both measurements are published.

**2.2 — Two margin bases.** Each capsule reports `margin_volume` (over the run's accumulated volume) and `margin_singlepass` (a single pass — the more conservative number). In the current run, the two bases converge within 0.2 percentage points — the convergence is itself a consistency result.

**2.3 — Real LLM, real cost.** The 6 LLM capsules are measured via real provider calls (deepseek-v3 in the current run), never simulated. Where processing the full volume would be unnecessary provider spend, the measurement is sampled and extrapolated — and **declared as such** in the basis column ("server-sampled→extrapolated"), reported separately from the genuinely processed volume.

**2.4 — Tokenizer declared as proxy.** All counting uses cl100k_base. Percentage margin is stable across tokenizers; the absolute dollar value is an approximation (±15%), because providers use their own tokenizers. This limitation is declared, not hidden.

**2.5 — Raw record per sample.** Every sample produces a `.jsonl` line with the input's sha256, input tokens, output tokens, and execution metadata. The full harness ships with every run. Any third party can recompute the aggregates.

**2.6 — Passthrough counted, not hidden.** When the output does not compress enough (per-capsule `assertCompressed` guards, with stricter floors for dense types) or would be a stub with no semantics (`assertNotEmpty`), the capsule is rejected and the data passes through raw — and the passthrough rate is reported per capsule. In the wild run through the production hook, per-capsule passthrough rates of 30% to 61% are published in the summary. Passthrough is a product guarantee: the system's worst case is costing exactly zero extra.

---

## 3. Evolution across audited runs

| Run | Date | Tokens processed | Tokens saved | Margin |
|---|---|---:|---:|:---:|
| Official published benchmark | Jun 05 | 180,322,482 | 157,693,455 | 87.45% |
| F4 battery (usage-weighted) | Jun 10 | 127,586,488 | 112,838,201 | 88.44% |
| Wild via production hook | Jun 10 | 20,227,044 | 18,601,994 | 91.97% |
| 100M · v0.5.32 | Jun 10 | 96,626,712 | 92,341,108 | 95.56% |
| **200M · v0.5.33 (current)** | Jun 10 | **202,021,713** | **192,777,436** | **95.42%** |
| **CUMULATIVE AUDITED TOTAL** | — | **626,784,439** | **574,252,194** | **91.62%** |

The evolution 87.45% → 88.44% → 91.97% → 95.56% → 95.42% reflects both genuine product gains (parser fixes, template collapsing, the two-tier schema graph) and fixture/method differences across runs — and we declare this: the series is **not** a pure like-for-like delta. What the series *does* prove is consistency: the 100M (v0.5.32) and 200M (v0.5.33) runs, with identical methods, land at the same margin (~95.5%), confirming no regression between consecutive versions.

Important methodological note: the 626.8M are **cumulative across runs**, not a single distinct corpus. Separate runs reuse fixture families under independent mutations.

---

## 4. Current-run results (200M · v0.5.33)

### 4.1 Aggregates by profile

| Profile | Tokens processed | Tokens saved | Margin |
|---|---:|---:|:---:|
| TEXT (RAG/log-dominant) | 101,046,677 | 96,574,112 | **95.57%** |
| CODE (coding agent) | 100,975,036 | 96,203,324 | **95.27%** |
| **TOTAL** | **202,021,713** | **192,777,436** | **95.42%** |

The two profiles use distinct per-capsule traffic weights, modeling the typical consumption of a knowledge/RAG agent versus a coding agent. Zero errors across 9,333 samples.

### 4.2 Per capsule (TEXT profile)

| Capsule | Class | Tokens processed | Margin | Samples |
|---|---|---:|:---:|---:|
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
| codebase | algo | 1,513,733 | 97.6% | 53 |
| diff | algo | 1,537,461 | 94.5% | 37 |
| test | algo | 1,013,040 | 97.3% | 56 |
| build | algo | 1,013,132 | 96.0% | 68 |
| apispec | algo | 708,552 | 86.7% | 78 |
| image | algo | 304,934 | 99.4%* | 46 |

The CODE profile inverts the weights (codebase 17.5M, diff 14M, stack 10M dominant) and holds the same per-capsule margins — the full table ships with the artifacts. (*) The image line carries a retroactive methodological caveat; see §8.

### 4.3 Multimodal (separate 1M phase, real providers)

| Capability | Measurement | Result |
|---|---|---|
| image-llm (describe) | 1,600 → 91 tokens | 94.3% |
| image-llm (OCR) | 1,600 → 18 tokens | 98.9% |
| meeting | 36s audio → transcript + executive summary | compresses on long meetings |
| video | 4,803 → 513 tokens | 89.3% |

---

## 5. Production validation: the wild run

A laboratory benchmark, however wild its fixtures, is still a laboratory. For that reason an entire run (20.2M tokens) was executed **through the real production hook** (`dist/intercept.js`) — the same binary that runs on the user's machine, with guards active, router active, and passthrough counted.

Result: **91.97% aggregate margin** (weighted text profile 80.6–89.4%; code profile 93.7–94.4%), with per-capsule passthrough rates published (e.g., log 61%, api 42%, schema 56%). The gap to the ~95% of the fixture benchmark is expected and informative: in production, the router rejects what is not worth compressing — and that conservative behavior is measured, not masked.

This run also exposed and fixed a real defect: the PDF capsule was failing silently in production due to an API change in the `pdf-parse` 2.x dependency (the data fell through to raw, with no visible error). The defect was caught by the protocol's own skip log, fixed in v0.5.33, and validated at 86.3–96% on real PDFs. We record this episode because it demonstrates the protocol working as an engineering instrument, not just a marketing one.

---

## 6. Quality: the Arena and the guards

Compression margin, on its own, is a dangerous number — it is possible to "compress" 99% while destroying the agent's ability to perform the task. NUXS treats quality as a gate at three layers:

**Deterministic runtime guards.** `assertCompressed` rejects any capsule that misses its type's compression floor; `assertNotEmpty` rejects stubs (large input → tiny output with no semantics — the pattern that masks a broken parser behind a fake-high number); every rejection is logged locally and reported via beacon to the admin panel.

**The Arena.** Real Claude agents perform real tasks on the capsules (navigating a codebase, answering questions about a schema, diagnosing a stack trace) and judges score quality from 0 to 10. Arena results have already changed the product: the two-tier schema graph was validated with a margin gain of +19 to +27 percentage points *while holding* a quality score of 8.5/10; the codebase and prompt capsules were corrected after Arena failures. Margin that does not pass the Arena is not promoted to product.

**Arena as a release gate.** As of v0.5.36, every capsule that replaces whole content with a compact representation must pass a mandatory task smoke test before publishing — the rule formalized in `RELEASE-GATES.md`. The motivation is documented in §8.

**Two-tier strategy.** For bulky data, the capsule delivers a dense index (tier-1) and keeps the raw body accessible via on-demand retrieve (an MCP tool). The agent always receives the map, and pulls the exact content when the task requires full fidelity (e.g., code editing). This design is what enables high margins **without** breaking operations that depend on exact bytes.

---

## 7. Margin is not savings: the two metrics we report

Most published measurements in this space report a single number — the compression ratio over what was compressed. That number, in isolation, overstates real savings, because no honest system compresses 100% of traffic: part of the data **must** pass through raw by design (content the agent needs intact, small files where overhead exceeds the gain).

This study therefore formalizes two metrics:

- **Margin** — compression over intercepted traffic. This is what the tables above measure: 95.42% in the current run.
- **Coverage** — the fraction of total traffic that is intercepted. It is measured by production telemetry (instrumentation embedded as of v0.5.36), per client and per usage profile, and reported in the product dashboard — including the distinction between "traffic uncompressed by design" and "compression opportunity."

A client's **effective savings** is the product of the two, and the effect is amplified by the mechanics of modern agents: because the session context is retransmitted on every turn, **every token compressed out of the context saves on every subsequent turn of the session** — context compression compounds over the session rather than paying out once. We publish margin because it is the property of the compression engine; we publish per-client coverage because it is the truth of the bill. As of this study's date, we are not aware of another public measurement in this space that reports the two separately.

---

## 8. Declared limitations and corrections

A benchmark's credibility is measured by what it declares against its own interest. For the record:

- **prompt (99.8%)**: the giant fixture (a history of near-identical prompts) corresponds exactly to the capsule's design purpose (deduplicating agent telemetry). On a single unique system prompt, the mode is different — structural compression at ~75.7% with every guard clause preserved. Both numbers are published.
- **api (99–100%)**: legitimate — the capsule keeps the schema plus one sample; verified at 99.4% over 200 varied objects.
- **image (99.4%) — retroactive caveat (Jun 11)**: the number is a bytes→tokens estimate, and it measured an interception that, on first read, replaced the image with a metadata pointer — blinding the agent to the visual content (a quality regression present from v0.5.7 through v0.5.35, fixed in v0.5.36: first read now passes to model vision; only unchanged re-reads within the same context epoch serve the pointer). Going forward, image savings are measured as **vision tokens saved on re-reads**, never bytes/4. The slice is small (0.3–0.8% of the corpus) and does not affect the aggregate — but the line stays annotated for full auditability: a high compression number meant nothing while the underlying interception broke the task. This episode is the origin of the Arena-gate rule in §6.
- **Synthetic fixtures as a floor**: structural capsules (codebase/diff/schema) plateau on high-entropy synthetic input; on real data they rise 10–20pp. Both regimes are published.
- **Declared extrapolation**: in the F4 battery, LLM-capsule volume is sampled and extrapolated (real provider cost: $0.12 for the run); the genuinely processed volume (127.6M, 88.44%) is reported separately from the extrapolation-inclusive aggregate (201.6M, 91.75%).
- **Improvements rejected on fidelity grounds**: experimental variants with margin gains of up to +42% were **rejected** when they implied signal loss (e.g., a diff-hunk pool that discarded line offsets; truncation of failing-test lists). The experiments and verdicts are published in `benchmark-improvements.json`. Margin never buys fidelity.

---

## 9. Methodological comparison with industry practice

We do not compare margins directly against third-party numbers, because different methods produce incommensurable numbers — and that is precisely the point. We compare **protocols**:

| Dimension | Prevailing practice | This study |
|---|---|---|
| Corpus | Synthetic or fixed academic datasets | Wild giants + structural mutation; real production (wild run) |
| Recomputability | Final numbers without records | Per-sample raw `.jsonl` with sha256 + harness + log |
| Quality | Unmeasured, or perplexity as proxy | Arena with real tasks and judges; release gate |
| LLM cost | Simulated or omitted | Real provider calls, cost published |
| Passthrough | Not reported | Per-capsule rate published |
| Margin basis | One basis, usually the most favorable | Volume **and** single-pass, both published |
| Margin vs. savings | Conflated | Separated; coverage measured by production telemetry |
| Errors and regressions | Undeclared | Declared, fixed, and retroactively annotated |

On the technical plane, the work positions itself relative to the literature: perplexity-based compressors such as **LLMLingua and LongLLMLingua** (Jiang et al., 2023) demonstrate generic prompt compression in the 10–20× range by pruning tokens by estimated importance; **RECOMP** (Xu et al., 2023) demonstrates query-aware abstractive summarization for RAG — an approach the NUXS `rag` capsule adopts and extends. The template extraction in the `log` capsule follows the lineage of **Drain** (He et al., 2017) for structural log parsing. NUXS's architectural difference from generic compressors is per-type specialization with a native output format per capsule, combined with the retrieve layer that preserves access to the intact data — compression as a navigable map, not as pruning.

Additionally, compression composes with provider **prompt caching** (which reduces the price of a repeated prefix without reducing context-window occupancy): capsules are byte-deterministic (a tested invariant — repeated runs produce identical bytes), making them eligible for provider prefix caching — the two savings multiply rather than compete.

---

## 10. Reproducibility

Every run publishes, in the benchmarks folder (`docs-publicos/benchmarks/`):

- `REPORT.md` — the run's report;
- `*-summary.json` — the per-capsule summary;
- `*-raw.jsonl` — one line per sample, with the input's sha256;
- `*-run.log` — the full execution log;
- the harness (`benchmark-*.mjs`) that generated everything.

Every aggregate in this document is recomputable from those artifacts. Methodological challenges are welcome: the protocol exists to be audited.

---

## References

- Jiang, H. et al. (2023). *LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models.* EMNLP 2023.
- Jiang, H. et al. (2023). *LongLLMLingua: Accelerating and Enhancing LLMs in Long Context Scenarios via Prompt Compression.*
- Xu, F. et al. (2023). *RECOMP: Improving Retrieval-Augmented LMs with Compression and Selective Augmentation.*
- He, P. et al. (2017). *Drain: An Online Log Parsing Approach with Fixed Depth Tree.* IEEE ICWS 2017.
- Anthropic. *Prompt Caching* — official API documentation.

---

_NUXS · nuxs.ai · The raw artifacts of every run are available for audit. This document supersedes and extends the benchmark published on Jun 05, 2026 (180.3M, 87.45%), which remains archived as the historical reference of the series._


## Cumulative total — per-capsule distribution

The headline of this study (626,784,439 tokens processed · 574,252,194 saved · 91.62% weighted margin) is the **sum of five separate audited runs**. The table below distributes that cumulative total by capsule: each row is the capsule summed across all five runs (official 180.3M + F4 127.6M + wild-hook 20.2M + 100M + 200M), TEXT and CODE profiles combined.

| Capsule | Class | Tokens processed | Tokens saved | Margin |
|---|---|---:|---:|:---:|
| log | algorithmic | 93,336,248 | 92,478,692 | 99.1% |
| codebase | algorithmic | 68,100,699 | 57,771,407 | 84.8% |
| diff | algorithmic | 63,931,733 | 51,418,235 | 80.4% |
| api | algorithmic | 55,406,079 | 55,329,455 | 99.9% |
| prompt | algorithmic | 49,918,938 | 49,571,251 | 99.3% |
| rag | LLM | 42,674,288 | 39,067,940 | 91.5% |
| build | algorithmic | 39,381,798 | 38,577,940 | 98.0% |
| test | algorithmic | 36,577,472 | 33,486,726 | 91.6% |
| schema | algorithmic | 28,994,463 | 16,818,449 | 58.0% |
| network | algorithmic | 28,443,603 | 28,257,309 | 99.3% |
| apispec | algorithmic | 22,007,114 | 18,966,567 | 86.2% |
| stack | LLM | 21,944,586 | 20,138,460 | 91.8% |
| threads | LLM | 20,308,235 | 18,773,742 | 92.4% |
| events | LLM | 19,003,173 | 18,769,332 | 98.8% |
| sql | LLM | 15,555,985 | 15,260,167 | 98.1% |
| pdf | LLM | 15,276,099 | 13,734,220 | 89.9% |
| session | retired | 3,901,389 | 3,825,574 | 98.1% |
| image | algorithmic | 2,017,139 | 2,002,654 | 99.3% |
| **TOTAL** | — | **626,779,041** | **574,248,120** | **91.62%** |

Reconciliation: the rows total 626,779,041 processed / 574,248,120 saved — within rounding of the audited 626,784,439 / 574,252,194 (91.62%). "session" is a **retired** capsule (no longer in the 17-capsule product), kept here only so the rows reconcile to the audited total; the three multimodal capabilities (image-LLM, meeting, video) are a separate 1M phase, outside this text/code total.


---

## Cumulative total — per-capsule distribution

The study headline — **626,784,439** tokens processed · **574,252,194** saved · **91.62%** weighted margin — is the sum of five separate audited runs. The table below distributes that cumulative total **by capsule**: each row sums the capsule across all five runs (official 180.3M + F4 127.6M + wild-hook 20.2M + 100M + 200M), TEXT and CODE profiles combined.

| Capsule | Class | Tokens processed | Tokens saved | Margin |
|---|---|---:|---:|:---:|
| log | algorithmic | 93,336,248 | 92,478,692 | 99.1% |
| codebase | algorithmic | 68,100,699 | 57,771,407 | 84.8% |
| diff | algorithmic | 63,931,733 | 51,418,235 | 80.4% |
| api | algorithmic | 55,406,079 | 55,329,455 | 99.9% |
| prompt | algorithmic | 49,918,938 | 49,571,251 | 99.3% |
| rag | LLM | 42,674,288 | 39,067,940 | 91.5% |
| build | algorithmic | 39,381,798 | 38,577,940 | 98.0% |
| test | algorithmic | 36,577,472 | 33,486,726 | 91.6% |
| schema | algorithmic | 28,994,463 | 16,818,449 | 58.0% |
| network | algorithmic | 28,443,603 | 28,257,309 | 99.3% |
| apispec | algorithmic | 22,007,114 | 18,966,567 | 86.2% |
| stack | LLM | 21,944,586 | 20,138,460 | 91.8% |
| threads | LLM | 20,308,235 | 18,773,742 | 92.4% |
| events | LLM | 19,003,173 | 18,769,332 | 98.8% |
| sql | LLM | 15,555,985 | 15,260,167 | 98.1% |
| pdf | LLM | 15,276,099 | 13,734,220 | 89.9% |
| session | retired | 3,901,389 | 3,825,574 | 98.1% |
| image | algorithmic | 2,017,139 | 2,002,654 | 99.3% |
| **TOTAL** | — | **626,779,041** | **574,248,120** | **91.62%** |

*Reconciliation: rows total 626,779,041 processed / 574,248,120 saved — within rounding of the audited 626,784,439 / 574,252,194 (91.62%). "session" is a retired capsule (no longer in the 17-capsule product), kept only so the rows reconcile to the audited total; the three multimodal capabilities are a separate 1M phase, outside this text/code total.*
