# Commit Message Guidelines

## Format

```
type(scope): :gitmoji: short description
```

> The whole header MUST NOT exceed **100 characters**.

## Rules

- Use [Conventional Commits](https://www.conventionalcommits.org/).
- A [Gitmoji](https://gitmoji.dev/) shortcode is MANDATORY, right after the scope's closing parenthesis.
- ONLY use a scope listed in `.vscode/settings.json` under `conventionalCommits.scopes`; pick the closest one.
- One commit per task, summarizing the whole change as one unit: no lists of sub-changes.

## Examples

| Status | Example                                                  |
| ------ | -------------------------------------------------------- |
| ✅     | `feat(profile): :sparkles: sort experiences by end date` |
| ✅     | `fix(documents): :bug: upload the dropped file`          |
| ❌     | `feat(profile): add sorting` — no gitmoji                |
