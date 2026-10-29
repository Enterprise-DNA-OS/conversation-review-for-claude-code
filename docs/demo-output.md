# Real fictional-demo command runs

Captured 29 October 2026. All businesses, calls and people below are fictional.

## Review the call inbox

Which calls need review before we use them?

```text
node scripts/conversations.mjs call-review
  title              account           owner       held on     review state          segments  open commitments
  -----------------  ----------------  ----------  ----------  --------------------  --------  ----------------
  Alpine handover    Alpine Supplies   Noah Patel  2026-10-26  Unreviewed            2         0               
  Harbour discovery  Harbour Fixtures  Mia Chen    2026-10-17  Ready                 2         1               
  Harbour renewal    Harbour Fixtures  Mia Chen    2026-09-19  Retention review due  2         1
```

## Track the promises

Which commitments are overdue?

```text
node scripts/conversations.mjs commitments-due
  title                     account           owner     due on      days overdue  review state        
  ------------------------  ----------------  --------  ----------  ------------  --------------------
  Arrange renewal review    Harbour Fixtures  Mia Chen  2026-10-08  21            Retention review due
  Send sample stock report  Harbour Fixtures  Mia Chen  2026-10-22  7             Ready
```

## Coach from checked calls

What do the reviewed coaching scores show?

```text
node scripts/conversations.mjs coaching
  owner     criterion         reviews  average score  lowest score  latest call
  --------  ----------------  -------  -------------  ------------  -----------
  Mia Chen  decision process  1        4.00           4             2026-10-17
```
