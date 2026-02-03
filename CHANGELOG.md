# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-03

### ✨ Added
- `assertLatency` method in `TestScenario` for non-functional performance testing.
- Return timestamp in `actEmit` to serve as a stimulus baseline.
- Internal `deepMatch` utility now used for more robust payload validation.

### 🐛 Fixed
- Corrected core package import paths for monorepo compatibility.
- `assertReceived` now returns the matched message instead of just a boolean.

### 📝 Documentation
- Added "How it works" and "Integration Source" sections to README.
- Included usage examples for latency assertions.
