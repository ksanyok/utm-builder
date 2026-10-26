# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-26

### Added
- `utm-builder` CLI: build a tagged URL, `--check` an existing one, `--batch` tag a list of URLs, `--json`
- Value normalisation: lowercase and configurable space separator (`--keep-case`, `--separator`)
- Support for all GA4 UTM parameters including utm_id, utm_source_platform, utm_creative_format and utm_marketing_tactic
- Lints: missing required parameters, uppercase or unknown keys, duplicates, mixed case, spaces, special characters, UTM in the fragment, mediums outside GA4 default channel rules
- Library API (`buildUtmUrl`, `parseUtmUrl`, `lintUtm`, `normaliseValue`) and GitHub Action

[1.0.0]: https://github.com/ksanyok/utm-builder/releases/tag/v1.0.0
