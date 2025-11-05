# Go Fixtures

**Language**: go
**Version**: 1.23.0

## Tools

| Tool | Version |
|------|----------|
| go | 1.23.0 |
| golangci-lint | 1.59.1 |
| gofmt | 1.23.0 |

## Generated Artifacts

| File | Type | Format | Description |
|------|------|--------|----------|
| `go-test.json` | `go-test-ndjson` | json | Go test output with 8 total tests (7 passed, 1 skipped) in NDJSON format |
| `golangci-lint.json` | `golangci-lint-json` | json | golangci-lint linting report with style and logic violations |
| `gofmt-output.txt` | `gofmt-txt` | txt | gofmt formatting differences (unified diff format) |

## Generation Commands

```bash
docker-compose up --build --abort-on-container-exit
```

## Cleanup Commands

```bash
docker-compose down -v && rm -rf ../../generated/go
```
