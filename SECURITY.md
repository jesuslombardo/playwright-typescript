# Security Policy

This repository is a Playwright + TypeScript test-automation framework used as a
learning and portfolio project. It has no production users of its own, but it is
wired with the same supply-chain controls a real project would use.

## Supported versions

Only the `main` branch is maintained. Fixes are not back-ported to tags.

## Automated controls in this repo

| Control                | Where                                              |
| ---------------------- | -------------------------------------------------- |
| Dependency updates     | Dependabot (`.github/dependabot.yml`)              |
| Static analysis (SAST) | CodeQL (`.github/workflows/codeql.yml`)            |
| Secret scanning        | Gitleaks (`.github/workflows/security.yml`)        |
| Dependency audit       | `npm audit` job (`.github/workflows/security.yml`) |

## Reporting a vulnerability

If you find a security issue, **please do not open a public issue**. Instead,
report it privately through GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
on this repository, or email the maintainer.

Please include:

- A description of the issue and the impact you expect.
- Steps to reproduce (a minimal proof of concept if possible).
- Any suggested remediation.

You can expect an initial acknowledgement within a few days.

## Secrets

Secrets (for example `JWT_SECRET`, `GEMINI_API_KEY`) are **never committed**.
They live in a git-ignored `.env` locally and in GitHub Actions Secrets in CI.
The committed `.env.example` is the template. If you believe a secret was
committed by mistake, rotate it immediately and report it as above.
