# Margin — Measurement Rules for Process, Change Cost, and Value

| Item | Definition |
|---|---|
| Policy ID | `margin-measurement-value/v1.0` |
| Parent policy | `margin-change-policy/v1.0` (hereafter "the Change Policy"). The canonical source for intake, start, stop, merge, and policy revision |
| Effective point | The SHA of `main` that adopts this document. Attach the policy ID, the effective SHA, and the forecast time to every forecast |
| Scope of application | A single private repo, the owner's local single-seat edition. External tests are limited to deliverables or an independent single seat |
| Status of the figures | **All figures in this document are initial settings, not track records** (including the conditions in the original plan, initial coefficients, observation windows, and judgment examples). Do not treat the plan as evidence of implementation, use, or sales |
| Initial state | Plan entries are `planning`, test results are `not-run`, value is `unverified`, and actual work minutes are `unknown`. Update only the items for which evidence is found in the inventory |
| Units of judgment | Arising of a request = `request_id`; a result whose pass/fail can be shown independently = `promise_id`; a PR = `cl_id`. `merged`, `deployed` on the owner's PC, and `used` in a natural purpose are separate events |

## 1. The Specification and Requirements Ledgers for the Two Proposals

### 1.1 How to read this, and the connection to existing contracts

Below, `P` is `PLAN.md` and `R` is `ROADMAP.en.md`. `Wn` refers to the corresponding Week section, `Schedule` to "Deployment and decision schedule," `Break` to "What would break the plan," and `Spread` to "Where it could spread." The ledger IDs are reference keys for the rows; they are not contract IDs, acceptance condition IDs, or implemented promise IDs.

| Abbreviation (not a new contract ID) | Where it pulls from: contracts and acceptance conditions in Change Policy §2–3 |
|---|---|
| Persistence / Saving | Immutable ID, same ID after restart / save finalization, unsaved on failure |
| Recovery / Migration | Restoration to a different directory, comparison with the canonical copy / migration from an old version, halt on failure, round-trip |
| Search / Boundary | Fixed expected IDs, match before and after index rebuild / localhost only |
| Load / Common | Performance and degradation judgment on the owner's PC / attributes, size, required CI, evidence of the promise |
| Owner / Operations | Items subject to owner confirmation, candidate SHA / monitoring, judgment, and termination conditions in Change Policy §4–6 |

The "promise candidate" in each table is a result name. "Verification" is the `acceptance_ref`, and it identifies the conditions within the source section by the test content in the tables below. If an abbreviation from the table above applies, link to that existing contract as well. Because there are no literal IDs in the materials, do not create fictional existing IDs. Before starting, resolve the real IDs from the correspondence table in `policy/change-rules.yml`. If one is already registered, reuse it; for an unregistered independent judgment only, register an acceptance ID grounded in the original section and conditions. If unresolved or ambiguous, stop. The set rows below are an index for planning purposes; they are not a reason to bundle independent results into the same PR.

### 1.2 Specification Ledger (type = SPEC)

