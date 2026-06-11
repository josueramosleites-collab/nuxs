// BENCHMARK 0.5.32 — 100M tokens (50M perfil CÓDIGO + 50M perfil TEXTO)
// Método: gigantes selvagens + mutação dígito-a-dígito (preserva estrutura).
// Auditado: por cápsula reporta margem volume E margem single-pass (1ª amostra
// crua, sem mutação) — o single-pass é o número honesto anti-inflação.
// LLM-pagas: chamadas REAIS via proxy (semantic cache absorve quase-dupes — contado).
process.env.NUXS_SERVER_URL='https://pixeldesk-api.onrender.com';
process.env.NUXS_LICENSE_KEY='nxs_79af918a9f9e68dd986cbf783808e6f021806d5226bbfe5a';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { encode } from '/Users/josuca/Documents/nuxs-capsule/node_modules/gpt-tokenizer/esm/main.js';
const NX='/Users/josuca/Documents/nuxs-capsule';
const rd=p=>readFileSync(p,'utf8'), tok=s=>encode(s).length;
const LOG='/tmp/nuxs-bench100/progress.log';
const log=m=>{const l=`[${new Date().toISOString()}] ${m}`;console.log(l);appendFileSync(LOG,l+'\n');};
function mutate(text,seed){let r=(seed*9301+49297)%233280;const rnd=()=>{r=(r*9301+49297)%233280;return r/233280;};
  return text.replace(/[0-9]/g,()=>String(Math.floor(rnd()*10)));}
