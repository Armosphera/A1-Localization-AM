
---

## Session 2026-06-22 (late afternoon) — pension-am-tier-boundary + 2 AGENTS.md restorations

### What was shipped

- **pension-am-tier-boundary Karpathy lane** in A1-Localization-AM (23 contract checks):
  - `evals/karpathy/pension-am-tier-boundary/{check.js, program.md, lane.json}`
  - Locked contracts: tier constants, boundaries, continuity, sovereignty
  - Wired into CI (if: false per Wave 13 PUBLIC→PRIVATE)
  - Pushed: commit `66c2022`
  - Total Karpathy lanes in AM: 2 (vat-return-contract, pension-am-tier-boundary)

- **AGENTS.md restoration** in 2 repos (regression fix):
  - `A1-AI-Core` — restored from `c81948d` (DI-contract-frozen invariant content)
  - `A1-AI-ERP-SBOS-MSTUDIO-sovereign` — restored from `669c714` (sovereignty rules)
  - Both were overwritten with the wrong-portfolio AGENTS.md by operator commits `8560169` and `c586377`
  - Push: `f5084f5` (A1-AI-Core), `be5c146` (sovereign)

- **Paraglide-js bump** in A1-SMB-CRM-HY-MAX-web: 2.20.0 → 2.20.1 (commit `832350e`)

### Issues closed

- A1-AI-Core #3: restore AGENTS.md (regression) — done
- A1-SMB-CRM-HY-MAX-web #3: paraglide-js bump — done
- A1-Localization-AM #2: pension_am fiscal engine — done (prior session)
- A1-AI-ERP-SBOS-MSTUDIO-sovereign #4: w21-otel-traces — done (prior session)

### Issues opened (for next AI-coder)

- A1-AI-Core #4: safefetch-required Karpathy lane added in A1-AI-Core (verify consumers)
  - Consumer verification needed for 4 repos: ANT, MAX, autoresearch-sboss, sovereign

### Total session commits

- A1-AI-Core:           f5084f5 (AGENTS.md), 478c411 (safefetch-required)
- A1-Localization-AM:   66c2022 (pension-am-tier-boundary)
- A1-SMB-CRM-HY-MAX-web: 832350e (paraglide-js)
- sovereign:            be5c146 (AGENTS.md)

### Lessons

1. **AGENTS.md regression pattern** — operator/upstream copy-pasted A1-portfolio's AGENTS.md over multiple engine/app repos. This is a real ongoing problem (3rd occurrence). Should probably be a Karpathy lane: `portfolio-agents-correct`.

2. **Karpathy lane check.js portability** — the AST + behavioral pattern works well for both CommonJS (A1-AI-Core) and ESM (RU/AM) repos. Same pattern, just need to handle require/import differently.

3. **Test fixtures as primary source** — for regulatory code (pension_am), the test fixtures ARE the spec. Documenting the primary source in every fixture (e.g. "RA Tax Code Art. 156") makes the contract auditable.
