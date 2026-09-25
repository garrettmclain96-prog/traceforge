# TraceForge v3

TraceForge is an evidence-first public-source investigation and recovery workspace by McLain Systems.

## Investigation

Start with one identifier and route it only to applicable public sources:

- **Username:** GitHub + GitLab exact-handle checks
- **Email / domain:** public DNS plus RDAP domain-registration context
- **IP address:** RIPEstat routing / ASN context plus RDAP allocation context
- **Phone:** normalization only until a vetted ownership provider is configured
- **Breach coverage:** intentionally not claimed until a server-side provider is configured

Each fetched finding keeps a provider, source URL, check time, observation, and limitation. Provider failures and unavailable coverage remain visible instead of being converted into conclusions.

## Recovery & rights

TraceForge v3 adds a dedicated recovery sweep:

1. live open class-action settlements
2. state unclaimed property directory
3. FTC consumer refunds
4. Department of Labor Workers Owed Wages
5. PBGC unclaimed retirement benefits
6. HUD/FHA mortgage-insurance refunds
7. SEC Fair Funds and harmed-investor distributions
8. FDIC failed-bank unclaimed funds
9. U.S. Courts bankruptcy unclaimed funds

The class-action feed is refreshed server-side from ClassAction.org and links claimants to the settlement administrator site. Government recovery tools open their official source directly. TraceForge does not collect or store SSNs, DOBs, claim PINs, passwords, or account numbers.

## Cases

Search sessions are ephemeral by default. Selected findings can be saved into local cases with an evidence ledger, entities and human-reviewed relationships, timeline, questions/contradictions, JSON import/export, and printable reports.

Cases are stored in browser localStorage and labeled as device-local.

## Product principles

1. Source on every fetched finding.
2. A matching identifier is not automatically an identity match.
3. Shared identifiers never auto-merge people or entities.
4. Missing coverage is shown as missing.
5. Recovery discovery is not a determination of eligibility or entitlement.
6. Sensitive claim identity data belongs on the official provider website, not TraceForge.
7. No credential dumps, session tokens, stealer logs, or covert tracking.

## Easter eggs

Four non-functional easter eggs are embedded in the client. They change presentation only and never expose hidden user data or expand data collection.

## Deployment

The repository is a static PWA with a small Vercel serverless recovery feed. No API secrets are shipped client-side. Providers that require protected credentials must be implemented server-side before they can be enabled.
