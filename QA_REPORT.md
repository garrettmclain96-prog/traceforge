# TraceForge v0.1 QA Report

Tested 2026-09-24 against the packaged static PWA.

## Automated browser checks

A Chromium browser harness at a 375×812 viewport verified the application logic using deterministic provider-response fixtures.

Passed:

- No page-level horizontal overflow at 375px (`scrollWidth = clientWidth = 375`)
- Username detection and GitHub adapter state handling
- Domain detection and five DNS checks (A, AAAA, MX, TXT, DMARC TXT)
- Null MX interpretation
- IPv4/IPv6 detection and RIPEstat adapter state handling
- Phone number normalization with ownership provider explicitly unconfigured
- Device-local case creation
- Manual evidence creation
- HTTPS-only source URL validation
- Entity creation and evidence-backed manual relationship creation
- Timeline event sourced from `sourceEventDate`
- Question / contradiction creation
- Deterministic gap suggestion generation
- Schema version 1 case export structure
- Case validation rejects unsupported/malformed schema before mutation
- Simulated reload persistence using the browser storage contract
- No JavaScript console or page errors during the tested flow

Fixture adapter outcome:

- GitHub: success, 1 finding
- DNS: success, 5 findings
- RIPEstat: success, 1 finding

## Network-test limitation

This execution environment blocks browser navigation/network access and DNS resolution from the container, so the packaged browser could not perform a true end-to-end request to all three external providers during QA. The adapter URLs and response paths are implemented for the public GitHub user API, RIPEstat network-info API, Cloudflare DNS JSON DoH, and Google Public DNS fallback. Live provider success should be re-checked after deployment from a normal browser/network.

## Data behavior

- Searches are ephemeral by default.
- Only explicit case/evidence actions write browser local storage.
- UI labels saved case data as device-local and not cloud-synced.
- Clear session does not delete saved cases.
- Delete-all requires two confirmations.
- HIBP and phone ownership remain unconfigured and never return fabricated negatives.
