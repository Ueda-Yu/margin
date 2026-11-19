# Margin — Post-Week 4 Deployment and Usage Plan

**In Week 5, I’ll put Margin on my own reading PC as my working notebook.** The first deployment is one reader on one machine, not a hosted beta. By the end of Week 8, I’ll report what happened to a passage between two real occasions: the day I wanted to keep it and a later day when I wanted its wording or source back. If that second occasion hasn’t happened, I’ll say so rather than count a test search as demand.

### Who this is for

**Evidence.** In [Pew Research Center’s 2021 U.S. survey](https://www.pewresearch.org/short-reads/2022/01/06/three-in-ten-americans-now-read-e-books/), 75% of adults said they had read at least part of a book in the previous year; the median was five books. That makes a daily-use target hard to justify from reading volume alone. [Readwise documents an existing Kindle-highlight import workflow](https://readwise.io/kindle): readers can bring passages out of a reading environment for later use. That establishes a concrete workflow, not how many readers sustain it. Neither source measures demand for a local PC notebook.

**Working hypothesis.** Margin’s first user is a reader who sometimes needs an exact passage and its source weeks later, and who can already get that passage onto a PC without a separate transcription chore. I’m the first candidate, not a confirmed match. The Week 1 device check and Week 2 capture timings will matter more for that judgment than the survey. If my useful material is mostly in old Markdown notes, I’ll test Margin as a searchable archive rather than assume I need a new capture habit.

### Deployment and decision schedule

| When | Work | What I’ll do and how I’ll judge it |
|---|---|---|
| **Week 5** | **Deployment** | I’ll install the tested production build on my PC, bound only to localhost, with the database outside the release directory. I’ll add a launcher that starts the app and opens the capture page, then verify it after a reboot. I’ll copy a verified SQLite backup to an external drive, restore it to a separate directory, and open a Markdown export in an ordinary editor. No account, public URL or cloud sync is required. |
| **Weeks 5–8** | **Continued use** | When I encounter a passage worth keeping, I’ll use the launcher, paste it under the current book, add a page or location if useful, and save. When writing or discussing a book, I’ll search by remembered wording or title and copy the passage with its source. Review stays optional. Once a week, I’ll make a short local note of actual opportunities: captured, skipped and why, found later, or not found. A week with no relevant reading or lookup is not a failure. |
| **End of Week 8** | **Usage decision** | I’ll report a real capture and later retrieval if one occurred, including the age of the note, what prompted the lookup, and whether the source was sufficient. I’ll distinguish retrieval of an imported note from retrieval of a newly captured one: the former supports the archive use case, not necessarily the capture habit. If there was no lookup opportunity, I’ll keep the archive available and revisit the question at Month 3 without expanding the pilot. |
| **Months 3–6** | **Maintenance and conditional spread** | I’ll check the latest off-device copy weekly while making changes, run a separate-directory restore drill monthly, and take a verified snapshot before upgrades. If personal use produces a useful retrieval, I’ll try the smallest relevant external test below. At Month 6, I’ll report external reuse, repeat installations and organizational interest separately. If the notebook only helps me, keeping it reliable for one reader is a valid outcome. |

**What would break the plan.** If I skip two passages I wanted to keep because they are on paper or a phone, I’ll record the transfer time separately from the app’s 15-second capture target. That is a reason to reconsider the input route, not polish the paste box. If a real lookup fails, I’ll check whether the passage was never saved, lacks a usable source, or exists but search missed it. Those require different fixes. If a weekly check finds new notes but no current verified off-device copy, I’ll make and check one before upgrading or importing in bulk. A failed integrity check stops writes; I won’t replace a suspect database with an empty one.

### Where it could spread, ranked by likelihood

This ranking is a hypothesis about **how much behavior must change**, not a market-size forecast. The evidence supports an existing passage-keeping workflow; it does not establish willingness to install software, pay for it, or procure it for a team.

| Rank and route | Prerequisite and first step | Likely obstacle and evidence worth counting |
|---|---|---|
| **1. CtoC — one reader passes a useful note to another** | A passage comes up in an actual conversation. I’ll send just my commentary, the citation, and a short excerpt where appropriate, as plain Markdown. The recipient needs no app. | A file sent is not a file used. I’ll count a recipient using the citation or note for their own purpose. This is the likeliest spread of **output**, not evidence of another Margin user. |
| **2. BtoC — a standalone local edition for another reader** | A reader already keeps PC-accessible highlights or Markdown notes and wants local search. I’ll offer one such reader the tested build, launcher and restore guide for their own machine and library. | Installation and transfer compete with the reader’s existing tool. The signal is an independent return to find a real passage after setup, not a download. Willingness to pay remains a separate question. |
| **3. BtoB — a single-seat reference notebook for an editor or researcher** | One staff member has a recurring citation task, permission to store the material locally, and no need for shared editing. I’ll first ask them to identify a recent lookup that cost time; only then would I propose a pilot on an approved machine. | Device policy, backup ownership or a need for shared access may rule it out. I’d look for a repeat lookup in actual work and an agreed owner for recovery before proposing any wider rollout. |

The Week 8 deliverable is a deployment I can recover and an account of what I actually kept, skipped and needed again. That gives us a decision even if the answer is “useful private archive,” rather than “launch a service.”
