# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Angular 22 CLI app (`@angular/build` application builder, Vitest + jsdom for tests). Client-only, no SSR.

```bash
npm start                 # ng serve → http://localhost:4200
npm run build             # production build → dist/documents-angular
npm run watch             # dev build in watch mode
npm test                  # ng test (Vitest, watch mode)
npx ng test --watch=false --include src/app/app.component.spec.ts   # single spec, one run
```

No linter is configured. TypeScript is pinned to 6.0 because Angular 22 requires `>=6.0 <6.1` (TS 7 is not supported yet).

## Architecture

Frontend for a backend API (Flask-style, default `http://127.0.0.1:5000`) where a user logs in, uploads a CV/document, and then views/edits the profile extracted from it (skills, experiences).

- **Bootstrap**: everything is wired in `src/main.ts` (standalone components, `bootstrapApplication`). **Zoneless** (no zone.js): a field assigned inside an HTTP callback, an `await`, or a timer does NOT re-render. Async-updated state must be a `signal` (inputs that the component later modifies use `input()` + `linkedSignal`). Fields changed only in DOM event handlers can stay plain. `src/app/app.config.ts` and `src/model/model.ts` are empty leftovers — the real model file is `src/app/model/model.ts`. Templates use `@if`/`@for` block control flow.
- **Config**: `src/app/environment.ts` holds `apiBaseUrl` and `tokenKey` (localStorage key for the JWT). No Angular `environments/` file replacements.
- **HTTP interceptors** (registered in `main.ts`):
  - `token.interceptor.ts` — adds `Authorization: Bearer <token>` from localStorage; if no token, navigates to `/login` (but still sends the request).
  - `error.interceptor.ts` — maps 401/403/404/500 to Italian toast messages via `NotificationService` (`@ngxpert/hot-toast`, configured in `main.ts`), then rethrows.
- **Routes** (`app.routes.ts`): `login`, `registration`, `main`; everything else redirects to `login`. No route guards.
- **Main flow** (`main/`): on load fetches `GET /users`; if the user has no documents it shows `DocumentUploadComponent`, otherwise `UserComponent`. Upload completion emits an event that switches view and refetches the user; the header's reset event switches back to upload.
- **Feature folders** each pair a component with a `providedIn: 'root'` service that calls the API. Endpoints: `/auth/login`, `/auth/register`, `/users`, `/users/reset`, `/users/skill`, `/users/experience`, `/documents` (multipart upload: title, metadata, file), `/process/:id`.
- **State**: services keep a `signal` cache (e.g. `SkillService.skillsSignal`, `UserService.userSignal`) and re-fetch after mutations via `tap(() => this.getX().subscribe())`. Skill/experience editing uses popup components (`*-popup.component.ts`).

UI text and code comments are in Italian.
