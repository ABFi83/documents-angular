# Allineamento alle convenzioni di wilson_fe

> **Stato:** Aperto · **Owner:** Alessio Baldini · **Data:** 2026-11-20 · **Jira:** —
>
> **Blocco:** nessuno

Portare in documents-angular le metodologie di `wilson_fe` (AGENTS.md, tooling, struttura), escluso il UI kit
Fentre (`@40factory/ff-component`, `ffc-*`, `FFSignalFormModule`, `get-variable-from-uikit`, MCP `ffc-component`):
al suo posto elementi HTML nativi e token colore propri.

Decisioni prese: i18n it + en, riscrittura completa degli stili, pnpm, pre-push hook, Playwright e2e,
`plan/` + regole di commit, snackbar proprio al posto di `@ngxpert/hot-toast`.

Nessuna modifica funzionale: solo bug fix, refactor e accessibilità (elenco a fine lavoro).

## Step

- [ ] 1. Tooling: pnpm (+ `pnpm-workspace.yaml` con `minimumReleaseAge`), Prettier, ESLint (angular-eslint + boundaries), Stylelint (`value-no-px`, proprietà logiche), `.editorconfig` LF, `.githooks/pre-push` + `scripts/prepare.mjs`, `.vscode/settings.json` (scope commit), `commit-message.md`
- [ ] 2. tsconfig: flag strict di wilson_fe + path alias (`@common`, `@interfaces`, `@pages`, `@utils`, `@environments`)
- [ ] 3. Struttura: `environments/`, `interfaces/<dominio>.interface.ts`, `common/{interceptors,guards,services,components}`, `pages/<pagina>/`, `styles/{functions,variables,mixins/}`; naming senza suffisso `.component`
- [ ] 4. i18n: `@ngx-translate`, `public/i18n/it.json` + `en.json`, nessun testo hardcoded
- [ ] 5. Feedback: `HttpFeedbackService` a signal + componente snackbar, rimozione hot-toast; un solo `httpInterceptor`
- [ ] 6. Componenti: `inject()`, `#private`, `input()/output()/model()`, Signal Forms, `rxResource`, `host` al posto di `@HostListener`, niente `standalone`/`changeDetection` (OnPush di default), `<dialog>`/`popover` nativi, route lazy
- [ ] 7. SCSS: niente classi (selettori di elemento + `data-role`), `fn.calc-unit()`, proprietà logiche, colori `oklch` via token, mixin condivisi, contrasto AA
- [ ] 8. Test: Vitest per ogni componente/servizio/guard/interceptor, Playwright `tests/e2e` con API mockate
- [ ] 9. `AGENTS.md` adattato (senza Fentre) + `CLAUDE.md` → `@AGENTS.md`
- [ ] 10. Verifica: build, `ng test`, eslint, stylelint, prettier, e2e; poi eliminare questo piano
