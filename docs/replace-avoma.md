# Move exported conversations from Avoma

This imports Avoma's documented VTT or TXT transcript downloads. It preserves the source text, a content fingerprint, the supplied meeting identity, date, account and owner. VTT cue timestamps and voice labels are preserved when present. TXT lines have no verified timestamps or speaker identities.

## Export

Open Meetings in Avoma, open the meeting, select More options, Download, then Transcript and VTT or TXT. The host, a participant, an administrator or the host's manager can download according to the [Avoma download guide](https://help.avoma.com/downloading-a-meeting), checked 29 October 2026. Preserve the meeting ID and date separately because the transcript file is not a complete meeting metadata export. Export only material your business is authorised to retain and use.

## Import one download in one command

```bash
node scripts/conversations.mjs import avoma imports/meeting.vtt --source-id="your-meeting-id" --title="Discovery review" --account="Example business" --owner="Review owner" --date=2026-10-28 --actor="Operator" --dry-run
```

Check the record and passage counts, then omit --dry-run. Repeating the same file and metadata skips it. Changing content or metadata under the same source ID fails without overwriting history. Correct a mistaken import through an explicitly reviewed migration, preserving the old evidence. Files above 10 MB, malformed cues and invalid dates fail. The examples are authored fixtures that match the documented formats, not exports from a real Avoma customer account.

## Check the move

1. Compare the downloaded text with transcript output and check the meeting date, source ID, account and owner.
2. Read the full call and record the actual purpose, notice evidence and next retention review with review-meeting. Imported calls remain unreviewed until then.
3. Ask your coding agent to propose commitments and observations. Check each exact passage, owner and calendar due date before writing it. The CLI does not infer promises or sentiment.
4. Compare a week of follow-ups with your current process. Keep the recorder and transcription service you need until replacement connections have been built and tested.

## Mapping and scope

| Source | Destination |
|---|---|
| VTT cue text | Numbered segment body, with markup removed and common entities decoded |
| VTT cue times | Start and end milliseconds |
| VTT voice tag, if present | Speaker label, without identity verification |
| TXT nonempty line | One unlabelled segment with no timing |
| Full download | Original text retained privately with a fingerprint |
| Operator-supplied metadata | Source ID, title, account, owner and meeting date |

Avoma's notes, coaching scorecards, playlists, permissions, calendar links, audio and video are not in a transcript download and do not come across through this import. Recreate only the reviewed records you need. This base handles post-call work. Recording, transcription, live answers, scheduling and connected CRM updates are separate services to scope with Enterprise DNA.

One prepared download imports in one command. Downloading many meetings and verifying metadata still take work. Do not cancel the existing service until the necessary ongoing capture, access and record checks are working. No customer exports were used to test this build.
