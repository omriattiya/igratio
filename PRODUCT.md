# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Instagram account owners cleaning up who they follow and checking who unfollowed them. They already have (or can get) an Instagram data export and want a clear local answer without uploading that export anywhere.

## Product Purpose

IG Ratio compares Instagram following and followers from an Export Archive zip in the browser so users can see non-mutual follows, review unfollowers, and notice how those lists change between exports. Success is a fast, trustworthy local analysis that helps them decide who to unfollow or ignore.

## Positioning

Runs entirely client-side: files never leave the browser (IndexedDB and localStorage). Combines that privacy with convenient multi-export change tracking—so users can upload exports, see ratios and non-mutuals, and track unfollowers over time without a server.

## Operating Context

Users obtain an Instagram “Followers and following” JSON export zip (app or Accounts Centre) and drop that Export Archive in the app. The browser extracts allowlisted files under `connections/followers_and_following/` (`following.json`, `followers*.json`). Full account dumps are out of scope (20 MB size cap). The app includes an in-product export tutorial and a guided tour. Analysis, review checkmarks, and prior export snapshots stay on the device.

## Capabilities and Constraints

- Drop Export Archive zip; extract allowlisted following/followers JSON in-browser; merge multiple followers files when needed
- Summarize following, followers, mutuals, and followers/following ratio
- List non-mutual accounts and support local “OK” marks for unfollowers the user accepts
- Diff against a previous export (added/removed follows and followers, new unfollowers)
- Chart follow activity when timestamps are available
- Fully client-side storage; no backend data collection
- English UI strings in repo today; multi-language support is mentioned in docs but not a confirmed product commitment beyond existing `en` copy
- Undecided: additional languages, formal accessibility standard, marketing proof requirements

## Brand Commitments

- Product name: **IG Ratio**
- Open source; authored by Omri Attiya
- Live app: https://igratio.vercel.app/
- Privacy claim in product copy: no data collection; storage is browser IndexedDB and localStorage
- Header links to GitHub repo and author’s LinkedIn

## Evidence on Hand

- Working app UI, logo, export tutorial screenshots (`lib/tutorialImages.ts` / public assets)
- Copy in `messages/en.json`
- No customer testimonials, case studies, or third-party press in the repo — do not fabricate them

## Product Principles

1. Privacy is non-negotiable: analysis stays on-device; never imply uploads or accounts.
2. Job-first clarity: help users clean following and spot unfollowers with minimal friction.
3. Convenience over ceremony: drop archive → results → review, with tutorial/tour only when needed.
4. Honesty over marketing: don’t invent proof, languages, or compliance claims.
5. Preserve export fidelity: Instagram JSON paths and formats are the source of truth.
