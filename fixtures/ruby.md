# Ruby Fixtures

**Language**: ruby
**Version**: 3.3.0

## Tools

| Tool | Version |
|------|----------|
| rspec | 3.12+ |

## Generated Artifacts

| File | Type | Format | Description |
|------|------|--------|----------|
| `rspec-results.json` | `rspec-json` | json | RSpec JSON: 6 pass, 2 fail, 1 skip |
| `rspec-report.html` | `rspec-html` | html | RSpec HTML report with test details |

## Generation Commands

```bash
docker-compose up --build
```

## Cleanup Commands

```bash
docker-compose down -v && rm -rf ../../generated/ruby
```
