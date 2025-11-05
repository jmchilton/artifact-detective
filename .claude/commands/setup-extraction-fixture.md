# Setup Extraction Fixture

Create and configure test fixtures for artifact log extraction. This command takes a CI log file, extracts content using the appropriate artifact extractor, previews the results, generates include/exclude patterns, gets your approval, and updates the test manifest.

**Usage:**

```
/setup-extraction-fixture <artifact-type> <path-to-log-file> [description]
```

**Examples:**

```
/setup-extraction-fixture eslint-txt ./ci-logs/eslint-output.txt
/setup-extraction-fixture mypy-txt /tmp/mypy-check.log "Type checking output from mypy"
/setup-extraction-fixture go-test-ndjson results.log "Go test results in NDJSON format"
```

**Workflow:**

1. **Validate inputs**
   - Checks artifact type is valid (from ArtifactType union)
   - Verifies log file exists and is readable
   - Confirms type isn't already in manifest (asks to update)

2. **Extract content**
   - Reads the full CI log file
   - Runs extractArtifactFromLog for that artifact type
   - Shows preview of extracted content (first 1500 chars)

3. **Analyze output**
   - Examines extracted content
   - Identifies representative lines/phrases to include
   - Suggests CI boilerplate patterns to exclude
   - Generates suggested include/exclude rules

4. **Preview suggestions**
   - Shows extraction result sample
   - Lists proposed include patterns (string/regex/lint)
   - Lists proposed exclude patterns
   - Shows pattern match counts

5. **Ask for approval**
   - "Does this look good?"
   - Option: Approve and proceed
   - Option: Edit patterns manually
   - Option: Regenerate suggestions
   - Option: Cancel

6. **Set up fixture**
   - Creates directory: `fixtures/extraction-tests/<type>/`
   - Copies log file to: `fixtures/extraction-tests/<type>/logs.txt`
   - Updates: `fixtures/extraction-tests/manifest.yml`
   - Shows next steps

**After setup:**

Run tests to validate:

```bash
npm test extraction-tests
```

**Manifest Format:**

Each test entry uses this structure:

```yaml
extraction-tests:
  - artifact-type: eslint-txt
    description: "ESLint output from Galaxy client build"
    log-file: "eslint-txt/logs.txt"
    include:
      - string: "VisualizationFrame.vue"
      - string: "vue/attributes-order"
      - regex: "^\\s*\\d+:\\d+"
      - lint: "Line 105, Column 9"
    exclude:
      - string: "npm notice"
      - string: "npm warn"
      - regex: "^\\[.*\\]"
```

**Pattern Types:**

- `string: "..."` - Substring match (exact, case-sensitive)
- `regex: "..."` - Regular expression match (multiline mode enabled)
- `lint: "..."` - Lint output line (substring match)

**Tips:**

- **Include patterns**: Use specific error messages, file paths, line/column numbers
- **Exclude patterns**: Use CI boilerplate, npm warnings, timestamps, headers
- **Regex**: Use `^` for line start, `$` for line end, `.*` for flexible matching
- Test patterns against extraction before confirming
- Can manually edit patterns in manifest after setup

**Multiple fixtures:**

Add more artifact types to the same manifest:

```bash
/setup-extraction-fixture mypy-txt ./mypy-output.log
/setup-extraction-fixture pytest-json ./pytest-results.json
```

Each run appends to the manifest.
