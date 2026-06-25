# Changelog

## [1.2.0](https://github.com/jesuslombardo/playwright-typescript/compare/v1.1.0...v1.2.0) (2026-06-25)


### Features

* add shared HeaderComponent (topbar) and pin SUT to v2.0.1 ([#48](https://github.com/jesuslombardo/playwright-typescript/issues/48)) ([71a6834](https://github.com/jesuslombardo/playwright-typescript/commit/71a6834412adac3b7d887d8a16cb91b6e7c01a55))
* **ai:** expose token usage from the Gemini client ([bd154f4](https://github.com/jesuslombardo/playwright-typescript/commit/bd154f46db7102a1f802a77a5dc087f344021243))

## [1.1.0](https://github.com/jesuslombardo/playwright-typescript/compare/v1.0.0...v1.1.0) (2026-06-24)


### Features

* accessibility testing with axe-core (Step 48, ADR-021) ([#37](https://github.com/jesuslombardo/playwright-typescript/issues/37)) ([f3fbfc8](https://github.com/jesuslombardo/playwright-typescript/commit/f3fbfc8f497f4ea314a043bda359a75a779b44c0))
* add Husky + lint-staged pre-commit hook ([94f2be3](https://github.com/jesuslombardo/playwright-typescript/commit/94f2be3a831bfcdd8dc2c22f1c828b7ca15e32c1))
* add Node version matrix to api job (compatibility) ([#14](https://github.com/jesuslombardo/playwright-typescript/issues/14)) ([ad0baf4](https://github.com/jesuslombardo/playwright-typescript/commit/ad0baf4994b6e92a47bb85ab8828f0de88531295))
* add one visual regression test (login page) ([#16](https://github.com/jesuslombardo/playwright-typescript/issues/16)) ([3f99e6c](https://github.com/jesuslombardo/playwright-typescript/commit/3f99e6c561ee3184c1d19da811fea9966ef42f34))
* add Sauce Demo automation foundation (Phase 2) ([b1d8153](https://github.com/jesuslombardo/playwright-typescript/commit/b1d81536a6722d96aa33a1e7313b80e181915ef7))
* AI-assisted testing — LLM-as-judge & self-healing locators (ADR-019) ([#31](https://github.com/jesuslombardo/playwright-typescript/issues/31)) ([fb7b318](https://github.com/jesuslombardo/playwright-typescript/commit/fb7b31879ec95722e0b99c79d5bd8495671da006))
* API tests + testing pyramid against own demo-shop-app ([8208319](https://github.com/jesuslombardo/playwright-typescript/commit/8208319c9d5b9862421c68d595b24c5713c991cd))
* API tests + testing pyramid against own demo-shop-app ([4251a04](https://github.com/jesuslombardo/playwright-typescript/commit/4251a04bb6bbab1bc0b792ad14c77286d2b90b84))
* complete Phase 2 with cart, checkout and test conventions ([da321c6](https://github.com/jesuslombardo/playwright-typescript/commit/da321c6ce73dc201b1fa339abd06b1ebdd94b21a))
* consumer-driven contract testing with Pact (auth-service) ([#28](https://github.com/jesuslombardo/playwright-typescript/issues/28)) ([e16f501](https://github.com/jesuslombardo/playwright-typescript/commit/e16f5010255e31001fc224dd207214e09d917978))
* cross-repo version pinning — test against a fixed app tag ([#18](https://github.com/jesuslombardo/playwright-typescript/issues/18)) ([50f429b](https://github.com/jesuslombardo/playwright-typescript/commit/50f429b02bb271183a616f8a2636813afda4d078))
* data-driven login matrix from an external CSV file (Step 38) ([#22](https://github.com/jesuslombardo/playwright-typescript/issues/22)) ([22b4102](https://github.com/jesuslombardo/playwright-typescript/commit/22b410256e8a4d663a582d681a15a1d914dc07b7))
* inject JWT_SECRET from GitHub Secrets into the SUT (secrets pattern demo) ([697c757](https://github.com/jesuslombardo/playwright-typescript/commit/697c757a8051ebaf30e2bff653beb2e324905de1))
* JSON data-driven PUT/update matrix (Step 40) ([#24](https://github.com/jesuslombardo/playwright-typescript/issues/24)) ([f3c1577](https://github.com/jesuslombardo/playwright-typescript/commit/f3c15772f66d622b3a89bc27a3840257ab623d59))
* JWT_SECRET via GitHub Secrets (secrets pattern, end-to-end) ([26a062a](https://github.com/jesuslombardo/playwright-typescript/commit/26a062a47fe20c3b680283c6d05069d9b17950c7))
* local secrets via .env + .env.example (dotenv) ([10b5d42](https://github.com/jesuslombardo/playwright-typescript/commit/10b5d4216a24de4d504f82eaca95f2a22d2876f8))
* mobile — add Pixel 7 (Android/Chromium) device (Step 41) ([#25](https://github.com/jesuslombardo/playwright-typescript/issues/25)) ([9f9a7fd](https://github.com/jesuslombardo/playwright-typescript/commit/9f9a7fdcc562464dba4de8208d87360972dabf06))
* mobile mini-suite — iPhone 13/WebKit device emulation (Step 39, ADR-015) ([#23](https://github.com/jesuslombardo/playwright-typescript/issues/23)) ([2e3ae1c](https://github.com/jesuslombardo/playwright-typescript/commit/2e3ae1cb1eeb08db191d4703f41061b937fed146))
* nightly cross-browser regression + execution cadence (ADR-007) ([cf64748](https://github.com/jesuslombardo/playwright-typescript/commit/cf64748eda4c29fe2b18e779a3a0ebda3b9f9103))
* nightly cross-browser regression + execution-cadence policy (ADR-007) ([e1596e0](https://github.com/jesuslombardo/playwright-typescript/commit/e1596e0127081db9f60cb1d286fa216e4e9e9ebf))
* OOP patterns & principles study layer (ADR-018) ([#29](https://github.com/jesuslombardo/playwright-typescript/issues/29)) ([ee275bc](https://github.com/jesuslombardo/playwright-typescript/commit/ee275bcd010575b96d0d253a9394c444ce59beb0))
* release automation — Conventional Commits + release-please (Step 49, ADR-022) ([#38](https://github.com/jesuslombardo/playwright-typescript/issues/38)) ([da8dffd](https://github.com/jesuslombardo/playwright-typescript/commit/da8dffd214e421c0a7af2ad4692643391ed022e4))
* schema-based contract tests (OpenAPI + Ajv) ([43e2f13](https://github.com/jesuslombardo/playwright-typescript/commit/43e2f1321cc89dd4ef906035fe1e5fa4835801b6))
* schema-based contract tests against the OpenAPI spec (Ajv) ([f5d64e6](https://github.com/jesuslombardo/playwright-typescript/commit/f5d64e6ba748dbfa4fa82f1d620fc64510b33c9e))
* supply-chain security — Dependabot, CodeQL, gitleaks, npm audit (Step 47, ADR-020) ([#34](https://github.com/jesuslombardo/playwright-typescript/issues/34)) ([510726b](https://github.com/jesuslombardo/playwright-typescript/commit/510726bd4fe3eb4ca8ca5ebf5f3708159a9b222a))
* tag smoke tests, split CI into smoke + regression jobs ([0679f08](https://github.com/jesuslombardo/playwright-typescript/commit/0679f080dd960337449d3c99d28ebf5b8c01ef6a))
* tag smoke tests, split CI into smoke + regression jobs ([64c5f86](https://github.com/jesuslombardo/playwright-typescript/commit/64c5f8614a0bbba4d5903cc86fd0b60f28c7ea72))
* test data layer — factories, datasets, lifecycle (ADR-014) ([#19](https://github.com/jesuslombardo/playwright-typescript/issues/19)) ([63e8532](https://github.com/jesuslombardo/playwright-typescript/commit/63e853289b858bd0f87e4569ed1c9bdb35e3fba2))
* TypeScript practice layer — authz matrix + response-shape guard (Step 44) ([#30](https://github.com/jesuslombardo/playwright-typescript/issues/30)) ([c36adba](https://github.com/jesuslombardo/playwright-typescript/commit/c36adba7e86d524fe29aa83f3daa111a23eeafce))
