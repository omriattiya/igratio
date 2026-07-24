# IG Ratio

Client-side Instagram following/followers export analyzer. Privacy-first: export data never leaves the device.

## Language

**Export Archive**:
The zip file Instagram produces for a **Followers and following** (JSON) export. Accepted as the sole analysis input. Practical limit: **20 MB** file size — full account downloads are out of scope for v1.
_Avoid_: Upload package, data dump, JSON files (obsolete as user-facing input), full Download your information zip (rejected by size / not supported)

**Follow Graph Folder**:
The path inside an Export Archive at `connections/followers_and_following/` that holds relationship JSON.
_Avoid_: connections folder (too broad), export root

**Follow Graph Allowlist**:
The subset of files in the Follow Graph Folder used for analysis today: `following.json` and `followers*.json` (case-insensitive). Other files in the folder are ignored for now; the allowlist may grow later.
_Avoid_: all JSON in folder, relevant files (name the allowlist)

**Archive Analysis**:
The automatic analysis that runs after a valid Export Archive is selected and allowlisted files are extracted in the browser. No separate analyze action.
_Avoid_: upload-then-analyze, manual analyze (obsolete for the happy path)

**Export Tracking**:
Optional comparison of the current Archive Analysis against the last saved snapshot on device. Toggle stays; defaults to on so a new archive can show follow/follower changes immediately.
_Avoid_: sync, cloud history, account history

**Incomplete Archive**:
An Export Archive that opens but does not contain both allowlisted following and followers files under the Follow Graph Folder. Analysis must not run; the user gets an error instead of one-sided results.
_Avoid_: partial analysis, best-effort parse

**Oversized Archive**:
An Export Archive whose file size exceeds 20 MB before extraction. Hard-fail with guidance to use the narrow Followers and following export.
_Avoid_: soft warn, attempt partial read of huge zips

**Selected Graph Files**:
The basename list of allowlisted files actually used from the Export Archive (e.g. `following.json`, `followers_1.json`). Shown after a successful extract for confirmation.
_Avoid_: full zip paths, silent extract

**Archive Dropzone**:
The single control where the user selects an Export Archive. Primary verb in UI: **drop** (not upload). Replaces separate following/followers JSON pickers and the swap control.
_Avoid_: dual upload, JSON dropzone, file swap, upload (as primary UI verb)
