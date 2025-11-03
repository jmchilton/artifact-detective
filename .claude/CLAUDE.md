# artifact-detective - Claude Instructions

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with semantic-release for automated versioning and releases.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types (0.x.y versioning)

- **feat**: New feature (triggers 0.minor.0 bump)
- **fix**: Bug fix (triggers 0.x.patch bump)
- **perf**: Performance improvement (triggers 0.x.patch bump)
- **docs**: Documentation only (no release)
- **style**: Code style changes (no release)
- **refactor**: Code refactoring (no release)
- **test**: Adding/updating tests (no release)
- **chore**: Build/tooling changes (no release)

### Breaking Changes (0.x versioning)

In 0.x releases, breaking changes trigger minor bump (0.minor.0):
```
feat!: change API signature → 0.2.0
BREAKING CHANGE: API redesign → 0.2.0
```

Once ready for stable 1.0.0, update .releaserc.json release rules.

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

Automated via semantic-release (0.x versioning):
1. Push conventional commits to main
2. CI runs tests/lint
3. semantic-release analyzes commits
4. Version bumped (feat→0.minor.0, fix→0.x.patch)
5. CHANGELOG updated automatically
6. Published to npm automatically
7. GitHub release created

No manual `npm version` or `npm publish` needed.

First release will be 0.1.0, subsequent features bump minor (0.2.0, 0.3.0, etc).
