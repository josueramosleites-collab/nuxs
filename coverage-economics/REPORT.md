# Coverage, bill structure and the compounding effect of cache — 2026-06-11

_Replay over 90 **real** Claude Code transcripts, same method used in the input study,
just swapping the input file. **This is not a margin benchmark** (that one is the 200M
report at 95.42%). This is the **coverage** study (how much of the traffic we intercept)
and the **cost structure** study (where the bill actually lives)._

## Honesty labels (apply to everything below)

- **n=1, code profile** (heavy-reader developer sessions). Text/RAG profile will differ.
- **Replay ≠ production.** The in-product meter (0.5.36) gives the real number per client.
- Opus 4.x prices used ($/M tok): input 15 · output 75 · cache_read 1.5 · cache_write 5m 18.75 / 1h 30.
- These transcripts are the **raw** traffic (Claude Code direct). They are the **before** of
  compression — the reference against which the product shows gain. (Compression runs in the
  PreToolUse hook locally; the 0.5.36 meter captures the after, per client.)

---

## 1. The three numbers of the study

What the product can honestly claim — three numbers, not one:

### 1.1 Engine margin — **91.62%**
**626,784,439 tokens processed / 574,252,194 saved = 91.62%** weighted margin across the
cumulative audited volume (five separate runs). Auditable, raw files preserved. This is
the official benchmark number — see the `BENCHMARK-626M.md` document at the repository
root. It is what the engine compresses **on the intercepted slice**.

### 1.2 Coverage — **~46%** (code profile)
**~46% of the text tokens** the hook sees become a capsule (0.5.36 rule, replay of 1,621
reads over 90 real Claude Code sessions, n=1, code profile). Text/RAG profile is
structurally better — that traffic IS capsulable data.
- The other 54% raw are **by design**: first read of code files <80KB that will be edited
  (probability zone), tiny files (<2KB, negative EV), prose.
- **Routing gap ≈ 0** (0.02M of 18M) — the Stage E content-sniffer in the router already
  classifies extensionless files by content. No data is being misrouted.
- Largest raw bucket: **CSS** (one Tailwind file re-read 86×; 92% same-epoch re-reads) —
  the faucet that the **type-agnostic dedup** addresses (separate internal design), the
  only algorithmic coverage lever still open.

### 1.3 Real margin / Effective economy — **~42%**
**0.9162 × 0.461 ≈ 0.422 — about 42% of the input bill** is cut on the code profile (the
worst profile). It is **not** 91.62% (that is only on the intercepted slice). Plus the
**compounding effect on cache**: every token compressed out of context saves every
remaining turn of the session, and cache is **91% of the bill** (see §2). On a long
session, the headline 42% understates the realized saving.

### 1.4 Honesty note — two studies, two universes

The 91.62% margin comes from the 626M benchmark (fixtures, audited runs). The 46%
coverage comes from this study (replay over 90 real Claude Code sessions, code profile,
n=1). They are **two different universes**: cross-multiplying them to claim a single
"total = 1.36B" number would be an **extrapolation** (multiplying the engine margin by a
coverage measured in production transcripts). What the product can affirm without
extrapolation is **the three numbers separately, in the order above**: engine 91.62% on
the intercepted slice, coverage ~46% on the code profile, effective economy ~42%
modeled — until in-production meters return per-client coverage.

---

## 2. Bill structure — where the cost LIVES (the finding of the month)

Replay of `usage` over **30,306 assistant turns**. Cost share per component:

| Component | Share of bill |
|---|---:|
| **cache_read** (context re-read every turn) | **68%** |
| **cache_write** (context being cached) | 23% |
| output | 8% |
| fresh input | 0.1% |

**91% of the bill is CACHE** — the context being re-read and re-written every turn. Fresh
input is negligible. **The bill is not input nor output — it is the re-read context.**

### 2.1 Segmented by session size (the skepticism that refined it)

| Session size | n | turns | output % of cost | cache % of cost |
|---|---:|---:|---:|---:|
| short (<100 turns) | 82 | 820 | 22.0% | 77.7% |
| medium (100–500) | 4 | 643 | 14.3% | 85.7% |
| large (500–2000) | 1 | 762 | 8.8% | 91.2% |
| monster (2000+) | 3 | 28,089 | 7.9% | 92.0% |

- **Cache dominates across every size (78–92%)** — finding survives segmentation.
- The aggregate 8% output figure was an **artifact of the 3 monster sessions** (28k of 30k
  turns). Output share scales **inverse** to session size: **22% (short) → 8% (monster)**.
  In a typical working session it sits at **~10–14%**.

---

## 3. The COMPOUNDING effect of re-reads — why coverage is the right lever

Claude Code re-reads the **entire context every turn** (that is what the 14B cache_read tokens
represent in this sample). The decisive consequence for NUXS:

> **A token compressed out of context does not save once — it saves every remaining turn
> of the session.** Compression and coverage have a **compounding effect**; the executor
> (output) would save once per task.

Pitch arithmetic: every MB out of context yields **~N turns** of cache_read saved (N = turns
remaining). Longer session → cheaper → does not die. The original product promise has a
**mechanism proof** here: compression was pointing at the 91% from day one, before anyone
measured it was 91%.

---

## 4. Strategic reorientation (with a number, not intuition)

1. **Compression/coverage attacks the 91% (cache), with a compounding effect.** That is the
   frontier. Type-agnostic dedup is the last algorithmic input faucet — design ready,
   pending probability `p` + Arena-gate.
2. **Executor router (output) drops down the queue, does not die.** It is 8% in monster
   sessions, ~14% on average, and **rises as compression shrinks the cache** (smaller
   denominator). Right order: compression first, executor after capturing its share.
3. **cache_write (23%) imposes a design constraint:** capsules and dedup have to be
   **prefix-stable** (byte-deterministic, appending without invalidating the prior context).
   Verified: determinism is a tested invariant (`e2e-stability: 10 runs = identical bytes`);
   `resetEpoch` changes timing, not bytes; re-reads serve cache keyed by (path, mtime). The
   new faucet does not leak through cache_write.

---

## 5. Delivery: local/MCP (default, free) vs proxy (optional, paid)

**Important framing correction (2026-06-11):** compression does NOT depend on the proxy.

- **Free / plan / local / MCP** (the dominant path): the **11 algorithmic capsules run
  100% locally** via the PreToolUse hook — zero proxy, zero endpoint. This is the largest
  share of coverage and already works. **The free plan has no proxy.**
- **Proxy (Render)** is an **optional/paid** delivery (API gateway) — not a prerequisite
  for compression. The 6 LLM capsules (paid) need an LLM endpoint; the proxy is one of
  the ways to deliver that.
- local / proxy / MCP are **delivery forms**, not compression states.

### What is missing to make it irrefutable
- **In-production meter** (0.5.36, shipped) running on **real clients** → coverage by
  profile/client. Works for the local/MCP path **without proxy** — the meter is in the
  hook, not in the gateway.
- Once real clients run it: stops being "we measured on ourselves" and becomes "every
  client's dashboard shows it".

_Replay scripts are in this folder (parse `message.usage` per turn). Method identical to
the input study. n=1, code profile, replay ≠ production — repeat per client in production._
