# Documentation Development

## Building Docs Locally

### Quick Start

```bash
# Generate all documentation
npm run docs:build

# Start local dev server with live reload
npm run docs:dev
```

Then open http://localhost:3000 in your browser.

### Available Commands

- **`npm run docs:generate`** - Generate markdown files from source data
  - Artifact types reference
  - CLI command pages
  - Fixture documentation

- **`npm run docs:api`** - Generate TypeDoc API reference from JSDoc comments

- **`npm run docs:build`** - Full build: generate all markdown + API docs

- **`npm run docs:dev`** - Start local Docsify server with auto-reload

## How Docs are Generated

### Artifact Types (docs/artifact-types/)

Generated from:
- `src/validators/index.ts` - ARTIFACT_TYPE_REGISTRY
- `src/docs/artifact-descriptions.yml` - Detailed descriptions and parsing guides

Generated files:
- `README.md` - Complete artifact types table
- `test-frameworks.md` - Test framework types with detailed info
- `linters.md` - Linter types with detailed info
- `formatters.md` - Formatter types with detailed info

### CLI Reference (docs/cli/)

Generated from command definitions in `scripts/generate-docs.js`.

Generated files:
- `README.md` - CLI overview
- `detect.md`, `validate.md`, `extract.md`, `normalize.md` - Per-command reference

### Fixtures (docs/fixtures/)

Generated from `fixtures/sample-projects/*/manifest.yml` files.

Generated files:
- `README.md` - Fixtures overview
- `javascript.md`, `python.md`, `rust.md`, `go.md`, `java.md`, `ruby.md` - Per-language fixture docs

### API Reference (docs/api/typedoc/)

Generated from JSDoc comments in source files using TypeDoc.

To update:
1. Add/edit JSDoc comments in `src/index.ts` and related files
2. Run `npm run docs:api`

## File Structure

```
docs/
├── index.html                 # Docsify config & entry point
├── README.md                  # Home page
├── DEVELOPMENT.md             # This file
├── _sidebar.md                # Navigation sidebar
├── getting-started.md         # Quick start guide
│
├── artifact-types/
│   ├── README.md              # [GENERATED] Complete artifact table
│   ├── test-frameworks.md     # [GENERATED] Test framework details
│   ├── linters.md             # [GENERATED] Linter details
│   └── formatters.md          # [GENERATED] Formatter details
│
├── cli/
│   ├── README.md              # [GENERATED] CLI overview
│   ├── detect.md              # [GENERATED] detect command
│   ├── validate.md            # [GENERATED] validate command
│   ├── extract.md             # [GENERATED] extract command
│   └── normalize.md           # [GENERATED] normalize command
│
├── fixtures/
│   ├── README.md              # [GENERATED] Fixtures overview
│   ├── javascript.md          # [GENERATED] JavaScript fixtures
│   ├── python.md              # [GENERATED] Python fixtures
│   ├── rust.md                # [GENERATED] Rust fixtures
│   ├── go.md                  # [GENERATED] Go fixtures
│   ├── java.md                # [GENERATED] Java fixtures
│   └── ruby.md                # [GENERATED] Ruby fixtures
│
├── guides/
│   ├── extraction.md          # [MANUAL] CI log extraction guide
│   ├── normalization.md       # [MANUAL] JSON conversion guide
│   └── custom-markers.md      # [MANUAL] Custom marker patterns
│
└── api/
    ├── README.md              # [MANUAL] API overview
    ├── functions.md           # [MANUAL] Functions guide
    ├── types.md               # [MANUAL] Types reference
    └── typedoc/               # [GENERATED] TypeDoc API reference
        └── index.html         # Generated API docs
```

Legend: [GENERATED] = auto-created by scripts, [MANUAL] = hand-written

## Editing Docs

### Manual Pages
- Edit directly in `docs/guides/`, `docs/api/`, etc.
- Changes appear immediately when running `docs:dev`

### Generated Pages
- **Artifact Types**: Edit `src/docs/artifact-descriptions.yml` and re-run `npm run docs:generate`
- **CLI Reference**: Edit `scripts/generate-docs.js` and re-run `npm run docs:generate`
- **Fixtures**: Edit `fixtures/sample-projects/*/manifest.yml` and re-run `npm run docs:generate`
- **API Reference**: Edit JSDoc in `src/` files and run `npm run docs:api`

## Deployment

Docs are automatically deployed to GitHub Pages when:
1. Changes are pushed to `main` branch
2. GitHub Actions workflow (`.github/workflows/docs.yml`) runs
3. Docs are built and deployed to `gh-pages` branch

Site URL: https://jmchilton.github.io/artifact-detective
