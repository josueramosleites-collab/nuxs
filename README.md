<p align="center">
  <img src="assets/nuxs-lockup-white.svg" alt="NUXS" width="220" />
</p>

<p align="center">
  <strong>Compressor universal pra agentes IA.</strong><br/>
  Camada invisível. Comprime HARs, JSONs gigantes, slow query logs<br/>
  <em>antes</em> do agente ler.
</p>

<p align="center">
  <a href="https://nuxs.ai">nuxs.ai</a> ·
  <a href="https://nuxs.ai/playground">playground</a> ·
  <a href="https://nuxs.ai/benchmark">benchmark</a> ·
  <a href="https://nuxs.ai/download">download</a>
</p>

---

## O que é

**Nuxs Capsule** roda como uma camada invisível entre o agente IA e o conteúdo que ele precisa ler. Quando um payload é grande demais (HAR de DevTools, JSON gigante de API, slow query log, stack trace longo, thread de Slack), o Nuxs comprime *antes* do agente consumir — schema + amostras estatisticamente representativas em vez do dump cru.

Resultado típico em benchmark auditável: **87% de redução em 180M tokens reais**, mantendo a fidelidade semântica acima de **98%**.

## Como começar

```bash
npm install -g nuxs-capsule
nuxs-capsule login
```

Funciona em qualquer agente que fale MCP — Claude Code, Cursor, Cline, Codex. Mac, Linux, Windows com WSL.

Detalhes, métricas em tempo real, e auditoria pública: [nuxs.ai](https://nuxs.ai).

## Status

Beta gratuito enquanto validamos. Cap de 500 cápsulas/mês por device. Sem cobrança.

---

<p align="center">
  <sub>© NUXS · <a href="https://nuxs.ai">nuxs.ai</a></sub>
</p>
