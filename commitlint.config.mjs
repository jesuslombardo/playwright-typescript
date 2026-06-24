/**
 * Conventional Commits linting.
 * Subjects in this repo carry "(Step N, ADR-XXX)" suffixes, and bodies/footers
 * include URLs + the Co-Authored-By trailer, so the line-length caps are relaxed
 * while the meaningful rules (type + subject) stay enforced.
 *
 * @type {import('@commitlint/types').UserConfig}
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
}