| ID | Source | Verifiable property / constraint | Promise candidate | Verification (acceptance reference) |
|---|---|---|---|---|
| SPEC-001 | P Purpose and boundaries, R Schedule W5 | Owner's PC, Next.js, SQLite, single user, localhost only. The persistent area is outside the release. No sync, co-editing, public URLs, or notifications | Records remain even after local updates | Boundary: bind and configuration check, release swap and restart |
| SPEC-002 | P Demand hypothesis, W2 | The immediately preceding book is the initial value. Required: title and body only. Paste and manual input allowed; position, notes, tags optional. OCR disabled by default and not depended on | Minimal input possible during reading | Input without OCR, re-read the original text and source |
| SPEC-003 | P Data, W1 | SQLite canonical copy = books, excerpts, notes, tags, review state. Book and excerpt IDs immutable. Holds creation/update timestamps, optional position, reading and trash states. Book registration, listing, state change, and editing possible | Records can be distinguished even with the same title | Persistence: change, delete, and restore one of two books with the same title, restart, and compare the other book's ID and state |
| SPEC-004 | P Data, W2 | Save without altering the original text, with relations, in one transaction. Saved only after commit. On failure, it is unsaved, the input can be copied, and a retry does not duplicate | Can save without mistaking success and failure | Saving: failure injection, exactly 1 record after retry, restart comparison |
| SPEC-005 | P Data / Misoperation, W3 | Deletion goes to the trash. Restoring a parent makes its children referenceable in their original state. Exclusion from review does not change the body or the trash | Misoperations can be undone | Before/after comparison of parent-child states, search and export after exclusion |
| SPEC-006 | P Data / Backup | Take a SQLite online copy before the first write of a use day, before a migration or bulk import, and manually. Only after the new copy passes inspection, organize it into the most recent 7 generations. On failure, keep the old copy and prohibit bulk changes and migrations | Never lose a consistent recovery point | Recovery: test each trigger, copy failure, and the generation organization order |
| SPEC-007 | P Data / Recovery, W1, R Break | If corrupted at startup, stop writing and do not replace it with an empty DB. Evacuate the closed DB and its accompanying files. Show the recovery point's date and time, restore to a different path, inspect, then switch | Can recover safely to a chosen point in time | Recovery: preserve the corrupted original, compare IDs, values, and relations in an empty work area, ensure changes made after acquisition are not mixed in |
| SPEC-008 | P Data / Device, R Schedule W5 | Full recovery is SQLite. A verified copy can be placed on separate media and its final date and time confirmed | There is a recovery point outside the disk | Recovery: open from the external copy in a different directory |
| SPEC-009 | P Demand hypothesis / Data, W1 & 4 | Versioned Markdown is readable in an editor and needs no account or external service. The IDs, values, relations, and states of all canonical records except the index round-trip | Can be read without the app and resumed from an empty DB | Migration: readability of Japanese, line breaks, headings, fences, and sources; comparison of all canonical records including tags, additions, hidden items, and trash |
| SPEC-010 | P W1 & 4 | Fix the formats and samples for migration, backup, and full export in W1. If migration fails, the old version remains readable | Can migrate without losing the old version | Migration: success and halt on failure, re-read the old version |
| SPEC-011 | P W2, Data | Titles, body text, and notes are searchable even in Japanese text without spaces. FTS5 is a derived index. Short terms use per-page substring matching | Can be searched by a remembered fragment | Search: expected IDs for in-text terms, single characters, titles, and note-only terms; match before and after rebuild |
| SPEC-012 | P W2 & 4, R Schedule | Text and source can be copied | Can be re-used with the source attached | Owner: copy using only the manual and compare with the original sample |
| SPEC-013 | P Demand hypothesis, W3 | Review items can be hidden. At most 5 items, in the order: oldest previous presentation first → ascending presentation count → ID order. Save only the completed portions of "keep / add / never review again." When paused, there are no deadlines and no homework | Can re-read optionally even after an absence | With a fixed clock, empty is 0; even after half a year, no cap breach and no duplication; excluded items are never re-presented. Search, editing, quotation, and export remain possible even when hidden |
| SPEC-014 | P W3 & 4 | Run through registration → paste → search → addition → reference after restart. CI runs lint, types, unit, migration, round-trip, and Playwright | The main path can be reproduced for each version | Common: each run succeeds on the integration result with the latest main |
| SPEC-015 | P Demand hypothesis, W4 | Before import, show the number recognized and the uninterpretable places; the original file is unchanged. For Margin format, skip same ID with same content; for different content, report a conflict and do not overwrite automatically | Existing notes can be imported without duplication or destruction | Migration: conflict sample, increment 0 on re-loading, comparison with the original |
| SPEC-016 | P W4 | Illustrate the corresponding headings and quotation structure of general Markdown. Everything else is an unclassified preview that preserves the original text. Bulk-finalize after owner confirmation | Unfamiliar formats can also be checked and imported | Migration: detection of re-loading the same file; on a forced termination, either all records or 0 records |
| SPEC-017 | P W1 & 4 | The production build in the recorded owner environment. With mainly Japanese text, an average of 300 characters, and 10,000 records, after warm-up, run save confirmation, the first 50 of the list, and the first 50 of a fixed search 30 times each; each operation → display p95 ≤ 500ms. Export and rebuild use a separate clock | Can guarantee responses at the usual scale | Load: save the quantiles by environment, sample, and operation |
| SPEC-018 | P W4 | Do not promise the same speed at 100,000 records. No full rendering and no immediate full counting; 50-record pages. Slow searches can be interrupted. During a rebuild, show the restriction and allow per-book browsing and input. Export is split reading → temporary file → publish on completion | Can keep being used at large scale while protecting the data | Load: backward pages, saving after a search interruption, browsing and input during a rebuild, comparison with the previous completed export after an interruption |
| SPEC-019 | P Bot operations | Features, QA, and usability/performance run in parallel; there is one responsibility PR for schema and samples. Small PRs carry conditions, reproduction steps, and results; the daily report puts loss risk and unverified items first | Tests and changes can be reviewed on the same version | Common / Operations: inspection of PR attributes, locks, and the daily report |
| SPEC-020 | R Schedule W5 | Start with the launcher of the tested production version and open the input screen | Input is possible immediately after a restart | Owner: restart → launcher → check the target DB |

### 1.3 Requirements Ledger (type = REQ)

The verification reference of each row is saved in `acceptance_refs` in `requirements.yml`. In rows where the acceptance condition is the owner's judgment rather than a product test, the evidence is the judgment date, the anonymized tally, and the judgment result.

