# Collection, use and retention checks

The desk checks recorded evidence. It does not certify lawful recording or decide whether an exception applies. There is no universal retention period here. An operator sets the next review date from the business's purpose and obligations. Checked 29 October 2026.

| Check | What the command flags | Basis and limit |
|---|---|---|
| COLLECTION | No purpose or notice evidence | [NZ Privacy Principle 3](https://www.privacy.org.nz/privacy-principles/3/) covers notice for direct collection, subject to exceptions. A missing record means review is needed, not that a legal breach occurred. |
| RETENTION | No review date, or date reached | [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/) limits keeping information beyond its lawful purpose. [Australian APP 11 guidance](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information) addresses reasonable destruction or de-identification when information is no longer needed, subject to exceptions and the entity's coverage. |
| REVIEW | Transcript has no recorded review | Internal evidence policy, not a statutory rule. Imported content is not automatically safe or accurate. |

Run node scripts/conversations.mjs compliance --json. review-meeting records a checked purpose, a reference to the notice or reviewed basis, the reviewer and a future review date. The CLI does not verify the referenced document or recording consent. Local recording and surveillance rules, indirect collection notices, professional duties and employment requirements need a qualified review for the actual jurisdiction and situation. Do not describe this as full privacy-law coverage.

Calls needing review are excluded from new commitment extraction, observations, scores and follow-up/coaching drafts. Existing commitments remain visible so owners can finish their work. Full transcript reads and private archive exports remain possible for the trusted operator. These are workflow checks, not an access-control substitute.

The database enables row security and revokes public access, including through its read views. The database owner can bypass those restrictions. Before team deployment, establish authenticated access, individual permissions, encrypted storage, backups and recovery tests. A typed actor label does not prove who acted. Activity is append-only in normal operations but a database owner can alter it.

The base deliberately performs no automatic deletion. Retention decisions must cover the original download, segments, quotes, activity notes, local drafts, reports, archives and backups. Use a reviewed disposal process that accounts for legal holds. The database stores sensitive text in plaintext, so disk encryption and restricted file access matter. Passing the checks does not authorise sharing or sending.
