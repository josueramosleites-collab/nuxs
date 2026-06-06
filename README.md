<p align="center">
  <img src="assets/nuxs-lockup-white.svg" alt="NUXS" width="220" />
</p>

# NUXS — Universal context compression for AI agents

> Reproducible measurements of context compression for AI agents.
> Reference engine: **nuxs-capsule 0.1.57** · Tokenizer: **cl100k_base**
> Website: **[nuxs.ai](https://nuxs.ai)** · Try it live: **[nuxs.ai/playground](https://nuxs.ai/playground)**

This repository publishes the raw data and the technical report for the NUXS context-compression study. Every metric stated in the report is recomputable from the files in this repository.

---

## Try it before reading anything else

The fastest way to understand NUXS is to feed it your own context and watch the compression happen.

- **Playground** — paste a HAR, a JSON payload, a slow query log, a code dump or pick one of the sample fixtures: **[nuxs.ai/playground](https://nuxs.ai/playground)**
- **Benchmark UI** — explore the report inline with sortable tables: **[nuxs.ai/benchmark](https://nuxs.ai/benchmark)**
- **Install the CLI** — wire it into Claude Code, Cursor, Cline or any MCP-compatible agent in 30 seconds: **[nuxs.ai/download](https://nuxs.ai/download)**

```bash
npm install -g nuxs-capsule
nuxs-capsule login
```

---

## What is NUXS

NUXS is a context compression layer that sits between an AI agent and the model. It reduces the input — conversation history, logs, schemas, diffs, code, search results, and other agent context — before it reaches the model, returning a smaller, denser, cheaper input. NUXS is provider-agnostic and works with Claude, Cursor, Codex, Cline, Aider, or any integration via SDK or proxy, using your own key.

The product is organized into **17 text capsules**, each specialized in a type of context (log, api, network, diff, test, build, schema, apispec, prompt, codebase, stack, sql, events, session, threads, pdf, rag), plus **3 multimodal capabilities** (image, video, meeting) that translate media into dense textual context.

---

## How it works (pricing & access)

NUXS is in **open beta** and the CLI is **free to install and use** while we validate with early users. Concretely:

- **Free playground** (`nuxs.ai/playground`) — algorithmic capsules run in-browser. No signup needed. Soft cap per IP to keep it open to everyone.
- **Free CLI beta** — install `nuxs-capsule` from npm, log in once with `nuxs-capsule login`, and the hook wires itself into every MCP-compatible agent on the device. Current cap: **500 capsules / month / device**. No card required.
- **Paid tiers** (Solo / Team / Enterprise) lift the monthly cap, raise the device limit, and unlock the LLM-based capsules and multimodal capabilities at scale. Details on `nuxs.ai`.

The 10 algorithmic capsules are deterministic and run entirely on-device. The 7 LLM-based capsules call a model — by default the NUXS-managed proxy, optionally your own key.

---

## Roadmap & openness

We believe the auditable surface of NUXS should be **as open as possible without giving away the engine that pays the bills**. Today that means:

- **Open**: the full benchmark dataset (this repository), the technical report, the manifesto, the website, the playground sample fixtures, and the CLI distribution on npm.
- **Considered for the future**: open-sourcing the **algorithmic** capsules under a permissive license once the product is stable. The LLM-based capsules and the routing engine are expected to remain proprietary for the foreseeable future.

Nothing here is a commitment to a specific date — these are the directions we're walking. If you want to influence the order, open an issue or write to us via `nuxs.ai`.

---

## Headline numbers

| Metric | Value |
|---|---:|
| Auditable volume | **180,590,521** tokens |
| Auditable samples | **9,609** |
| Tokens saved | **157,948,621** |
| Aggregate margin (17 capsules) | **87.46%** |
| Real-world margin — Programmer profile | **~92%** |
| Real-world margin — RAG/LLM profile | **95.4%** |
| Capsules with margin ≥ 95% (synthetic) | **11 of 17** |
| Multimodal capabilities validated | **3** (image, video, meeting) |

All numbers measured with `cl100k_base` via the public `gpt-tokenizer` package.

---

## How to read the numbers

The aggregate published is a **floor**, not a ceiling. Most of the study uses seeded synthetic inputs with high entropy and low redundancy — deliberately designed to measure the worst case. Real inputs carry natural redundancy that synthetic does not reproduce, and consistently compress more. Where direct comparison with real data is available, the report shows structural capsules climbing from synthetic to real:

| Capsule | Synthetic | Real |
|---|---:|---:|
| codebase | 73.1% | 78.2% / 95.2% * |
| diff | 71.7% | ~79% |
| schema | 45.3% | ~67% |
| log / api / build | already at ceiling | ~99% |

\* Two reproducible criteria for codebase in real use: 78.2% over the full universe of 6,050 files (lower auditable bound), and 95.2% over a deterministic top-40 of the largest production files (typical hook regime). Both have raw published.

Capsules with lower aggregate margin (schema, pdf) correspond to data types with high informational density — every element is signal and there is no significant redundancy to discard without loss. These technical ceilings are documented in the report.

---

## Reproducing the metrics

Every metric in the report is recomputable from the published raw files.

```bash
# 1. Install the tokenizer
npm install gpt-tokenizer

# 2. For each line in any raw file, recompute:
#    ratio    = in_tokens / out_tokens
#    pct_saved = (1 - out_tokens / in_tokens) * 100

# 3. Aggregate by capsule, by size bucket, or by run.

# 4. Compare with the corresponding *-summary.json file.
```

Algorithmic capsules (10 of 17) are deterministic — the same input produces the same output byte-for-byte. LLM-based capsules (7 of 17) are sampled at low temperature; the raw files declare `N` and `provider` per configuration.

Each line of every raw file contains, at minimum:

```
capsule, in_tokens, out_tokens, ratio, pct_saved, passthrough,
seed (when applicable), sha256(input)
```

Bucket runs add `size_bucket`; weighted runs add `weight_pct`; LLM runs add `N` and `provider`.

---

## File index

### Reports

| File | Content |
|---|---|
| `benchmark-nuxs-en.docx` | Full technical report (English) |
| `manifesto-nuxs-en.docx` | Companion manifesto (English) |

### Raw data (JSONL — one sample per line)

| File | Content | Samples |
|---|---|---:|
| `benchmark-raw.jsonl` | 1st round — synthetic | 328 |
| `benchmark-large-raw.jsonl` | Large run — synthetic, XS→XXL buckets | 400 |
| `benchmark-rag-raw.jsonl` | RAG/LLM profile — synthetic | 980 |
| `benchmark-r2-raw.jsonl` | Round 2 — synthetic | 707 |
| `benchmark-paid-raw.jsonl` | Backend run (includes multimodal) | 18 |
| `benchmark-20-raw.jsonl` | Round 20 — XL/XXL samples | 30 |
| `benchmark-code-raw.jsonl` | Programmer profile — synthetic | 71 |
| `benchmark-codereal-raw.jsonl` | Real code — full corpus | 7,035 |
| `benchmark-buildindex40-raw.jsonl` | Typical production hook — deterministic top-40 real | 40 |

### Aggregate summaries (JSON)

| File | Content |
|---|---|
| `benchmark-large-summary.json` | Per-bucket and per-capsule aggregates |
| `benchmark-rag-summary.json` | Weighted RAG/LLM profile aggregate |
| `benchmark-r2-summary.json` | Round 2 aggregate |
| `benchmark-paid-summary.json` | Backend run aggregate (includes multimodal) |
| `benchmark-code-summary.json` | Programmer profile aggregate |
| `benchmark-codereal-summary.json` | Real code corpus aggregate |
| `benchmark-buildindex40-summary.json` | Typical hook run, with declared sampling criterion |

---

## Method in brief

- **Tokenizer**: `cl100k_base`, declared explicitly as a reproducible proxy. Other vendors' tokenizers differ by a few percentage points in absolute counts; reported ratios are robust because input and output are measured with the same ruler.
- **Determinism**: algorithmic capsules are bit-for-bit deterministic. LLM-based capsules run at temperature 0.1 and report `N` per configuration.
- **Passthrough**: when a capsule's output would be equal to or greater than the input, the engine returns the input intact and records `ratio = 1.0×`. These points are preserved in the raw and counted in the statistics.
- **Sample identity**: each sample records `seed` (when applicable) and `sha256(input)` for independent verification.
- **Sampling**: synthetic inputs are generated by a seeded deterministic PRNG to ensure bit-for-bit reproducibility. Real inputs come from a public-shaped corpus (code) and from a deterministic top-40 selection over two internal production repositories — the selection criterion is declared in the summary so any third party can reproduce it from equivalent corpora.

The full methodology, including bucket sizes, profile weights, and limits of the method, is documented in `benchmark-nuxs-en.docx` (sections 2, 10, and 11).

---

## Sanitization

Real inputs in the published raw files were sanitized prior to publication:

- Credentials, API tokens, and other secrets — **removed**.
- Personally identifiable data — **removed**.
- Local machine absolute paths — **replaced with neutral identifiers**.

The preserved content is sufficient to recompute every metric reported in the document. The metrics in the report were recomputed on the sanitized raw to ensure consistency with what is public.

---

## Study conduct

The study was conducted internally by the NUXS team. The raw files in this repository are published precisely so that independent third parties can reaudit the numbers without depending on us. If you find a discrepancy between any reported metric and what you compute from the raw, please open an issue.

---

## Versioning

| Field | Value |
|---|---|
| Engine version | `nuxs-capsule 0.1.57` |
| Tokenizer | `cl100k_base` (via `gpt-tokenizer`) |
| Study date | June 6, 2026 |
| Report version | v3 (current) |

Any future re-runs that change reported numbers will be tagged as a new release; this repository preserves the audit trail.

---

## Links

- Website: [nuxs.ai](https://nuxs.ai)
- Playground: [nuxs.ai/playground](https://nuxs.ai/playground)
- Benchmark UI: [nuxs.ai/benchmark](https://nuxs.ai/benchmark)
- Download / install: [nuxs.ai/download](https://nuxs.ai/download)
- Technical report (English): `benchmark-nuxs-en.docx`
- Manifesto (English): `manifesto-nuxs-en.docx`

---

## License

The benchmark data, summaries, and reports in this repository are published under **CC BY 4.0** for auditing, replication, and academic citation. See `LICENSE` for details. The NUXS engine itself is proprietary; this repository contains measurement outputs and public documentation only.

---

<p align="center">
  <sub>© NUXS · <a href="https://nuxs.ai">nuxs.ai</a></sub>
</p>