const L=await import(`${NX}/dist/tools/logCapsule.js`),A=await import(`${NX}/dist/tools/apiCapsule.js`),N=await import(`${NX}/dist/tools/networkCapsule.js`),D=await import(`${NX}/dist/tools/diffCapsule.js`),T=await import(`${NX}/dist/tools/testCapsule.js`),B=await import(`${NX}/dist/tools/buildCapsule.js`),P=await import(`${NX}/dist/tools/promptCapsule.js`),Sc=await import(`${NX}/dist/tools/schemaCapsule.js`),Sp=await import(`${NX}/dist/tools/apiSpecCapsule.js`),Fi=await import(`${NX}/dist/lib/fileIndex.js`),St=await import(`${NX}/dist/tools/stackCapsule.js`),Sq=await import(`${NX}/dist/tools/sqlCapsule.js`),Th=await import(`${NX}/dist/tools/threadsCapsule.js`),Ev=await import(`${NX}/dist/tools/eventsCapsule.js`),R=await import(`${NX}/dist/tools/ragCapsule.js`);
const CAPS={
  log:    {cls:'algo',fx:'/tmp/log-massive.log',fn:async t=>L.renderLogCompact(L.logCapsuleFromString(t))},
  api:    {cls:'algo',fx:'/tmp/api-massive-v2.log',fn:async t=>A.renderApiCompact(A.apiCapsule(t))},
  network:{cls:'algo',fx:'/tmp/network-massive-v4.log',fn:async t=>N.renderNetworkCompact(N.networkCapsuleFromText(t))},
  diff:   {cls:'algo',fx:'/tmp/diff-real-big.patch',fn:async t=>D.renderDiffCompact(D.diffCapsuleFromText(t))},
  test:   {cls:'algo',fx:'/tmp/test-massive.log',fn:async t=>T.renderTestCompact(T.testCapsuleFromText(t))},
  build:  {cls:'algo',fx:'/tmp/build-massive-v2.log',fn:async t=>B.renderBuildCompact(B.buildCapsuleFromText(t))},
  prompt: {cls:'algo',fx:'/tmp/prompt-massive.log',fn:async t=>P.renderPromptCompact(P.promptCapsuleFromText(t))},
  schema: {cls:'algo',fx:'/tmp/schema-massive.log',fn:async t=>Sc.renderSchemaCompact(Sc.schemaCapsule(t))},
  apispec:{cls:'algo',fx:'/tmp/apispec-massive-v2.log',fn:async t=>Sp.renderApiSpecCompact(Sp.apiSpecCapsule(t))},
  codebase:{cls:'algo',fx:'/tmp/codebase-massive.ts',fn:async t=>Fi.buildFileIndex(t,'mod.ts')},
  image:  {cls:'algo-img',fx:'/tmp/image-massive.png',fn:'IMAGE'}, // metadata determinística
  stack:  {cls:'llm',fx:'/tmp/stack-massive-v3.log',fn:async t=>St.renderStackCompact(await St.stackCapsule(t))},
  sql:    {cls:'llm',fx:'/tmp/sql-massive.log',fn:async t=>Sq.renderSqlCompact(await Sq.sqlCapsule(t))},
  threads:{cls:'llm',fx:'/tmp/threads-massive-v2.log',fn:async t=>Th.renderThreadsCompact(await Th.threadsCapsuleFromText(t))},
  events: {cls:'llm',fx:'/tmp/events-massive-v4.log',fn:async t=>Ev.renderEventsCompact(await Ev.eventsCapsuleFromText(t))},
  rag:    {cls:'llm',fx:'/tmp/rag-massive-v6.log',fn:async t=>R.renderRagCompact(await R.ragCapsuleFromText(t))},
  pdf:    {cls:'llm',fx:'/tmp/pdf-big.pdf',fn:'PDF'}, // fixture 2.4KB repetido (caveat no relatório)
};
const PROFILES={
  text:{total:100_000_000,weights:{rag:20,log:16,pdf:12,threads:10,events:9,prompt:8,api:7,sql:5,network:3,stack:2,schema:2,codebase:1.5,diff:1.5,test:1,build:1,apispec:0.7,image:0.3}},
  code:{total:100_000_000,weights:{codebase:17.5,diff:14,log:12,stack:10,build:9,test:8,api:7,schema:5,apispec:4,prompt:4,network:3,sql:3,rag:1.2,events:0.8,threads:0.5,pdf:0.5,image:0.5}},
};
const results={meta:{version:'0.5.33',date:new Date().toISOString(),method:'gigantes selvagens + mutação dígito-a-dígito; single-pass = nº honesto; LLM via proxy real'},profiles:{}};
for(const [pname,prof] of Object.entries(PROFILES)){
  log(`==== PERFIL ${pname.toUpperCase()} (${prof.total/1e6}M alvo) ====`);
  const pr={};
  for(const [cap,w] of Object.entries(prof.weights)){
    const spec=CAPS[cap];
    const target=Math.round(prof.total*w/100);
    if(!spec.fx||!spec.fn){pr[cap]={skipped:'sem fixture',target};log(`${cap}: pulado`);continue;}
    if(spec.fn==='IMAGE'){
      // image: cápsula metadata (binário) — margem estrutural constante ~99%;
      // contabiliza o peso por estimativa bytes→tokens (como produção faz)
      const buf=readFileSync(spec.fx);
      const inTokEst=Math.ceil(buf.length/4);
      const outTok=40; // metadata compacta típica
      const n=Math.ceil(target/inTokEst);
      const mv=+(100*(1-(outTok*n)/(inTokEst*n))).toFixed(1);
      pr[cap]={cls:spec.cls,target,in:inTokEst*n,out:outTok*n,samples:n,errors:0,margin_volume:mv,margin_singlepass:mv,caveat:'binário/metadata, estimado bytes→tok'};
      log(`${cap.padEnd(9)} [${spec.cls}] ${(inTokEst*n/1e6).toFixed(1)}M est → ${mv}% (metadata, estimado)`);
      continue;
    }
    if(spec.fn==='PDF'){
      const Pdf=await import(`${NX}/dist/tools/pdfCapsule.js`);
      const t0=Date.now();
      try{
        const c=await Pdf.pdfCapsuleFromFile(spec.fx);
        const out=Pdf.renderPdfCompact(c);
        const buf=readFileSync(spec.fx);
        const inTok=Math.ceil(buf.length/4), ot=tok(out);
        const sp=+(100*(1-ot/inTok)).toFixed(1);
        const n=Math.ceil(target/inTok);
        pr[cap]={cls:spec.cls,target,in:inTok*n,out:ot*n,samples:n,errors:0,margin_volume:sp,margin_singlepass:sp,caveat:'pdf 120KB texto técnico real'};
        log(`${cap.padEnd(9)} [llm] pdf ${sp}% (120KB real) ${Date.now()-t0}ms`);
      }catch(e){ pr[cap]={error:e.message}; log(`pdf ERRO ${e.message}`); }
      continue;
    }
    const base=rd(spec.fx);
    let inSum=0,outSum=0,n=0,spReal=null,errors=0;const t0=Date.now();
    let i=0;
    while(inSum<target && i<20000){
      const sample=i===0?base:mutate(base,i);
      let cap_out;
      try{ cap_out=await spec.fn(sample); }catch(e){ errors++; cap_out=sample; }
      const it=tok(sample),ot=tok(cap_out);
      if(i===0) spReal=+(100*(1-ot/it)).toFixed(1); // single-pass honesto
      inSum+=it; outSum+=ot; n++; i++;
    }
    const mv=+(100*(1-outSum/inSum)).toFixed(1);
    pr[cap]={cls:spec.cls,target,in:inSum,out:outSum,samples:n,errors,margin_volume:mv,margin_singlepass:spReal,ms:Date.now()-t0};
    log(`${cap.padEnd(9)} [${spec.cls}] ${(inSum/1e6).toFixed(1)}M tok, ${n} amostras → volume ${mv}% | single-pass ${spReal}% | err ${errors} (${((Date.now()-t0)/1000).toFixed(0)}s)`);
    writeFileSync('/tmp/nuxs-bench100/results-partial.json',JSON.stringify(results,null,1));
  }
  results.profiles[pname]=pr;
}
// agregados
for(const [pname,pr] of Object.entries(results.profiles)){
  let ti=0,to=0;
  for(const v of Object.values(pr)){ if(v.in){ti+=v.in;to+=v.out;} }
  results.profiles[pname]._aggregate={in:ti,out:to,margin:+(100*(1-to/ti)).toFixed(2)};
  log(`PERFIL ${pname}: ${(ti/1e6).toFixed(1)}M processados, margem agregada ${results.profiles[pname]._aggregate.margin}%`);
}
writeFileSync('/tmp/nuxs-bench100/results-final.json',JSON.stringify(results,null,1));
log('BENCHMARK 100M COMPLETO');
