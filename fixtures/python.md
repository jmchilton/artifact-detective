# Python Fixtures

**Language**: python
**Version**: 3.11.7

## Tools

| Tool | Version |
|------|----------|
| pytest | 7.4.3 |
| pytest-html | 4.1.1 |
| ruff | 0.1.9 |
| mypy | 1.14.1 |
| isort | 5.13.2 |
| black | 23.12.1 |

## Generated Artifacts

| File | Type | Format | Description |
|------|------|--------|----------|
| `pytest-results.json` | `pytest-json` | json | Pytest JSON: 5 pass, 2 fail, 1 skip |
| `pytest-report.html` | `pytest-html` | html | Pytest HTML report with test details |
| `ruff-output.txt` | `ruff-txt` | txt | Ruff linter output with violations |
| `mypy-output.txt` | `mypy-txt` | txt | Mypy type checker errors |
| `mypy-results.json` | `mypy-ndjson` | json | Mypy NDJSON: type checking errors in newline-delimited JSON format |
| `isort-output.txt` | `isort-txt` | txt | Isort import sorting report with unsorted imports |
| `black-output.txt` | `black-txt` | txt | Black code formatter diff output with formatting violations |

## Generation Commands

```bash
docker-compose up --build
```

## Cleanup Commands

```bash
docker-compose down -v && rm -rf ../../generated/python
```
