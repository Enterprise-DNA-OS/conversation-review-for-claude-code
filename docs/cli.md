# Conversation review CLI

Run from the repo root with Node 22. Use --key=value; quote values with spaces. Reads return human tables or --json. All writes require --actor, a recorded operator label, and accept --dry-run. Labels are not authenticated identities. Names are case-insensitive and IDs accept unambiguous prefixes. Ambiguity prints candidates and exits 1. Unknown options fail.

| Job | Command |
|---|---|
| List meetings and their review status. | `meetings` |
| Review the call inbox before extracting next steps. | `call-review` |
| Read the full transcript with numbered evidence passages. | `transcript "<meeting>"` |
| Read one call, its commitments, observations and scores. | `meeting "<meeting>"` |
| Find overdue promises and what is due in the next week. | `commitments-due` |
| Review manual scores on calls cleared for use. | `coaching` |
| Compare reviewed themes by account. | `topics` |
| Find overdue commitments and calls needing review. | `attention` |
| Check collection evidence, retention dates and transcript review. | `compliance` |
| Answer ten specific questions from the recorded evidence. | `insights` |
| Read the recorded operator activity. | `activity` |
| Record a verified purpose, notice evidence and next retention review. | `review-meeting "<meeting>" --purpose="<actual purpose>" --notice="<verified notice reference>" --retention=YYYY-MM-DD --actor="<operator>"` |
| Record a promise using the exact source words. | `add-commitment "<meeting>" --segment=2 --quote="<exact passage>" --title="<action>" --owner="<owner>" --due=YYYY-MM-DD --actor="<operator>"` |
| Record how an open promise ended. | `resolve-commitment "<commitment>" --status=done --note="<actual outcome>" --actor="<operator>"` |
| Record an evidenced topic or buyer objection. | `observe "<meeting>" --segment=1 --quote="<exact passage>" --topic="<topic>" --note="<review note>" --actor="<operator>"` |
| Score one criterion with a source passage and explanation. | `score-call "<meeting>" --segment=2 --quote="<exact passage>" --criterion="<criterion>" --score=4 --note="<reason>" --actor="<operator>"` |
| Append a factual note to the call history. | `log "<meeting>" --note="<actual note>" --actor="<operator>"` |
| Load an authorised Avoma transcript download. | `import avoma "<file.vtt>" --source-id="<Avoma meeting ID>" --title="<meeting title>" --account="<account>" --owner="<owner>" --date=YYYY-MM-DD --actor="<operator>" --dry-run` |
| Write the complete private conversation archive. | `export` |
| Draft the recorded next steps from one cleared call. | `draft-follow-up "<meeting>"` |
| Draft a coaching note from evidenced scores. | `draft-coaching "<meeting>"` |
| Write an internal brief of calls, commitments and exceptions. | `draft-weekly-brief` |
| Run the Monday review from calls, commitments and privacy checks. | `weekly-review` |

Prefix each command with node scripts/conversations.mjs. Transcript evidence uses a sequence number, local to that meeting. VTT preserves speaker labels when exported with voice tags; TXT lines are preserved as unlabelled passages. No speaker identity is inferred.

Scores are integers from 0 to 5 on a criterion chosen by your team. One criterion per meeting is accepted, so rerunning cannot silently overwrite a review. A forward migration can add a reviewed correction workflow. Observations and commitments quote exact text. Dates inferred from words like Friday need an operator to confirm the calendar date.

review-meeting records today's review and a future retention review date. Missing notice, purpose or overdue retention blocks new extraction and call drafts. resolve-commitment remains usable to close old actions without reusing the transcript. weekly-review includes metadata about restricted calls for internal triage. Full transcript reads and export remain available to the trusted database operator.

export creates a complete private JSON archive. Restore uses normal database backups, not this JSON file. No import command restores archives.
