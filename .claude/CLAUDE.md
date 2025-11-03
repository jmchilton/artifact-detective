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
- **docs**: Documentation only
- **style**: Code style changes (formatting, no code change)
- **refactor**: Code refactoring (no feature/fix)
- **perf**: Performance improvement
- **test**: Adding/updating tests
- **chore**: Build/tooling changes

### Breaking Changes

Add `!` after type or `BREAKING CHANGE:` in footer for major version bump:
```
feat!: change API signature
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
4. Version bumped, CHANGELOG updated
5. Published to npm automatically
6. GitHub release created

No manual `npm version` or `npm publish` needed.
