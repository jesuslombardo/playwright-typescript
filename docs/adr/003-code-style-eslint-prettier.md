# ADR-003: Code style with ESLint and Prettier

## Status

Accepted

## Context

A professional test framework needs consistent code style and automated quality checks.
Without tooling, formatting debates slow reviews and inconsistent style creeps into the codebase.

## Decision

Adopt ESLint + Prettier with three enforcement layers:

1. **Editor (on save):** `.vscode/settings.json` — format with Prettier, auto-fix ESLint
2. **npm scripts:** `lint`, `lint:fix`, `format`, `format:check`
3. **CI (future):** `lint` and `format:check` in GitHub Actions pipeline

Prettier configuration:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

ESLint uses flat config (`eslint.config.mjs`) with `typescript-eslint` and `eslint-config-prettier` to avoid rule conflicts.

## Consequences

### Positive

- Consistent style without manual effort
- Immediate feedback in the editor
- CI-ready scripts for pipeline integration
- No-semicolon style aligns with modern TypeScript and Playwright examples

### Negative

- Contributors need ESLint and Prettier extensions in their editor for the best experience (mitigated by `.vscode/extensions.json` recommendations)
- `semi: false` is a stylistic choice — some teams prefer semicolons (documented here for clarity)

## Alternatives considered

| Alternative                           | Why not chosen                                                         |
| ------------------------------------- | ---------------------------------------------------------------------- |
| ESLint only (no Prettier)             | Formatting rules in ESLint are slower and more contentious             |
| `semi: true`                          | Valid choice; team preferred no-semicolon style for readability        |
| Editor settings only (no npm scripts) | CI cannot enforce; whole-project validation missing                    |
| StandardJS                            | Less flexible; Prettier + ESLint is more common in TypeScript projects |
