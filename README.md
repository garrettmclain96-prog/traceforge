# TraceForge v4

TraceForge is an evidence-first public-source investigation, verification, recovery, and case-management workspace by McLain Systems.

The product rule is simple: **a source-backed observation may be saved; an unsupported conclusion does not ship as a finding.**

## Investigation console

TraceForge recognizes and routes:

- **Username** — live GitHub and GitLab exact-handle checks plus broader public-account pivots.
- **Email** — DNS, mail-routing, domain registration, certificate history, archive context, and review-first enrichment pivots.
- **Domain** — DNS, RDAP, Certificate Transparency, Wayback history, infrastructure, archive, and exposure pivots.
- **URL** — preserves the exact URL while separately researching its hostname; adds archive and reputation pivots.
- **IP address** — RIPEstat routing/origin context and RDAP allocation context.
- **Phone** — normalization plus vetted public pivots; TraceForge does not automatically claim an owner.
- **MD5 / SHA-1 / SHA-256** — recognizes the hash type and routes to public threat-triage sources.
- **Person / company / organization / topic** — deterministic research lanes for broad subjects.

For ambiguous one-word subjects, force a lane with:

```
person: Jane Example
company: OpenAI
org: Example Foundation
topic: coastal erosion
```

## Live source-backed providers

Current fetched integrations include:

1. GitHub
2. GitLab
3. Cloudflare DNS with Google Public DNS fallback
4. RDAP domain
5. RIPEstat
6. RDAP IP
7. crt.sh Certificate Transparency
8. Internet Archive Wayback/CDX history

Domain history is fetched server-side through `/api/intel` so the browser does not need to bypass CORS or expose credentials.

A provider error remains an error. A no-match remains a no-match. Neither is silently converted into a conclusion.

## Source orchestrator

The **Coverage** workspace contains a curated registry of public-source tools, grouped as:

- **Integrated now** — TraceForge fetches the source itself.
- **Integration candidate** — useful API/self-hosted systems that are not yet represented as live TraceForge evidence.
- **Manual pivot** — external review-first sources.

The catalog includes 48 structured sources spanning people/social, company research, domains/DNS, infrastructure, archives, threat triage, documents, media verification, maps/geolocation, courts/public records, due diligence, analysis, and workflow tooling.

The catalog is informed by current OSINT4ALL research and primary tool sites. It is a maintained shortlist, not a mirror, paid ranking, or endorsement.

## Investigation playbooks

Each valid input gets a deterministic next-step workflow. Typical phases are:

1. establish the exact research object
2. collect direct/registry evidence
3. expand into historical or adjacent sources
4. corroborate consequential links independently
5. preserve reviewed findings into a case

The playbook is guidance, not an AI-generated factual conclusion.

## Evidence model

Every fetched finding keeps:

- provider
- subject
- observation
- source URL
- checked time
- source type
- limitation
- selected raw source context when useful

When findings are saved, TraceForge prevents exact duplicate evidence from being added again.

Evidence is also labeled with a deterministic source-strength class:

- **Direct / registry**
- **Archived context**
- **Fetched source**
- **User-cited source**
- **User-supplied**
- **Inference**
- **Disputed**

These labels describe provenance/verification posture, not a probability that a claim is true.

## Case workspace

Cases remain device-local by default.

Each case includes:

- **Brief** — evidence count, source diversity, strength mix, entities, relationships, open work, and proof gaps.
- **Evidence** — fetched and manual evidence ledger.
- **Connections** — entities, human-reviewed relationships, and a visual relationship map.
- **Timeline** — uses source-event dates only; retrieval time never substitutes for event time.
- **Questions** — tasks, questions, contradictions, and deterministic proof-gap suggestions.

Shared identifiers never auto-merge entities.

## Portable outputs

A case can be exported as:

- JSON — complete structured case
- Markdown — human-readable case brief
- CSV — spreadsheet-ready evidence ledger
- Print/PDF — printable report view

Imports remain validated and additive. Duplicate evidence is skipped rather than silently duplicated.

## Recovery & rights

TraceForge also includes a recovery sweep for:

1. current class-action settlements
2. open lawsuits/investigations
3. state unclaimed property
4. FTC refunds
5. U.S. Department of Labor Workers Owed Wages
6. PBGC missing retirement benefits
7. HUD/FHA mortgage-insurance refunds
8. SEC investor distributions
9. FDIC failed-bank unclaimed funds
10. U.S. Courts bankruptcy unclaimed funds

Recovery discovery is not a determination of eligibility or entitlement.

Sensitive claim data such as SSNs, DOBs, passwords, claim PINs, and account numbers belongs on the official agency/administrator site, not in TraceForge.

## Privacy and security

- Searches are ephemeral until findings are explicitly saved.
- Cases are stored in browser localStorage by default.
- API secrets are not shipped client-side.
- Service-worker caching excludes `/api/*` responses.
- Security headers include CSP, frame denial, HSTS, strict referrer handling, and disabled geolocation/camera/microphone permissions.
- No credential dumps, session tokens, stealer logs, covert tracking, or automatic identity attribution from shared identifiers.

## PWA / iPhone

TraceForge is an installable static PWA with Vercel serverless endpoints for live recovery and domain-history enrichment.

The service worker uses network-first navigation, safe asset caching, and never caches API responses as static application assets.

## Deployment

Production is connected to the GitHub `main` branch through Vercel.

No build command is required for the static client. Serverless functions live under `/api`.

Providers requiring protected credentials should be implemented behind server-side endpoints before being marked **Integrated now**.