| ID | Source | Who, when, for what | Promise candidate | Verification reference |
|---|---|---|---|---|
| REQ-001 | P Purpose / Bot operations | The owner wants to save in a short time while reading, search for the source a few weeks later, and take it out without the app. When delayed, keep the order: preservation → input → search → re-reading | The required paths can be handed over | SPEC-004, 007, 009, 011, 012. Cut OCR, decoration, and ordering improvements first; keep the save, restore, search, and migration tests |
| REQ-002 | P Purpose, W1, R Who | The owner wants to check, at the start of W1 and in the usual place, whether a passage can be moved to the PC, and to judge device mismatch early | The input path and the measurement environment can be decided | Owner: record the PC, browser, execution mode, and whether transcription is needed. If smartphone-centered, keep the format and make the device judgment a separate request |
| REQ-003 | P W2, R Break | The owner wants to distinguish the actual input burden on an existing book from the transcription burden | Operation time can be accepted | Owner / Saving: for 3 actual cases, the median of open screen → paste → save confirmation ≤ 15 seconds; record selection and transcription separately; after a restart, the original text and source match |
| REQ-004 | P W3, Demand hypothesis | The owner wants to try review once and judge the value and burden of re-presentation | Investment in an optional path can be stopped | SPEC-013 plus one comment each. If it is thin, prioritize search without adjusting the interval |
| REQ-005 | P W1 & 4, Data / Device | At handover, the owner wants to evacuate, restore, and quote using only the manual | Can recover unaided and use the source | SPEC-007, 008, 009, 012, 014, 017, 018; acceptance on the owner's PC |
| REQ-006 | P Bot operations | Implementation details go to the Bots; the owner wants to decide, before a change, on meaning, devices, external transmission, and irreversible operations | Changes can go through the responsible person | Owner / Common: confirmation of the target SHA |
| REQ-007 | P Bot operations, R opening | At W4, the owner wants delivery pass/fail and demand success/failure reported separately | Completion and use are not confused | Common test results / actual saves and natural references at a later date. No opportunity means unverified; do not make daily use counts a delivery condition |
| REQ-008 | R opening / Schedule W5 | At W5, the owner wants to use it on their own reading PC as a work notebook that can be recovered. It is not a hosted beta | Single-seat deployment can be accepted | SPEC-001, 008, 009, 020. Restore from an external copy; open in a normal editor |
| REQ-009 | R Schedule W5–8 | During natural reading, writing, and conversation, the owner wants to save to the current book, and when needed, search by text or title and use the source | Gains and losses can be tracked at actual opportunities | SPEC-002, 011, 012. Weekly local records: saves, deferrals and their reasons, re-discoveries, failures. Review is optional; zero opportunities is not a failure |
| REQ-010 | R Schedule W8 / end, Who | At W8, the owner wants to judge everything from saving a passage to checking it at a later date | A private archive and a new recording habit can be distinguished | Elapsed days, trigger, source sufficiency, old vs. new. Report the recoverable deployment and the actual use. If there is no reference opportunity, keep it without expanding until M3 |
| REQ-011 | R Break | When deferring or when a check fails, the owner wants to avoid fixes with the wrong cause | Requests suited to the failure can be raised | 2 deferrals due to paper/phone transcription → owner confirmation of the device path. Check failure → confirm unsaved / insufficient source / search miss |
| REQ-012 | R Schedule M3–6 / Break | The owner wants to keep recovery points even during changes | Recoverability can be judged before an update | During changes, weekly external-copy checks, monthly restoration to a different directory, and a verified snapshot before an update. If there is no external copy corresponding to new records, stop updates and bulk imports; on corruption, SPEC-007 |
| REQ-013 | R Schedule M3–6 / end | The owner wants to choose the minimal external test only after a useful re-reference, and at M6 to be able to choose maintenance even for private use only | The expansion judgment can be explained by use | Operations: separate external re-use, repeated installation, and organizational interest; §4 judgment |
| REQ-014 | R Spread CtoC | A reader wants to hand a source that became necessary in conversation to another person, and the recipient wants to use it without the app | The deliverable alone can be re-used | Plain Markdown of their own explanation, bibliography, and an appropriate short excerpt. Confirm use for the recipient's own purpose, not the sending |
| REQ-015 | R Spread BtoC | A reader who already has highlights and Markdown on a PC wants to search locally with their own device and library | Another reader can re-reference unaided | Provide the tested version, launcher, and restoration procedure to one seat; a genuine check at a later date. Separate from downloads and willingness to pay |
| REQ-016 | R Spread BtoB | An editor or researcher wants to do repeated source checking on a permitted device | Business re-use is possible in a single seat | Confirm the recent time-consuming check, the saving permission, non-co-editing, and the person responsible for recovery, and confirm repetition in actual work |
| REQ-017 | P Demand hypothesis, R Who | If the owner is centered on old notes, they want to try it as a searchable archive rather than a new habit | The practical use of existing assets can be judged independently | SPEC-015, 016, plus a tally of only natural re-references and source sufficiency for the old-note group |

### 1.4 What is kept as non-SPEC and non-REQ

| Source | Description | Reason for ledgering / handling |
|---|---|---|
| P Demand hypothesis, Purpose | Inputs in a hurry; search is more important than review; there are more old notes; may stop using it; transcription cannot be solved by UI improvement | Hypotheses about the user picture. Only the derived product conditions become SPECs, and only the confirmation acts become REQs. OCR demand is undecided |
| R Who (Evidence) | The Pew survey's reading population and book counts; Readwise's Kindle import path | Background from external literature; not this service's track record, frequency, or demand estimate. The original links are kept in R |
| R Who (Working hypothesis) | A reader who needs accurate text and sources a few weeks later and can bring material onto a PC. The owner is also only a candidate | Fit is observed under REQ-002, 003, 009, 017. Do not treat mere registration as persona fit |
| R Schedule / Spread | Future use opportunities, re-use, repeated adoption, organizational interest; CtoC > BtoC > BtoB | Hypotheses about observation plans and the amount of behavior change. Not market size, sales order, or contract prospects. Not having approached someone is not a failure |
| P each week, R Schedule | Week and month headings and future forms | Scheduled points for acceptance and judgment. The arrival of a date is not pass evidence |

## 2. Process and Actual Work Minutes

### 2.1 Two-axis classification

`work_class` is **what the time is for**; `activity` is **what was being done during the time**. Divide a session at each switch of purpose or activity, and each row holds exactly one value on each axis.

| work_class | Judgment | activity (Change Policy §4) |
|---|---|---|
| Management `manage` | Intake, classification, estimation, review coordination, weekly reports, policy revision | Normally `operations`; tallies are `measurement`; rule verification is `QA` |
| Implementation `deliver` | Making a new promise hold for the first time. Includes a new verifiable result for the maintainer | Building is `implementation`; first verification is `QA`; measurement is `measurement`; first deployment and training are `operations` |
| Repair `repair` | A known defect or regression; rebuilding and re-verification after a failure | Repair and redoing are `rework`; cause reproduction and re-verification are `QA`; re-measurement is `measurement`; recovery operations are `operations` |

Carrying out a periodic inspection is management / operations; delivering a new inspection means is implementation; resolving an inspection failure is repair. Even for a repair triggered by the same failure, intake coordination alone is management. `rework_flag` is attached to segments that redo work already done (including re-verification). Do not treat all minutes of `repair` as synonymous with rework minutes.

### 2.2 The recording contract

| File | Keys and required fields |
|---|---|
| `docs/specs.yml` / `docs/requirements.yml` | `id, revision, source_section, statement, promise_candidates[], acceptance_refs[], resolved_acceptance_ids[], contract_ids[], related_ids[], status, supersedes`. REQs also hold `actor, occasion, purpose`. Deletions remain as deprecated versions |
| `docs/requests.yml` | All attributes of Change Policy §1–2, plus `spec_refs[], req_refs[], change_type, impact_ref, promise_ids[], primary_request, status`. Even with multiple requests, do not duplicate promises or actual minutes |
| `docs/metrics.yml` | `promises` (promise, primary request, acceptance IDs, CL history), `events`, `sessions`, `runs`, `forecasts`, `impacts`, `windows`, `decisions`. Each row has a unique key, UTC, the policy version, and target references. Corrections are appended with `corrects_id` |
| `docs/evidence/` | Target SHA, fictional sample, reproduction command, expected value, measured value, run ID, unverified items. Do not fill in the success field before execution |
| Local records outside the repo | Details of the owner's environment, usage logs, deployment confirmations. Into the repo go only anonymous observation IDs and tallies. Refuse evidence in which the DB, WAL, quotations, personal paths, etc. are detected |

