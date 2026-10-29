# Conversation Review for Claude Code

Turn exported conversations into promises you can trace, call reviews you can check and coaching notes you can own. Your transcripts and follow-through in a private database. MIT licensed. Built by Enterprise DNA.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Install the base and import your authorised transcripts. | Your review criteria, fields, reports and capture connections. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=avoma&utm_medium=readme) | [Talk to Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=avoma&utm_medium=readme) |

Avoma publishes separate recorder and conversation-review charges. This base covers work after a transcript exists. Keep or connect a recorder and transcription service for ongoing capture. It makes no automatic call-scoring, speech-recognition or CRM-sync claim. [Selection evidence and scope](docs/research.md).

## Quick start

```bash
git clone https://github.com/Enterprise-DNA-OS/conversation-review-for-claude-code.git
cd conversation-review-for-claude-code
npm install
npm test
npm run demo
```

Use Node 22. Tests and demo create temporary fictional data and ignore DATABASE_URL. For a persistent fictional demo, run npm run migrate and npm run seed. For real work, migrate an empty private database and do not seed it. PGlite stores local data in .data/db; DATABASE_URL selects your own PostgreSQL 15 or later database. Backups and access are your responsibility.

Open this folder in Claude Code, Codex, OpenCode or Cursor. All follow CLAUDE.md and the same 25 command recipes. The database is the product and the agent is the door. Agent subscriptions are separate. No model calls are made by the code.

```bash
node scripts/conversations.mjs call-review
node scripts/conversations.mjs commitments-due
node scripts/conversations.mjs coaching
npm run view
npm run docs
```

Three read-only reports cover the week, coaching and privacy exceptions. Three document types produce call briefs, coaching notes and retention working papers. Change your business name, logo and colours in brand.json. /new-view adds another report.

## Five weekly rituals

- /call-review: read new transcripts and their review status.
- /commitments-due: find overdue promises and dates in the next week.
- /coaching: review scored criteria with the supporting passages.
- /topics: compare recorded objections and themes by account.
- /weekly-review: combine call-review, commitments-due and compliance for Monday.

/import loads a downloaded transcript. /review-meeting records its checked purpose, notice evidence and next retention review. /add-commitment, /observe and /score-call require exact words from a numbered passage. The agent can propose the interpretation, and the operator checks it. The code does not infer promises, score people automatically or guess what Friday meant.

/draft-follow-up, /draft-coaching and /draft-weekly-brief write private local drafts. Nothing sends. Scores and follow-up drafts stop when the call's review becomes due. /compliance cites NZ collection and retention principles and Australian retention guidance in [docs/compliance.md](docs/compliance.md). These are limited record checks, not legal certification or a permission to record.

## Bring an Avoma transcript

Download VTT or TXT from the meeting's Download menu. Record the meeting ID, date, account and owner separately. The importer accepts the documented transcript formats directly, with that metadata supplied as options.

```bash
node scripts/conversations.mjs import avoma examples/avoma.vtt --source-id=example-call --title="Example call" --account="Example account" --owner="Operator" --date=2026-10-28 --actor="Operator" --dry-run
```

Check the dry run, then omit --dry-run. The same source ID and content skip on a repeat; changed content fails without overwriting history. Imports remain unreviewed. Audio, video, Avoma notes and scorecards are separate from transcript downloads. [Switching guide](docs/replace-avoma.md).

## Ten questions answered from your records

/insights answers these questions today. They demonstrate reporting across your evidence and review rules; they are not a claim that Avoma cannot produce a comparable report.

1. Which commitments are overdue on calls cleared for use?
2. Which open commitments rely on calls needing privacy review?
3. Which accounts have repeated decision blockers?
4. Which calls still lack a recorded next step?
5. Who owns the oldest unfinished promise?
6. Which recent calls have no coaching review?
7. Which calls have no collection notice evidence?
8. Which retained calls need a decision about keeping them?
9. Which owners have low scores on calls cleared for use?
10. Which accounts have more than one open promise?

## Your first hour: ten things to ask for

1. Show the new calls and their owners.
2. Read the discovery call and show the numbered passages.
3. Propose next steps with exact supporting quotes.
4. Show which promises are overdue.
5. Record who completed the sample report and when.
6. Show the calls with missing notice evidence.
7. Compare our decision-process coaching scores.
8. Draft an internal follow-up from the approved record.
9. Put our business name on the weekly report.
10. Add our call-type field with /customise.

## Access and verification

This is a single-business desk for trusted operators. It stores plaintext transcripts locally or in your database. Use disk encryption and restricted access for private records. Row security and revoked public permissions prevent ordinary unprivileged access, but database owners bypass these protections. Actor labels are not authenticated identities. Activity is append-only through normal operations, not tamper-proof against an owner.

export writes a full private JSON archive; use normal database backups for disaster recovery. Retention decisions must include downloads, passages, quotes, notes, drafts, reports, archives and backups. A shared deployment needs authenticated access, tested backups and an agreed disposal process.

npm test exercises both successful and refused operations, exact evidence, stale review gates, repeated imports, ambiguity, restricted roles and escaped HTML. GitHub Actions is configured for Windows and Linux plus a PostgreSQL service. [Verification record](docs/verification.md), [all CLI commands](docs/cli.md), [scope without a front end](docs/why-no-front-end.md).
