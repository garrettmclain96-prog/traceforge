# TraceForge v2

TraceForge is an evidence-first public-source investigation workspace by McLain Systems.

## What it does

Start with one identifier and route it only to applicable public sources:

- **Username:** GitHub + GitLab exact-handle checks
- **Email / domain:** public DNS plus RDAP domain-registration context
- **IP address:** RIPEstat routing / ASN context plus RDAP allocation context
- **Phone:** normalization only until a vetted ownership provider is configured
- **Breach coverage:** intentionally not claimed until a server-side provider is configured

Each fetched finding keeps a provider, source URL, check time, observation, and limitation. Provider failures and unavailable coverage remain visible instead of being converted into conclusions.

## Cases

Search sessions are ephemeral by default. Selected findings can be saved into local cases with:

- evidence ledger
- entities and human-reviewed relationships
- historical timeline
- questions, tasks, and contradictions
- JSON import/export
- printable citation-bearing report

Cases are stored in browser localStorage and labeled as device-local.

## Product principles

1. Source on every fetched finding.
2. A matching identifier is not automatically an identity match.
3. Shared identifiers never auto-merge people or entities.
4. Missing coverage is shown as missing.
5. Registry/network context is not person attribution or precise geolocation.
6. No credential dumps, session tokens, stealer logs, or covert tracking.

## Deployment

The repository is a static PWA deployed on Vercel. No API secrets are shipped client-side. Providers that require protected credentials must be implemented server-side before they can be enabled.
