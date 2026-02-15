# Render Timeout & NDJSON Keepalive

## Problem

Long-running API requests (e.g. wine recommendations via Claude, ~35–40 seconds) can hit infrastructure timeouts. Proxies and load balancers often close connections that have been idle for ~30 seconds, which leads to:

- Backend completing the request and returning 200
- Client receiving a dropped connection and seeing loading → abrupt reset

## Solution: NDJSON Streaming with Heartbeats

The `/api/recommendations` endpoint uses **chunked NDJSON streaming** with periodic heartbeats:

1. **Immediate 200 + chunked headers** – Connection is established right away
2. **Heartbeats every 10 seconds** – `{"type":"heartbeat","ts":...}\n` keeps the connection active
3. **Final result** – `{"type":"result","data":{...}}\n` when the response is ready
4. **Errors** – `{"type":"error","error":"..."}\n` on failure

This prevents the connection from being treated as idle, so proxy timeouts are avoided.

## Frontend

The client uses `postStreamingNDJSON` in `SecureHttpClient` to:

- Read the response stream line by line
- Ignore heartbeats
- Return the parsed `data` when a `type: "result"` line is received
- Throw on `type: "error"` lines

## Render Configuration

- **Request timeout** – Render’s default limits vary by plan. If you still see timeouts, check the Render dashboard for request/proxy timeout settings.
- **Backend timeout** – The server uses an 85s request timeout (buffer before Render’s ~90s limit).

## Related

- `backend/server.js` – NDJSON streaming in the recommendations handler
- `src/services/secureHttpClient.ts` – `postStreamingNDJSON()`
- `src/services/wineService.ts` – Uses streaming for recommendations and improved retry/error handling
