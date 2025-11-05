# Rust Fixtures

**Language**: rust
**Version**: 1.75.0

## Tools

| Tool | Version |
|------|----------|
| cargo | 1.75.0 |
| clippy | 0.1.75 |
| rustfmt | 1.7.0 |

## Generated Artifacts

| File | Type | Format | Description |
|------|------|--------|----------|
| `cargo-test-output.txt` | `cargo-test-txt` | txt | Cargo test text output: 4 pass, 1 panic, 1 ignored |
| `clippy-output.json` | `clippy-ndjson` | json | Clippy NDJSON output with 5+ warnings |
| `clippy-output.txt` | `clippy-txt` | txt | Clippy text output with warnings |
| `rustfmt-output.txt` | `rustfmt-txt` | txt | Rustfmt check output |

## Generation Commands

```bash
docker compose up --build
```

## Cleanup Commands

```bash
docker compose down -v && rm -rf ../../generated/rust
```
