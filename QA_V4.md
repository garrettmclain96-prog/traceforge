# TraceForge v4 QA

Tested: 2026-09-25

## Result

TraceForge v4 passed static syntax validation, deterministic behavior harnesses, and Vercel preview deployment checks.

## Syntax validation

The following files parse successfully as JavaScript:

- app-core-1.js
- app-core-2.js
- app-cases-1.js
- app-cases-2.js
- app-ui-1.js
- app-ui-2a.js
- app-ui-2b.js
- app-recovery.js
- app-easter.js
- app-source-catalog.js
- app-wire.js
- api/recovery.js
- api/intel.js
- sw.js

## Behavior checks

### Input router

Verified detection for:

- URL
- SHA-256
- free-form research subject
- email
- domain
- username
- explicit `company:` routing
- explicit `person:` routing

### Source orchestrator

Verified:

- 48 structured catalog entries
- source suggestions change by identifier/research lane
- domain routing prioritizes infrastructure/history pivots
- person routing prioritizes entity/public-record verification pivots
- 8 providers are represented as integrated sources
- deterministic investigation playbooks render for valid inputs

### Evidence model

Verified:

- registry/API evidence receives the expected provenance-strength label
- exact duplicate evidence is detected
- proof-gap rules identify undated and inferred evidence
- duplicate protection applies to fetched and imported/manual evidence paths

### Case workspace

Verified:

- Brief view renders
- portable case export controls render
- relationship graph renders as SVG
- human-reviewed relationship mode remains explicit

### Domain history API

Verified parser behavior for:

- Certificate Transparency JSON
- Wayback CDX JSON
- domain validation
- source URL preservation

## PWA and security review

Verified in code:

- service worker does not cache `/api/*`
- failed asset fetches no longer fall back to HTML
- navigation remains network-first with offline app-shell fallback
- CSP restricts scripts to same-origin
- framing is denied
- HSTS, referrer policy, and permissions policy are set

## Deployment

Latest Vercel preview for `feature/traceforge-v4` reached READY state.

Preview deployment id:

`dpl_8wRgdMVHL9MvTiKwVEGSH45kRpEF`

Preview commit:

`2a41a58f5816b6bf7867372b957bcb06d3ed34e9`

## Verification limitation

The connected Vercel service reports the preview deployment as READY, but its advertised build-log endpoint is not currently exposed by the connector backend. No claim is made that a full pixel-level automated browser click-through was completed in this session. Logic, syntax, routing, parser, evidence-model, case-view, and deployment-state checks were completed before merge.
