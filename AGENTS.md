You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project

Frontend for a backend API (Flask-style, `environment.apiBaseUrl`, default `http://127.0.0.1:5000`): a user logs in, uploads a CV (PDF), then views and edits the profile extracted from it (skills, experiences). Angular 22, client-only (no SSR), zoneless, pnpm.

```bash
pnpm start                                  # eslint + ng serve → http://localhost:4200
pnpm build                                  # eslint + production build → dist/documents-angular
pnpm test                                   # Vitest (watch)
npx ng test --watch=false                   # Vitest, one run
npx ng test --watch=false --include src/app/pages/login/login.spec.ts   # single spec
pnpm test:e2e                               # Playwright (tests/e2e, API mocked with page.route)
pnpm lint                                   # eslint
npx stylelint "src/**/*.scss"
npx prettier --check .
```

TypeScript is pinned to 6.0 because Angular 22 requires `>=6.0 <6.1`.

- **Bootstrap:** `src/main.ts` + `src/app/app.config.ts` (router, `HttpClient` with `httpInterceptor`, `@ngx-translate` with an HTTP loader on `public/i18n/<lang>.json`; English for `en*` browsers, Italian otherwise).
- **Zoneless:** state updated in an HTTP callback, an `await` or a timer must be a `signal`, or the view does not re-render.
- **Routes** (`app.routes.ts`, all lazy): `login`, `registration`; behind `authGuard` the `AppShell` layout (`common/components/app-shell`: `AppHeader` + outlet, provides `CurrentUserService` so every login loads the user afresh) with `main` (profile), `documents` (CV list), `documents/:id` (CV detail, `:id` bound to an `input()` via `withComponentInputBinding`); anything else redirects to `login`.
- **HTTP:** one interceptor (`common/interceptors/http.interceptor.ts`) adds `Authorization: Bearer <token>` (token in localStorage via `SessionService`) and turns 401/403/404/500 into a snackbar (`HttpFeedbackService` + `FeedbackSnackbar`), then rethrows.
- **API:** one `*-api.service.ts` per domain in `common/services/`. Endpoints: `/auth/login`, `/auth/register`, `/users`, `/users/reset`, `/users/skill`, `/users/experience`, `/documents` (GET the CV list newest first, each with its `process`; POST multipart, repeated `files` field, 202 → one `Process` per CV, 400 `{ msg, files? }` when no file or a non-PDF), `/documents/summary` (sum of the `COMPLETED` CVs, items with `document_ids`), `/documents/:id` (GET; DELETE also while the analysis is pending), `/documents/download/:id` (blob, needs the auth header).
- **Profile** (`pages/main/`): the user from `CurrentUserService`; without documents it shows `DocumentUpload`. Otherwise `CvSummary` (`GET /documents/summary`: language/framework chips with their number of CVs, experiences timeline, each item opens its source CVs) plus `Skills` and `Experiences` added by hand (edited in native `<dialog>`s).
- **CVs** (`pages/documents/`): `DocumentUpload` (`common/components`, several PDFs at once) leads to the CV list, which polls `GET /documents` every 2.5 s (`pollWhile` in `utils/polling.ts`) while a CV is `PENDING`/`IN_PROGRESS`; the detail shows the extraction (`process.result`: name, languages, frameworks, experiences), the BE error, the download and the delete (confirmed in `ConfirmDialog`, also from the list). The header menu (native `popover`) resets the user (back to the profile upload) or logs out.

## General Principles

- **SUPER CONSTRAINT — functional changes need explicit approval:** a bug fix (code not doing what was intended) can go ahead. A change to what the product does is different: who sees or can do what, flows, defaults. Never make one on your own initiative, not even as a side effect of a refactor, a review fix or a "consistency" cleanup.
  - Before editing, classify each change as a fix or a functional change. When unsure, treat it as functional.
  - For a functional change, stop and ask first. Name the screen, the current behavior, the new behavior and who is affected. Edit only after an explicit yes. Approval covers that one change only.
  - Never bundle an unapproved functional change into a fix, refactor or review commit.
  - In the done-report, list every functional change separately and explicitly, approved ones included.
