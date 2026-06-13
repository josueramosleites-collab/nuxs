#!/usr/bin/env node
// Replay the BILL STRUCTURE over real Claude Code transcripts.
// Same method as the input study — parses message.usage per assistant turn.
// Output: cost share per component (cache_read/write, output, input) + segmentation
// by session size. n=1, code profile, replay != production.
//
// Usage:
//   NUXS_TRANSCRIPTS_DIR=/path/to/your/transcripts node replay-bill.mjs
//
// The environment variable is REQUIRED — there is intentionally no default path
// pointing at any specific user's transcripts.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = process.env.NUXS_TRANSCRIPTS_DIR;
if (!DIR) {
  console.error('NUXS_TRANSCRIPTS_DIR is required (path to a folder containing *.jsonl transcripts).');
  process.exit(1);
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.jsonl'));
// Opus 4.x prices ($/M tok). Update if running for a different model.
const P = { inp: 15, out: 75, cread: 1.5, cw5: 18.75, cw1h: 30 };

const sessions = [];
for (const f of files) {
  let lines; try { lines = readFileSync(join(DIR, f), 'utf8').split('\n').filter(Boolean); } catch { continue; }
  let turns = 0, inp = 0, out = 0, cread = 0, cw5 = 0, cw1h = 0;
  for (const ln of lines) {
    let o; try { o = JSON.parse(ln); } catch { continue; }
    if (o?.type !== 'assistant') continue;
    const u = o?.message?.usage; if (!u) continue;
    turns++; inp += u.input_tokens || 0; out += u.output_tokens || 0; cread += u.cache_read_input_tokens || 0;
    const cc = u.cache_creation || {};
    cw5 += cc.ephemeral_5m_input_tokens || 0; cw1h += cc.ephemeral_1h_input_tokens || 0;
    if (!cc.ephemeral_5m_input_tokens && !cc.ephemeral_1h_input_tokens && u.cache_creation_input_tokens) cw5 += u.cache_creation_input_tokens;
  }
  if (turns > 0) sessions.push({ turns, inp, out, cread, cw5, cw1h });
}
const agg = sessions.reduce((a, s) => ({ turns: a.turns + s.turns, inp: a.inp + s.inp, out: a.out + s.out, cread: a.cread + s.cread, cw5: a.cw5 + s.cw5, cw1h: a.cw1h + s.cw1h }), { turns: 0, inp: 0, out: 0, cread: 0, cw5: 0, cw1h: 0 });
const cost = (s) => (s.inp * P.inp + s.out * P.out + s.cread * P.cread + s.cw5 * P.cw5 + s.cw1h * P.cw1h) / 1e6;
const total = cost(agg);
const pct = (n) => (100 * n / total).toFixed(1) + '%';
console.log(`sessions=${sessions.length} turns=${agg.turns}`);
console.log(`cache_read ${pct(agg.cread * P.cread / 1e6)} | cache_write ${pct((agg.cw5 * P.cw5 + agg.cw1h * P.cw1h) / 1e6)} | output ${pct(agg.out * P.out / 1e6)} | input ${pct(agg.inp * P.inp / 1e6)}`);
const buckets = [['<100', (s) => s.turns < 100], ['100-500', (s) => s.turns >= 100 && s.turns < 500], ['500-2000', (s) => s.turns >= 500 && s.turns < 2000], ['2000+', (s) => s.turns >= 2000]];
for (const [name, fn] of buckets) {
  const g = sessions.filter(fn); if (!g.length) continue;
  let o = 0, t = 0; for (const s of g) { o += s.out * P.out / 1e6; t += cost(s); }
  console.log(`  ${name.padEnd(9)} n=${String(g.length).padStart(3)}  output=${(100 * o / t).toFixed(1)}%`);
}
