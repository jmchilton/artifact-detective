# Java Fixtures

**Language**: java
**Version**: 21

## Tools

| Tool | Version |
|------|----------|
| maven | 3.9.6 |
| junit | 4.13.2 |
| checkstyle | 10.12.5 |
| maven-checkstyle-plugin | 3.4.0 |
| maven-surefire-report-plugin | 3.0.0 |
| spotbugs | 4.7.3 |

## Generated Artifacts

| File | Type | Format | Description |
|------|------|--------|----------|
| `TEST-com.example.CalculatorTest.xml` | `junit-xml` | xml | JUnit test results: 6 passed, 1 failed, 1 skipped |
| `surefire-report.html` | `surefire-html` | html | Maven surefire aggregated test report in HTML format |
| `checkstyle-result.xml` | `checkstyle-xml` | xml | Checkstyle XML report with linting violations |
| `checkstyle-result.sarif` | `checkstyle-sarif-json` | json | Checkstyle SARIF JSON report with linting violations in standardized format |
| `spotbugs-report.txt` | `spotbugs-txt` | txt | SpotBugs analysis (potential null pointer, division by zero) |

## Generation Commands

```bash
docker-compose up --build --abort-on-container-exit
```

## Cleanup Commands

```bash
docker-compose down -v && rm -rf ../../generated/java
```
