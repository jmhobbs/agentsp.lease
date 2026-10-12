# Plan: yes.agentsp.lease and multiple badges

Status: completed

## Goal

Move the yes page to `yes.agentsp.lease`, reword copy to name agents, LLMs and AI, and ship four badges (agents, AI, LLMs, bots) like the no side.

## Assumptions

- `badge.svg` stays the default and becomes "Yes | Agents Please", matching `no/dist/badge.svg`.
- `badge-bots.svg` keeps the old "Bots Please" wording for people who liked it.
- The page stays script free. The no side uses JS for click-to-select, the yes tests forbid scripts.
- Badge previews use relative `<img>` paths. This adds up to four small requests, a trade against the single-request goal so readers can see each badge.

## Success criteria

1. No `botsp.lease` string remains in `yes/dist`.
2. Canonical URL and every badge snippet use `https://yes.agentsp.lease/`.
3. Each badge has AA text contrast, `role="img"`, a `<title>`, and an outer width equal to the sum of its rect widths (the old badge was 172 wide with 113 of content).
4. Each badge is under 1 KB, the page under 5 KB.
5. Copy mentions agents, LLMs and AI.
6. `npm test`, `npm run validate`, `npm run a11y` pass.

## Test cases

- structure: canonical, snippet per badge, no `botsp.lease`, copy terms.
- contrast: badge checks loop over all four badges.
- badges: width equals rect sum, aria-label matches visible text.
- size: budget for each badge.
