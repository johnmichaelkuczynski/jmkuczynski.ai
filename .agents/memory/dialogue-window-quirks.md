---
name: Dialogue window & channel proxy quirks
description: Non-obvious constraints around the floating dialogue window and the Genius 101 channel proxy
---

- Pointer-capture drag handlers on a window header retarget subsequent events, silently swallowing clicks on child buttons (close/maximize). Any draggable header must skip drag start when `e.target.closest('button')` matches.
- **Why:** the close button appeared broken to the user despite correct onClick wiring.
- The generated API client's error object carries the server payload at `err.data` (not `err.response.data`); read `err.data?.error` for server-provided messages.
- The Genius 101 external API key is rate-limited to 30 req/5 min for the whole key, so the public `/channel` proxy enforces its own per-IP limit (10/5 min) plus message/history size caps and trims oldest history turns instead of rejecting long conversations.

Answer-length compliance must preserve meaning rather than cutting off generated prose or padding it with invented filler.

**Why:** Shortening an answer mechanically can remove qualifications or the actual conclusion; unlimited regeneration would also consume the shared upstream quota.

**How to apply:** Prefer an explicit structure instruction and a bounded correction attempt. If generation still cannot comply, report that failure rather than presenting a mismatched answer as successful.
