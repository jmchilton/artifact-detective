# artifact-detective - Claude Instructions

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with semantic-release for automated versioning and releases.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature (triggers minor version bump)
- **fix**: Bug fix (triggers patch version bump)
- **perf**: Performance improvement (triggers patch version bump)
- **docs**: Documentation only (no release)
- **style**: Code style changes (no release)
- **refactor**: Code refactoring (no release)
- **test**: Adding/updating tests (no release)
- **chore**: Build/tooling changes (no release)

### Breaking Changes

Add `!` after type or `BREAKING CHANGE:` in footer for major version bump:

```
feat!: change API signature → major bump
BREAKING CHANGE: API redesign → major bump
```

### Examples

```
feat: add support for vitest JSON reports

fix: handle missing duration field in pytest reports

docs: update installation instructions

chore: upgrade cheerio to v1.1.2
```

### Important Notes

- ALWAYS use conventional commit format when creating commits
- First line <= 72 chars, imperative mood
- Breaking changes require `!` or `BREAKING CHANGE:` footer
- Commits trigger automatic releases on push to main
- semantic-release manages version numbers automatically
- CHANGELOG.md auto-generated from commits

## Project Standards

- Node.js >= 20.0.0
- TypeScript with strict mode
- Full test coverage expected
- ESLint + Prettier for code quality
- All PRs must pass CI (lint + tests)

## Release Process

Automated via semantic-release:

1. Push conventional commits to main
2. CI runs tests/lint
3. semantic-release analyzes commits
4. Version bumped (feat→minor, fix→patch, breaking→major)
5. CHANGELOG updated automatically
6. Published to npm automatically
7. GitHub release created

No manual `npm version` or `npm publish` needed.