- Always prefer a declarative approach over an imperative one when both achieve the same result — e.g. content projection (`ng-content`) instead of passing markup as string inputs, native control flow instead of manual branching, template bindings instead of imperative DOM/attribute manipulation.
- **SUPER CONSTRAINT — CSS + HTML first, JS last:** any visual/layout behavior (responsive states, collapsing, showing/hiding, sizing, theming) MUST be solved with CSS + HTML alone (container queries, `:has()`, attribute/state selectors, custom properties, native elements like `<details>`/`<dialog>`/`popover`). Reach for TS only when CSS + HTML genuinely cannot express it, and then keep it minimal: JS sets a state (an attribute, a custom property) and CSS does the rest.
- Before writing any new function, component, service, or utility, first check (with search tools, not memory) whether equivalent functionality already exists. If it exists, use it as-is when it fits; if it needs changes to fit, ask whether to extend it or write a new one.
- Success is measured by the least code written that still solves the problem, balanced with KISS.
- **SUPER CONSTRAINT — no deprecated APIs:** never use an API marked `@deprecated` (DOM, Angular, RxJS or any library), not even as a temporary fallback.
- **SUPER CONSTRAINT — `TODO BE` markers:** when FE code ships a workaround or incomplete behavior because it waits for a BE change, mark the spot with `// TODO BE: <what is missing> — <what to do on the FE once the BE ships it>` (cite the ticket when there is one). Never use a plain `TODO` for a BE dependency.

## TypeScript Best Practices

- Use strict type checking. Prefer type inference when the type is obvious.
- Avoid `any`; use `unknown` when the type is uncertain.
- Do NOT use the `private` keyword. Use native `#` private fields (`#foo`, not `private foo`).
- Prefer readonly data structures when values should not be reassigned.
- Keep functions small, pure, and explicitly typed when inference is not clear.
- Prefer early returns (guard clauses) over nested conditionals.
- Import through the path aliases (`@common/*`, `@environments/*`, `@interfaces/*`, `@pages/*`, `@utils/*`), not long relative paths. `eslint-plugin-boundaries` enforces the dependencies between `pages`, `common`, `interfaces` and `utils`.
- **SUPER CONSTRAINT — no lint/type suppressions without explicit approval:** never write `eslint-disable`, `stylelint-disable`, `@ts-ignore`, `@ts-expect-error` or `prettier-ignore` on your own. First look for a fix that satisfies the rule. If none exists, stop and ask, naming the rule, the file:line and why the code cannot comply.

## Angular Best Practices

- Before using or writing an Angular API, query the `angular-cli` MCP (`search_documentation` / `find_examples`) when available, aligned with the project's Angular version.
- Standalone components only; do NOT set `standalone: true` (it is the default).
- Use signals for local state and `computed()` for derived state. Use `set`/`update`, never `mutate`.
- Do NOT use `toSignal` for data fetched from a service/HTTP call. Use `rxResource` (`@angular/core/rxjs-interop`) and read `.value()` in a `computed()`.
- Lazy-load every route (`loadComponent`). Use `@defer` for heavy, non-critical UI.
- Do NOT use `@HostBinding` / `@HostListener`. Use the `host` object of the decorator.
- Use `inject()`, never constructor injection.
- Use `NgOptimizedImage` for static images (not for inline base64 ones).

## Accessibility Requirements

- All UI must pass AXE checks and meet WCAG 2.2 AA: keyboard accessibility, visible focus states, sufficient contrast, semantic structure, accessible names, ARIA only when native semantics are not enough.
- Handle focus explicitly for dialogs, popovers, menus, and dynamically rendered UI.
- **Contrast:** on every UI change, measure the computed colors in the browser and compute the WCAG ratio for every new or changed element in every state (default, hover, focus, error, disabled). Text ≥ 4.5:1 (≥ 3:1 for large text); state indicators and surface edges ≥ 3:1 against the adjacent color. Never eyeball a screenshot. Report pre-existing failures outside the task instead of changing them unasked.

## Components

