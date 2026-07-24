# Accept Export Archive zip instead of raw JSON picks

Users used to unzip Instagram exports and hand-pick `following.json` / `followers_*.json`. We now take a single **Export Archive** (zip), extract only the Follow Graph Allowlist under `connections/followers_and_following/` in the browser, and auto-run analysis. Dual JSON pickers, swap, and the Analyze button are gone.

We rejected keeping JSON as a fallback (two mental models) and rejected supporting full multi‑GB account dumps (20 MB hard cap; narrow “Followers and following” export only). Client-side extract preserves the privacy claim: the archive never leaves the device.
