# [1.7.0](https://github.com/jmchilton/artifact-detective/compare/v1.6.0...v1.7.0) (2025-11-04)


### Bug Fixes

* recognize .sarif files as JSON format for proper detection ([0915f31](https://github.com/jmchilton/artifact-detective/commit/0915f31d300ab5fdb340cd7cd18e15c0ad8b20f5))


### Features

* add go-test-json and golangci-lint-json artifact types ([2d40b72](https://github.com/jmchilton/artifact-detective/commit/2d40b7261f5a49ba647ed4bf277d60f6a909bbaf))
* add NDJSON normalization for go-test-json ([574c9b0](https://github.com/jmchilton/artifact-detective/commit/574c9b0203605a9c8b19b2d11abcb6043be51a16))

# [1.6.0](https://github.com/jmchilton/artifact-detective/compare/v1.5.0...v1.6.0) (2025-11-04)


### Features

* add checkstyle-sarif-json artifact type support ([4dc3723](https://github.com/jmchilton/artifact-detective/commit/4dc3723ed67db681f57d6131e1053c3626baf62e))
* add jest-html fixture to JavaScript sample project ([06ddbd5](https://github.com/jmchilton/artifact-detective/commit/06ddbd56936d88969e5dc4464bb75f2f108a34f0))
* add surefire-html artifact type support ([cbe3c93](https://github.com/jmchilton/artifact-detective/commit/cbe3c9373b9d629ddb1740165090c1e9cd62b51a))
* implement jest-html to JSON converter ([ffcbc99](https://github.com/jmchilton/artifact-detective/commit/ffcbc99815defc4c1f16f40de917ca7c1f99d824))

# [1.5.0](https://github.com/jmchilton/artifact-detective/compare/v1.4.0...v1.5.0) (2025-11-04)


### Features

* add mypy-txt to JSON converter and normalizer ([e412e62](https://github.com/jmchilton/artifact-detective/commit/e412e625dad37b9816555802f1a69429b653f5c8))

# [1.4.0](https://github.com/jmchilton/artifact-detective/compare/v1.3.0...v1.4.0) (2025-11-04)


### Features

* add JSON export utility methods ([8e340e3](https://github.com/jmchilton/artifact-detective/commit/8e340e3bf2ffe3222f35a8d2d78f7d9903cc2149))
* add NDJSON normalizer for mypy-json and clippy-json ([49e5097](https://github.com/jmchilton/artifact-detective/commit/49e509733a2a2815361c00bb79d3c5df6f8d6efc))

# [1.3.0](https://github.com/jmchilton/artifact-detective/compare/v1.2.0...v1.3.0) (2025-11-03)


### Bug Fixes

* fix linting ([52dfe98](https://github.com/jmchilton/artifact-detective/commit/52dfe98cb6db5f4c2cf7be14db889a7ed236091d))
* generate all Java fixture artifacts and add Maven caching ([aa7d058](https://github.com/jmchilton/artifact-detective/commit/aa7d058923abdb8fcc71aa4cd6e9d6ab07fcf6a4))


### Features

* add auto-detection and validation for Java artifacts (Checkstyle, SpotBugs) ([2bfe762](https://github.com/jmchilton/artifact-detective/commit/2bfe762051729e6b9b9512b376123428b83a9022))
* Add claude command for adding new artifact fixtures to existing projects. ([a61b5e0](https://github.com/jmchilton/artifact-detective/commit/a61b5e0c70feb462ca709229c800562e00977c7b))
* add eslint-json artifact type support ([81f5694](https://github.com/jmchilton/artifact-detective/commit/81f56948a120a6e730cb3dccbb711ffa699efea7))
* add mypy-json artifact type support ([e71bb66](https://github.com/jmchilton/artifact-detective/commit/e71bb66e98e3717836c97a617dd15d19379ad3b0))
* Implement stronger validators. ([f591494](https://github.com/jmchilton/artifact-detective/commit/f5914949852d0bedf50e47be72c1d1dabf2fb2fb))

# [1.2.0](https://github.com/jmchilton/artifact-detective/compare/v1.1.0...v1.2.0) (2025-11-03)

### Features

- add Java maven sample project for fixture generation ([70a6ecc](https://github.com/jmchilton/artifact-detective/commit/70a6ecc00df3703173fefef162a286b507a54791))

# [1.1.0](https://github.com/jmchilton/artifact-detective/compare/v1.0.0...v1.1.0) (2025-11-03)

### Features

- add /setup-fixture-project command for automated sample project creation ([7d8504f](https://github.com/jmchilton/artifact-detective/commit/7d8504f08fd5426b9dedb22c7ea88475eca056ad))

# 1.0.0 (2025-11-03)

### Bug Fixes

- lower coverage threshold to 70% ([12790a3](https://github.com/jmchilton/artifact-detective/commit/12790a30c992f4675962d6100f58f93e26477fec))

### Features

- initial release ([de89a57](https://github.com/jmchilton/artifact-detective/commit/de89a57019b2fe86bd0df6491164fad845e4d4ef))

# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.
