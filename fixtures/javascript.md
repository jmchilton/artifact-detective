# Javascript Fixtures

**Language**: javascript
## Tools

| Tool | Version |
|------|----------|
| jest | 29.7.0 |
| jest-html-reporter | 3.10.2 |
| @playwright/test | 1.40.0 |
| eslint | 8.56.0 |
| typescript | 5.3.3 |

## Generated Artifacts

| File | Type | Format | Description |
|------|------|--------|----------|
| `jest-results.json` | `jest-json` | json | Jest JSON reporter: 5 pass, 2 fail, 1 skip |
| `jest-report.html` | `jest-html` | html | Jest HTML reporter: test summary with details |
| `playwright-results.json` | `playwright-json` | json | Playwright JSON: 3 pass, 1 fail |
| `eslint-output.txt` | `eslint-txt` | txt | ESLint output with violations |
| `eslint-results.json` | `eslint-json` | json | ESLint JSON: reports linting violations |
| `tsc-output.txt` | `tsc-txt` | txt | TypeScript compiler errors |

## Generation Commands

```bash
docker-compose up --build
```

## Cleanup Commands

```bash
docker-compose down -v && rm -rf ../../generated/javascript
```
