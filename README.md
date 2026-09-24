# TraceForge Remaster v0.1

Evidence-led public-source research PWA by McLain Systems.

## Run locally

Any static server works:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` from this directory.

## Current live-capable adapters

- GitHub public user API for exact handles
- Cloudflare DNS JSON DoH with Google Public DNS JSON fallback
- RIPEstat network-info for IPs

HIBP and phone ownership are intentionally shown as unconfigured. No secrets are stored client-side.

## Persistence

Searches are ephemeral. Cases are only written to browser localStorage after explicit create/save actions. The UI labels this as “Saved on this device · not cloud synced.”

## Import / export

- Case JSON has `schemaVersion: 1`
- Evidence imports: text, `.txt`, `.json`, `.csv`
- Malformed imports are rejected before mutating saved case state
- Browser print creates a citation-bearing report

## Safety boundaries

TraceForge does not implement credential dumps, stealer logs, session tokens, private-address dossiers, covert tracking, or automatic identity merging.