- Keep components small, focused, and single-responsibility.
- Use `input()`, `output()` and, for two-way bound properties, `model()`. Never pair an `input()` `foo` with an `output()` `fooChange`. An input the component edits locally is copied into a `linkedSignal`.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush`: it is already the project default.
- No `.component` suffix: `login.ts` / `login.html` / `login.scss`, class `Login`, selector `app-login`.
- External templates and styles, with paths relative to the component file; inline only for very small components.
- Do NOT use `ngClass` / `ngStyle`; use `class` / `style` bindings.
- Use native `<dialog>` (`showModal()`) for modals and the `popover` attribute for menus.

## Templates

- Keep templates simple and free of business logic; prefer precomputed state (`computed()`).
- Native control flow (`@if`, `@for`, `@switch`, `@let`), with a stable `track` on every `@for`.
- No arrow functions, no globals like `new Date()`, no `$any` in templates. Pass `$event` to a typed method and cast inside it.
- No hardcoded copy: every user-facing string goes through the `translate` pipe (or `TranslateService.instant` in TS).

## Forms (MANDATORY)

- ALWAYS use Signal Forms (`form()`, `FormField`, `FormRoot`, validators from `@angular/forms/signals`).
- NEVER use Reactive Forms (`FormGroup`, `FormControl`, `FormBuilder`, `ReactiveFormsModule`) or template-driven forms (`ngModel`).
- Bind native `<input>`/`<select>`/`<textarea>` with `[formField]`; do not hand-wire `(input)`/`(change)` for value sync.

## Services

- One responsibility per service; prefer stateless services. Data access only, no UI concerns.
- Every HTTP call goes through a `*-api.service.ts` in `common/services/`, never `HttpClient` in a component.

## Code Organization

- `src/app/interfaces/<domain>.interface.ts`: shared interfaces/types, one file per domain. A type used by a single component stays in that component's file, without `export`.
- `src/app/common/{interceptors,guards,services,components}`: app-wide building blocks.
- `src/app/pages/<page>/`: one folder per routed page; its child components live in subfolders of the page.
- `src/app/utils/`: only functions actually shared by more than one component/service. A function used by one component is a `#private` method of that component.
- `src/app/styles/`: `functions.scss`, `variables.scss`, `mixins/` (one partial per area, re-exported by `_index.scss`).
- Route paths and `router.navigate()` segments are always in English.

## Styling

- Do NOT use CSS classes, BEM or any class-based naming. Style through semantic element selectors, `:host` and `data-role` attribute selectors.
- Use container queries (`container-type: inline-size` + `@container`) for a component's own layout, never viewport media queries.
- Colors only from the palette tokens via `fn.get-color('<appearance>', <variant>)` (defined in `src/styles.scss`). Never hex colors; a missing color is an `oklch()` token. Mixes go through `fn.color-mix-func()` (oklch), mixing toward the `white`/`black` keywords, never an achromatic `oklch(… 0 0deg)` literal.
- **SUPER CONSTRAINT — `fn.calc-unit()` only:** every length is written with `fn.calc-unit()` (`$base-unit` = `0.5rem` = 8px, so `fn.calc-unit(n)` = n × 8px). `px`, `rem`, `pt` are forbidden (stylelint `plugin/value-no-px`). Exceptions: a literal `1px` hairline; `em` for `letter-spacing` or sizes that follow the element's font-size; `%`, `fr`, viewport units for fluid layout; the single `0.5rem` defining `$base-unit`.
- Import helpers with `@use 'functions' as fn;` and `@use 'mixins' as mix;` (resolved through `includePaths`), never a relative path.
- **SUPER CONSTRAINT — never pass a default argument** to a SCSS function or mixin: `fn.calc-unit()`, not `fn.calc-unit(1)`; `fn.get-color('primary')`, not `fn.get-color('primary', 500)`. Switch to keyword arguments when a defaulted parameter comes before one you pass.
- Wrap SassScript in custom properties with interpolation: `--foo: #{fn.calc-unit(2)};`.
- Always use logical properties (`padding-inline-start`, `margin-block-end`, `inset-inline-start`, `text-align: start`), never physical ones (enforced by stylelint).
- **SUPER CONSTRAINT — style deduplication:** a declaration block (or a near-identical variant) that appears in 2+ component files MUST become a parameterized `@mixin` in the matching `mixins/` partial and be `@include`d everywhere. Duplication inside one file becomes a local `%placeholder` + `@extend`. Rules in the same file sharing identical declarations are grouped into one selector list.
- **SUPER CONSTRAINT — no rough UI:** every new element must look finished on the first try: match the closest existing sibling control (height, radius, font, padding, icon size and gap) and reuse its mixins.
- **SUPER CONSTRAINT — no double scroll:** a dialog or panel has exactly one scroll container at a time.