The common columns of `events` are `event_id, stage, event_type, at_utc, actor, request_id, promise_id?, cl_id?, candidate_sha?, base_sha?, lane?, block_reason?, session_ids[], run_ids[], artifact_ref, policy_sha`. `actor` is `owner / bot-feature / bot-qa / bot-ux-perf / CI`. An unissued reference is null plus a reason. An event itself is not evidence that time was consumed.

| Process | Events / times | Main assignees | Work-minute reference / deliverable |
|---|---|---|---|
| Intake | `received`, at arrival | Owner, each Bot | Management session / request, anonymized event |
| Classification | `classified, linked, blocked`, at judgment | Each Bot, owner | Management / primary request, contract, area, source, duplicate target |
| Estimation | `estimated, reestimated`, at each calculation | Assignee Bot, CI | Management / P, A, C, H; initial value, latest version, affected set |
| Start | `slot_acquired, lock_acquired, work_started`, at each acquisition and start | Owner, each Bot | Session / start slot, responsibility PR, planned paths |
| Verification | `submitted, ci_start, ci_end, failed, resubmitted` | QA and usability/performance Bots, CI | Sessions for QA, measurement, etc. and runner minutes / sample, candidate, result |
| Confirmation | `approval_requested, approved, rejected, invalidated` | Owner, CI | Management or acceptance session / target SHA, confirmation result. If unnecessary, `not-required` |
| Merge | `queued, merged, withdrawn, lock_released` | CI, owner | Management session or run / integration SHA, result, release record |
| Observation | `observing, regression, reopened, reverted, observation_closed`, at occurrence and at 14 days after merge | QA, owner, CI | Repairs link to the causing PR / before expiry it is `observing` |
| Weekly report / calibration | `week_closed, reviewed, change_proposed, trial_closed`, at closing and judgment | Measurement Bot, owner | Management / target window, denominator, forecast error, adoption or rejection |

`sessions` = `id, actor, start_utc, end_utc, pauses_min, active_min, work_class, activity, rework_flag, stage, primary_request?, promise_id?, impact_slice?, artifact_ref, missing_reason?`. At the end of a session, the owner uses a timer, and a Bot converts from the job's work segments, excluding pauses and queue waiting. Overlapping segments of the same assignee are treated as missing measurements until resolved. Split at week boundaries; rounding only at tally display time. CI records, in `runs`, the start, end, and state per runner, and does not put them into Bot minutes. Common costs such as weekly reports are counted once a week as `shared`. Withdrawn and failed runs are also included in consumption. **Commit intervals, PR open time, and waiting for confirmation are not work minutes.** Missing measurements are `unknown`, not-yet-introduced is `not-instrumented`, and only confirmed no-work is 0. Attach the number of missing measurements / the number of expected records, and display totals as a lower bound of the known portion.

### 2.3 Effort forecasts (minutes)

For CL judgment, the Change Policy's `E=30+30P+30A+90C+60H` stands as is. `P` is the number of distinct registered change areas, `A` is the number of mandatory cases, and `C, H` are indicator variables for the contract lock and owner confirmation. The atomic exception uses `H=1`. At diff finalization, `P` is the union of the planned and the actual. The formulas below are for budget allocation; they are not formulas for evading the size cap.

```text
M = 15 + 5P + 5A + 30C + 20H
D = E − M
Management forecast = M
Implementation forecast = (1−f)D
Repair forecast = fD + 15J + 10K
```

`f=1` when the CL's main result is resolving a known defect or regression; otherwise 0. `J` is the number of known failure reproduction cases, and `K` is the number of already-executed cases that need additional re-execution (excluding the first mandatory execution). If unknown, do not assume 0; treat it as unestimated. If a new CL fails later, keep the initial forecast and update it. Common management outside PRs has planned slots of: intake only, 5 minutes per item; weekly report, 30 minutes per round; 4-week review, 60 minutes per round. Intake minutes that have moved into a PR are transferred into the interior of `M`. Actuals are obtained from sessions, not allocated by formula.

## 3. Expansion into Operations and Maintenance, and Requirements Redefinition

| Scope | Boundaries of the SPECs / REQs to add or update | Starting point → examples of `source / kind` |
|---|---|---|
| Operations | Deployment, external-copy freshness, and restoration evidence of SPEC-001, 006–008, 020; use observation and abnormal stops of REQ-008–013. Do not make "strengthened monitoring" without an assignee, a clock, and a release test into a promise | Planned deployment `roadmap/feature`; use deferral `owner-use/measurement`; actual damage `incident/recovery` |
| Maintenance | Targets: reproducing the same sample under dependency updates, migration from and rollback to old versions, missing-measurement detection in measurement instruments, and the reproducibility of rule re-judgment. Tidying with no acceptance result is out of scope | Periodic update `maintenance/upkeep`; failed run `QA/defect`; load overrun `perf/measurement`; planning starting point `plan/feature` |