## State Management

- Keep state minimal, normalized and predictable; do not duplicate derived state.
- Do NOT use `effect()` to set another signal: use `computed()`, or `linkedSignal()` when the derived value must stay writable. Reserve `effect()` for syncing to non-signal externals (DOM, `Router`, `localStorage`).

## Formatting (MANDATORY)

- After every edit, run Prettier on ONLY the modified files: `npx prettier --write <file1> <file2> ...`. Never format the whole project.

## Testing (MANDATORY)

- Unit tests: Vitest (`@angular/build:unit-test`, jsdom), not Jasmine/Karma. Mock with `vi.fn()`/`vi.spyOn()`.
- ALWAYS write unit tests for every new component, service, guard, interceptor or function, and update existing tests when changing the behavior they cover.
- Playwright suites in `tests/e2e/` mock the API with `page.route` (helpers in `tests/e2e/support/mock-api.ts`) and assert the Italian copy (`locale: 'it-IT'`). Keep them updated whenever a change touches a flow, locator or API shape they cover.
- Run `npx ng test --watch=false` (and `pnpm test:e2e` for flow changes) before reporting a task done.
- After changing behavior, run the affected suites BEFORE editing any test: a failure inside the changed area means updating that test; a failure elsewhere is a regression to fix in the code.

## Lint (MANDATORY)

- `.githooks/pre-push` (installed by `scripts/prepare.mjs`) blocks the push if a changed `.ts`/`.html`/`.scss`/`.css` file fails `prettier --check`, `eslint` or `stylelint`. Run the same checks on every touched file before reporting done:
  - `npx prettier --check <files>`
  - `npx eslint <files.ts,.html>`
  - `npx stylelint <files.scss,.css>`

## i18n (MANDATORY)

- Copy lives in `public/i18n/it.json` and `public/i18n/en.json`. A key added/changed/removed in one file is changed in the other too, translated. Never leave them out of sync.
- Do not translate common anglicisms already used as-is (`login`, `logout`, `skill`, `reset`).

## Plans (`plan/`) (MANDATORY)

- `plan/` (repo root) holds plans of still-open work. A plan is one Markdown file (or a folder with a `README.md`) holding its steps in execution order with their status.
- Before the first edit, classify the work: **complete task** (the issue says it all: no plan), **short analysis** (decided in the conversation, done in the same session: ask whether to save the plan or proceed), **large task** (several steps, areas or sessions: strongly recommend writing the plan first). Raise the recommendation when a short task grows into a large one.
- Mark steps done (`- [x]`) as soon as they are completed.
- Name: `<JIRA-KEY>-<area>-<topic>` or `<area>-<topic>`, English kebab-case.
- Header:

  ```md
  > **Stato:** Aperto · **Owner:** <git user.name> · **Data:** YYYY-MM-DD · **Jira:** —
  >
  > **Blocco:** <what it waits for, if anything>
  ```

- When the task is done, DELETE its plan in the same change.
- Before executing or changing a plan whose `Owner` is not the current `git config user.name` (or has none), ask for explicit confirmation.

## Git Commit Guidelines

- NEVER run `git commit` or `git push` yourself, not even when asked to. Prepare the working tree and, if requested, draft the message; the user runs the commit.
- Exactly ONE commit per task, summarizing it as one unit (no lists of sub-changes).
- Format and scopes: see `commit-message.md` — `<type>(<scope>): <gitmoji> <short description>`, a scope from `.vscode/settings.json` (`conventionalCommits.scopes`), header ≤ 100 characters.
- When asked for a commit message, output ONLY the message: one line, no quotes, no explanations, no alternatives.