`source` is fixed by the first evidence. `maintenance` (the source) and `maintenance` (the repo's suspended state) are different. An `expand` is a diff that adds a new verification obligation; a `redefine` is a diff that replaces an existing target person, occasion, purpose, or pass/fail boundary. Merely fixing a failure of a default condition while keeping the original meaning is neither.

### 3.1 Diff budgets

For each diff, fix the baseline SHA before adoption/rejection and the proposed version, follow the explicit forward and reverse links from the change ID, and review the list of targets whose meaning, pass/fail, or operating procedure changes. Exclude items that are mere references, with a reason. Sort and deduplicate the approved list and put it into the formulas below.

| Variable | Unit of determination |
|---|---|
| `s, r, p, t` | The number of distinct SPECs, REQs, promises, and test IDs affected by addition, revision, or deprecation. The same ID in old and new counts as 1 |
| `v` | The number of distinct `(test ID, target environment, version path)` that need re-verification |
| `m, d, h` | The number of migration paths `(old format, new format)`, the number of operations/explanation document paths to revise, the number of independent judgment item IDs for owner confirmation |
| `i` | The number of impact analysis sheets (one sheet for the same baseline SHA and the same semantic diff). Do not increase it by mere PR splitting |

```text
C_expand   = 20i + 10s +  5r + 15p + 10t + 10v + 45m + 10d + 20h
C_redefine = 30i +  5s + 20r + 20p + 15t + 15v + 60m + 15d + 30h   [work minutes]
```

`t` is the impact analysis and change of test definitions, and `v` is re-execution; do not record the same work minutes twice. When mixed, divide semantic replacement and pure addition into separate diff IDs, and allocate the same work key `(work type, target, environment, version path)` to only one side, prioritizing the redefinition side. In `impacts`, leave `delta_id, base_sha, proposed_revision, trigger, type, before, after, affected_ids, excluded_with_reason, work_keys, coefficients_version, estimate_first/latest, session_ids, actual_known_min, missing, gate, outcome`. Common work is recorded only once, under the representative diff ID.

**`C` is the work-package budget for that diff; do not add it wholesale to the whole CL's `E`.** When building a process budget, classify it into management (analysis, owner confirmation) and implementation or repair (target revision, tests, migration, documents, re-verification), and use the **larger** of the §2.3 classification amount and the total diff budget for that classification. A work key spanning multiple CLs is allocated only to the responsibility CL. Actual minutes view the same session from the separate cuts of class and diff.

### 3.2 Pass conditions and tallies

- Both kinds of change receive, as usual, the size, start-slot, path registration, dependency, test, and lane judgments of Change Policy §1–3. A path or contract ID that touches a contract is `core`; a mix is `core, mixed=true`. For schema, migration, fixed sample, or expected value changes, acquire the sole `contract-lock` before starting.
- Meaning, devices, external transmission, irreversible operations, policy/gates, acceptance on the owner's PC, and `atomic-contract` make `owner_gate=true`. Expansion outside the scope requires a scope revision first. For public operation, multiple writing principals, or approval delegation, stop until the next major version. Do not release a protection condition by a mere change to the wording of a requirement.
- The order is: stop conditions → owner confirmation → core or incident → immediate only for small display/explanation → everything else. A recovery procedure change is not in the immediate lane. The owner approving a new rule by that rule itself is prohibited.
- In the weekly report, for each `type × area × source × lane`, give the number of diffs, planned and actual minutes, re-verification, migration, owner waiting, withdrawals, and missing measurements. The 4-week review compares, in the completed group, the median of `actual minutes / initial C` and the 14-day-observed regressions. Multiple sources are counted once under the primary request, and all requests are used for lane judgment.

## 4. Resources, Value, and Judgment

### 4.1 Resource consumption `R`

A **budget point** for comparing different resources; it is neither money nor total actual labor time.

```text
R = O + 0.25 B + 0.10 I + 0.02 T + 0.50 W
O: owner activity minutes  B: all Bot activity minutes  I: CI runner minutes
T: calendar minutes from start-slot acquisition to merge or withdrawal (for incomplete items, cut off at the closing point)
W: owner + Bot minutes with rework_flag (a penalty added on top of the interiors of O and B)
```

The `T` of a promise unit is the union length of that promise's CL intervals. A week unit uses the union length of all start intervals intersecting the week (parallel time is not double-counted). Activity minutes sum the in-week portions and include common costs. Do not make the weekly `R` a simple sum of the per-promise `R` values.

| Forecast target | Inputs and forecast |
|---|---|
| Promise | Allocate the classification budgets of §2.3 and §3 to the owner and the Bots by the proportions in the planned assignee table (if unallocated: 50% of management, 10% of implementation and repair to the owner, the rest to the Bots). CI is 10 minutes per planned runner job; `W` is the designated rework portion (in an undivided repair budget, half). `T` is the standard time of Change Policy §3's effort band, lane, and owner-waiting column, converted to minutes. For multiple CLs, place the planned intervals in dependency and slot order. The value obtained by substituting these into the formula above is `Rhat` |
| Week | At the closing point, place the startable queue on the schedule in the priority order and slots of Change Policy §1. Distribute the activity and CI budgets evenly within each planned interval, and add the in-week portions and the planned common costs. Owner confirmations are serial. At the same time, use intake number order. The week's `T` is the union of the planned intervals. If, due to a stop, the resumption time is unknown, show the known portion and `blocked/unknown`, and do not judge that there is spare capacity |

The weekly report keeps all items of Change Policy §5. Closing Monday 00:00 UTC, with loss risk and unverified items first, it shows receipts, completions, withdrawals, CLs / promises, each resource, waiting, dwell, and delay, regressions, and the reasons for duplicate PRs. Waiting that is unstarted and unmerged is also listed separately. The interventions of §4 — the 80% notification, standard overrun, `1.5E`, and consecutive failures — are executed independently of the budget points.

### 4.2 Value `V` and forecasts

A window is a left-closed, right-open interval in UTC. A natural opportunity is counted in units of **the occasion where the owner wanted to keep something, or needed the text or the source** — not app operations. Occasions settled by another means, and occasions deferred, are also in the denominator. Retries of the same occasion count as 1. Tests, requested demos, launch counts, downloads, numbers sent, and expressions of interest are included neither in successes nor in natural opportunities.

| Symbol | Count within the window |
|---|---|
| `D` | The number of first completions of distinct promises merged after the required tests and confirmations. This is technical value, not demand |
| `Ns, S` | Natural save opportunities; of those, the number where the original text and the target book could be saved in Margin |
| `Nl, L, Q` | Natural reference opportunities; of those, the number where the correct text could be recovered in Margin; of those, the number where the needed source was also sufficient and could be used for the purpose. Separate new and old notes from the denominator onward. Keep the unknown group as well |
| `Xc, Xp, Xb` | The number of opportunities where a CtoC recipient re-used a deliverable for their own purpose, a BtoC reader re-referenced unaided at a later date, and a BtoB person in charge re-used it in repeated work. Deduplicate by anonymous seat, route, and opportunity. Also record the number of opportunities actually tried, `Nc, Np, Nb` |
| `V` | `(D, S/Ns, L/Nl, Q/L, Q/Nl, Xc/Nc, Xp/Np, Xb/Nb)`. Owner use and external use are separated. A zero denominator is `N/A`; unrecorded is `unknown`. Do not sum different values together or read them as external demand |

At the end of a window, forecast the next window of the same length. In the most recent complete 28-day window, set each opportunity count as the next window's planned opportunity count and each success rate as the planned success rate, with `forecast successes = planned opportunities × planned success rate`. The forecast for `D` is the number of promises scheduled to complete within the window. For an external test whose events are known, the planned opportunity count by route may be stated explicitly and substituted, but an unobserved success rate stays `unknown`. Keep forecasts and observations in separate columns; a forecast success alone does not open a gate.

### 4.3 Decision table

Astra outputs `repo_state` (active / maintenance / retired) and `investment` (continue / freeze / expand / move to maintenance / terminate) in separate columns. **What is frozen is new features and expansion, not recovery.** Register the regular dates in UTC at adoption, and fix the start and end of the weeks and months used as judgment inputs. Apply the following from the top. Safety stops take priority over all rows.

| Rank / condition | Judgment / permitted next action |
|---|---|
| Made read-only, and the verified external backup, readable Markdown, and different-directory restoration result corresponding to the final SHA are all in place | **Terminate** `retired`. Do not terminate on low use or resource overrun alone. Keep the history, versions, and final SHA |
| One or more detections of data loss, mismatch with the canonical copy, or writing while corrupted, or an existing stop condition applies | **Freeze / stop the target operation**. Apply the targets and release conditions of Change Policy §3–4. A missing external copy alone stops updates and bulk imports on the owner's PC; it does not stop unrelated merges |
| Incomplete requests 0, open PRs 0, and no starts for 56 days | **Move to maintenance** `maintenance`. Suspend empty weekly reports and numerical calibration. Continue the weekly copy checks and monthly restoration while in use. On re-starting, confirm the version, protection settings, and the latest restoration result |
| At W4, W8, M3, M6, the premises change to public operation, multiple writing principals, or approval delegation | **Freeze the relevant changes**. Do not stretch the single-seat rules until the new major version takes effect |
| At W8, natural reference opportunities so far are 0 | **Continue as is / freeze expansion**. Demand is unverified; keep the archive and re-judge at M3 |
| At M3 as well, natural reference opportunities are 0 / up to M3 only the old notes are useful | The former is **freeze**; the latter is **move to archive maintenance**. Applies until new eligible evidence appears. It is not necessarily the repo's own `maintenance` |
| At M6, useful cases are the owner only, or external cases are only sending and interest | **Move to solo maintenance**. If there is only CtoC re-use, only verification of the deliverable may continue. Do not increase seats |
| In the most recent 28 days there are 4 complete weekly reports, and with `Ns≥3`, `S/Ns<0.5`, or with `Nl≥3`, `Q/Nl<0.5` (apply the denominator per rate condition), or in 2 complete consecutive weeks each has `R>480` points | **Freeze**. Estimate only the fixes corresponding to the save path / unsaved, insufficient source, or search miss / the resource breakdown. If it no longer applies in the most recent window, re-judge |
| After W8. In the most recent 28 days there are 4 complete weeks, `Ns≥3, S/Ns≥2/3, Nl≥2, Q/Nl≥1/2`, there is at least one pair of a new save followed by a useful reference at a later date, each recent week has `R≤480`, the next week including the candidate has `Rhat≤480`, and the target candidate has `Rhat≤240`. In addition, the route conditions of §7 are satisfied | **Expand** = only the single corresponding minimal test. An additional seat after M6 requires at least one unaided re-reference by another person under the same conditions. Do not increase seats on the success of a deliverable |
| All other cases (insufficient denominator, missing measurements, including cases where there are opportunities but success is unverified) | **Continue** = verification and preservation within the current scope only. Do not approve additional investment. If a required record such as W8's is missing, it is not "zero opportunities" but a held judgment. Fix the measurement path |

A complete week is a week with no missing measurements in the planned weekly declarations, activities, CI, and observation inputs (an explicit declaration of zero opportunities is acceptable). Before implementation, do not demand value rates; continue the required tests. Expansion is judged per candidate; if several are eligible, use the order of the earliest real trigger, and if simultaneous, CtoC → BtoC → BtoB. The weekly budget also includes the support and recovery portions of preceding tests.

### 4.4 Calibration

| Target | Firing condition (per non-overlapping 28 days) | Next-version candidate |
|---|---|---|
| The Change Policy's standard times and E | At least 10 items per group each time. A p90 exceeding 125% of the standard twice in a row, or the median of actual minutes / initial E off in the same direction at `>1.5` or `<0.67` twice in a row | For times, first fix the largest waiting factor of parent §5, and if the next window also exceeds, round the p90 up to the hour. For E, the band-wise multiplication and 15-minute rounding-up of parent §5 |
| Classification-wise effort, diff cost, CI forecasts | In the same classification (for diffs, the same type), the initial forecast is positive and there are at least 10 completions per window, and `median(actual minutes / forecast minutes)` is off in the same direction at `>1.5` or `<0.67` twice in a row | Multiply that classification's budget coefficient by the latest median, and round the classification total up to the minute unit. Do not change the diff unit price and the class unit price at the same time |
| Forecasts of value rates | At least 10 target opportunities per window on the same route, and the measured minus forecast rate has the same sign and an absolute value over 0.20 twice in a row | In the next-version candidate, `next window's forecast rate = clip(most recent rate + latest rate error / 2, 0, 1)`. Do not change the definition of success or the natural-opportunity denominator |
| Candidate resource thresholds | At least 10 forecast/actual pairs per window. The ratio of cases where the forecast was at or below the candidate threshold but the actual exceeded 125% of the threshold is over 20% in 2 consecutive windows | As a reserve, lower the candidate's forecast allowance cap to 90% of the old threshold (integer points). Do not relax the weekly budget, preservation tests, or the minimum evidence count |

If a ratio's denominator is 0 or measurements are missing, report the number of exclusions. If the missing rate of the target metric exceeds 10%, fix the recording path first. In a window with insufficient counts, change no figures, and the consecutive condition does not hold. A quantile is the `ceil(pn)`-th value in ascending order. If there are multiple candidates, submit only one, in the order of parent §6 — safety → missing measurements → waiting → effort — and after that in the order of value rates and candidate thresholds. Owner confirmation under the old rules, a minor version, the re-judgment difference over the most recent 28 days, and a 28-day trial on newly started work only are mandatory. Adopt only if, with at least 10 items each under the old and new rules, the target error (for rates, the absolute rate error; for resource thresholds, the overrun approval ratio) decreases, and the 14-day-observed regression rate and owner minutes per completed promise do not increase. If insufficient, extend by 28 days only; if still insufficient or not established, revert. Wait for the final 14-day observation.

## 5. Frontend / Backend Selling Points

"Expansion" is the direction of increasing uses and use situations; "contraction" is the direction of narrowing operations, dependencies, and failure scope. Each row has one main allocation. **Everything below is unverified.** The references in the table are design grounds, not proof. To switch something to demonstrated, attach, row by row, the owner acceptance for the target version or execution evidence from a fictional sample. A technical demonstration alone leaves demand unverified.

| Side / point | Basis | Main allocation and reason | Current state |
|---|---|---|---|
| FE Input | P W2, SPEC-002, 004, REQ-003 | Contraction: reduce required fields and the redoing on failure. Does not claim to shorten cross-device transcription time | Unverified |
| FE Search | P W2, R Schedule, SPEC-011 | Expansion: old records can also be searched using fragments, titles, and notes as clues | Unverified |
| FE Copy with source | P W2 & 4, R Spread, SPEC-012 | Expansion: can be used in manuscripts and conversations outside the reading screen | Unverified |
| FE Review | P W3, SPEC-013 | Contraction: limit the burden with hiding, a cap, and exclusions. Adding re-reading occasions is secondary | Unverified |
| FE Display | P W4, SPEC-017, 018 | Contraction: with 50-item display, interruption, and restriction indications, the main path remains even at large scale | Unverified |
| BE SQLite canonical copy | P Data, SPEC-003–005 | Contraction: make the canonical copy and the save finalization point one, and prevent related corruption | Unverified |
| BE Backup / restoration | P Data, R Schedule, SPEC-006–008 | Contraction: limit the loss scope to verified recovery points. The same disk is not a countermeasure against device loss | Unverified |
| BE Markdown round-trip | P W1 & 4, SPEC-009, 015, 016 | Expansion: readable assets can be moved to another environment. Reducing app dependence is secondary | Unverified |
| BE FTS5 index | P W2, SPEC-011 | Expansion: increases the Japanese exploration paths. Short terms use a separate path; the index is not the canonical copy | Unverified |
| BE Migration | P W1 & 4, SPEC-010, 015, 016 | Contraction: limit the damage of a change with halt-on-failure and no overwriting on conflict | Unverified |
| BE localhost boundary | P Purpose, R Schedule W5, SPEC-001 | Contraction: limit responsibility to a single PC and a single seat. Not a guarantee of a hosted service | Unverified |

## 6. Lifetime Forecasts for Verification

A lifetime is "until the next conditional re-verification, for what judgments that evidence can be used." Historical established cases are not erased, but application to the current version and current use expires on a deadline or a change of premises. Everything in the table below is an **initial forecast**; a mere statement that a mechanism or asset already exists does not start the clock. For technical assets, start first with an inventory of the actual item, version, and tests; for demand, start from observation of actual opportunities.

| Form / asset | Until verification (clock start → required observation) | Period it can be maintained / renewal | Expiry / branching |
|---|---|---|---|
| Owner single seat | Deployment and restoration acceptance → established as a case by natural saves in W5–8 and a later `Q_new ≥ 1`. If only `Q_old ≥ 1`, it is an archive case | The 28 days after the latest useful reference are the evidence window for the current use; renewed by the next reference of the same kind | No opportunity means unknown frequency; the W8 → M3 branch. A device change or a transcription deferral triggers re-judgment of the input path |
| CtoC deliverable | A natural conversation → provision of an appropriate deliverable → the recipient's own `Xc ≥ 1` is the first verification point. The arrival of a reply deadline is not success | For 28 days after re-use, it is grounds for a candidate deliverable of the same kind. Renewed by the next independent use | If use is unconfirmed, the quotation conditions change, or the source is insufficient, do not carry it over to the next use. It is not evidence for the number of seats |
| BtoC standalone edition | Deploy to one eligible seat → `Xp ≥ 1` at a real reference at a later date. The required period runs from deployment until a natural need arises | For 28 days from a re-reference under the same conditions, and while it can be restored in that version | Expires on proxy operation by the owner, a change of device or library format, or unrecoverability. To the next-seat condition at M6 |
| BtoB single-seat edition | Identify the recent work, decide the permission and the person responsible for recovery → after introduction, `Xb ≥ 1` in a separate real task | For 28 days from the latest business re-use, while the same permission, responsible person, and repeated work continue | Expires on permission withdrawal, absence of the responsible person, shared editing becoming mandatory, or disappearance of the work. Not renewed by organizational interest |
| Saving mechanism | Until the save, failure, and restart tests at the target SHA are complete | While the same save contract, version, and environment hold. Re-test at each release | Expires immediately on a change to the ID, the finalization point, or the DB location, or on a mismatch |
| Restoration mechanism | Verified copy → comparison with the canonical copy in a different directory | Until the next deadline of the monthly drill. For new records, check external-copy freshness weekly | On drill failure, a media change, or insufficient recovery points, the relevant guarantee expires and updates etc. are stopped |
| Search mechanism | Until the fixed expected IDs and the match before and after rebuild at the target version | While the same SQLite, index, and search implementation hold. Re-test at each change | Expires on an in-text-term or short-term miss, or a version change. Passing a test is not a natural reference success |
| Markdown round-trip mechanism | Until the empty-DB round-trip, conflict, and interruption tests of all canonical records | While the same format version and corresponding state set hold | Expires on an addition to, or an omission from, the states or format, or on destruction of the original text; re-verify the samples of the old and new versions |
| Accumulated notes asset | Confirm existence and evacuatability locally → a practical case by the old notes' `Q_old ≥ 1` | Evacuation and restoration are monthly; practicality is renewed separately by natural old-note use in the most recent 28 days | If unrestorable, it is a preservation failure. No reference is not the disappearance of the asset but unverified current value. Insufficient source means the use is not established even if the search succeeds |

External influence is shown by `Xc, Xp, Xb` per route. Do not transfer one route's verification period to another route. If the frequency of opportunities is unknown, forecast "days until verification = undecided; next observation = the necessary conditions in the table."

## 7. Transfer of Information and Know-how

What is carried out is in units of verified **procedures, fictional samples, and tallies**. Distinguish a deliverable that a reader legitimately shares through the product's CtoC function from evidence that the operator carries into the next business. Do not record the former as-is into the latter.

| Type | Original record → transfer destination | Next candidate / application conditions | What is not carried in |
|---|---|---|---|
| Input path / burden | Local log → per-medium tallies in `docs/evidence/capture/`. Transcription and app time are separated | BtoC, other products: can explain the condition under which material reaches the PC and the device differences | Passages, book titles, personal device names and paths, the original log |
| Restoration operations / pre-update stop | Records on private media → fictional DB tests and versioned procedures in `docs/evidence/recovery/` | BtoC, BtoB, other products: the same storage contract, and a designated person responsible for recovery | The owner's DB, WAL, backups, media identification information |
| Search failure classification / round-trip | Local events → independent fictional samples in `tests/fixtures/`, `docs/evidence/search/` | Archive, BtoC, BtoB: distinguishes unsaved / insufficient source / search miss, and reproduces at the target version | Actual search terms, quotations, old notes, actual sources |
| Operation of value and thresholds | `docs/metrics.yml` → tallies with denominators and policy versions in `docs/evidence/model/` | All routes, other products: the opportunity definitions and resource units match. If they differ, carry only the formulas and the measurement instruments, and start the figures as uncalibrated | Details that could identify the owner by a combination of seat and date/time, market extrapolation of personal use |
| Sharing / negotiation / deployment | Private contact records → anonymized condition sheets in `docs/evidence/pilots/`, with support minutes, recovery responsibility, and whether there was actual re-use | CtoC only under appropriate sharing conditions; BtoC only an independent device; BtoB only under the same conditions with saving permission and a responsible person | The other party's contact details, business materials, actual shared files, negotiation history, inferences about willingness to pay |
| Demo / implementation know-how | Private repo → fictional demos with the target SHA, reproduction procedures, limited snapshots | All routes: check the candidate version's test results and the list of files that can be made public | Automatic publication of the whole implementation repo history, secret information, "success" evidence that was never executed |

### The transfer gate

1. `evidence_ok` = the target SHA, reproduction procedure, result, denominator, and unverified items are all in place, and it consists only of fictional samples or tallies that cannot be re-identified. External transmission requires owner confirmation for the transmission scope, without exception. For a small group that cannot be anonymized, do not take the figures outside; make only the procedure a candidate.
2. `route_ok` = for CtoC, an actual conversation and a deliverable that can be shared appropriately; for BtoC, the need for PC material and local search, and the owner's own device and restoration procedure; for BtoB, all of: a recent repeated check, a permitted device, a person responsible for recovery, and single-seat fit. For another product, the acceptance conditions — a SPEC, REQ, target environment, and fictional sample corresponding to the procedure being carried in — must be registered. Do not transfer the demand of Margin's users to another product.
3. `capacity_ok` = all of the owner value, resource, window, and stage conditions of the expansion row of §4.3 are true. Include the candidate's support, deployment, and re-verification costs in the next week's forecast. Do not require, for the first external test, that route's **ex post** success. For the next seat, an unaided re-reference under the same conditions is also necessary; for BtoB, business re-use and a still-valid person responsible for recovery are also necessary.
4. `start = evidence_ok AND route_ok AND capacity_ok AND NOT blocked`. If all conditions are true, start only one candidate and one test, and record the starting point, the forecast, and the stop conditions. If even one is `false` or `unknown`, the judgment is **"not at a stage where it can be carried in,"** and the missing fields are left in `decisions`. Do not count transmissions, installations, or numbers of approaches as successes.

## Differences from the Existing Policy

The Change Policy's contracts, the size formula `E`, the merge lanes, stop/release, owner confirmation, version revision, and the establishment conditions of `maintenance` / `retired` are not changed. What this document adds is the work purpose and per-diff budgets, resource points, value metrics whose denominator is natural opportunities, and **the conditions for permitting arbitrary additional investment**. A single useful case on the roadmap remains as an established case, but that alone does not open an expansion budget. Because the investment judgment for maintenance and the repo state transition are recorded separately, even if archive maintenance is chosen, monitoring is not suspended before the 56-day condition is satisfied. If an input conflicting with the parent policy is found, apply the parent policy, and record the conflicting place as a policy revision request.
