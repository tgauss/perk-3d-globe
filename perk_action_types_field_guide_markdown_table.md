# Perk Action Types — Field Guide (Markdown Table)

> **Source of truth:** `participant_actions` — each row is an activity that happened in Perk. Use this guide to map action types to human meaning, points behavior, and reporting.
>
> **Note:** In your current program, **29 (quiz_result)** is the highest-value quiz event; use it as the authoritative completion when both 6 and 29 occur.

---

## Canonical Action Types (Observed & In-Use)

| ID | Key (slug) | Human Label | Origin | Typical Trigger / Example | Points Behavior | Notes & Context |
|---:|---|---|---|---|---|---|
| 0 | `sign_up` | Signed Up | System / Challenge | New user registers via UI or sign-up challenge | Often +points (program rule) | Distinct from API-created users (type 21) |
| 1 | `sign_in` | User Signed In | System | Login, magic link, wallet pass session | Usually 0 | Proxy for DAU/WAU when paired with other actions |
| 2 | `connect` | Connected Social Account | Challenge | Link social identity | Usually +points | Legacy/limited in newer programs |
| 3 | `watch_video` | Watched a Video | Challenge | Completed a video-view challenge | +points per challenge | Use for education/awareness reporting |
| 4 | `visit_url` | Visited a URL | Challenge | Click-through to partner or campaign page | +points or 0 (config) | Great for UTM/campaign attribution |
| 5 | `read_article` | Read an Article | Challenge | Completed an article-read challenge | +points per challenge | Content engagement metric |
| 6 | `quiz` | Submitted a Quiz | Challenge | Completed quiz submission | +points per challenge | Use 29 as definitive completion when both fire |
| 7 | `survey` | Submitted a Survey | Challenge | Profile/feedback survey submit | +points (often higher) | Profile enrichment; drive segmentation |
| 8 | `share` | Shared a Post | Challenge | Social share event | +points or 0 | Older flows; may be inactive in current program |
| 9 | `recruit` | Recruited a Sign-Up | Challenge / System | Referral completes registration | +points (often high) | Credit referrer; combine with referral code |
| 10 | `onboarding_questions` | Completed Account Setup | Challenge | First-time onboarding Q&A | +points | Captures first‑party data |
| 12 | `feed` | Viewed Social/Feed Post | System / Challenge | Dynamic Feed view event | Usually 0 | Exclude from earning unless view‑points are configured |
| 13 | `reward` | Won/Claimed a Reward | Challenge / API / System | Prize claim, sweepstakes grant, achievement | May be 0 (grant) or paired with −points | Tie to liability & fulfillment workflows |
| 14 | `external_content` | UGC Contest Event | System / Content | UGC submitted/approved | +points or 0 | Pair with moderation; bonus awards optional |
| 16 | `purchase_proof_legacy` | Proof of Purchase (Legacy) | Challenge | Old receipt pipeline | +points per rules | Keep for historical continuity only |
| 19 | `import` | Program Import | System / API | Bulk data migration/backfill | 0 or varies | Segment separately from organic engagement |
| 20 | `challenge_completion` | Completed Custom Challenge | Challenge (custom) | Modular/embedded experiences (e.g., Faceoff) | +points per challenge | Generic catch‑all; use `title`/metadata for specificity |
| 21 | `create_user` | API: User Created | API | Created via integration/preload | 0 | Differentiate from UI sign‑up (type 0) |
| 22 | `points_update` | API: Points Added/Deducted | API | Earn bonus, promo, manual CS adjust, external redemption | + or − points | **Audit critical**: set `action_title` and `action_completion_limit` |
| 23 | `purchase_proof` | Proof of Purchase (Current) | Challenge + Receipts | Receipt image or structured order validated | +points per rules | Primary commerce KPI trail; use for revenue analysis |
| 24 | `tier_change` | Tier Achieved/Changed | System | Lifetime points crosses threshold | 0 | Trigger messaging, wallet updates, badges |
| 25 | `game_play` | Played a Game | Challenge / System | Mini-game spin, play, or result | 0 or +points (config) | Often paired with streak/bonus challenges |
| 27 | `email_click` | Email Link Clicked | Messaging | Tracked click from outbound email | 0 | Stronger intent than opens; good for re‑engagement |
| 29 | `quiz_result` | Quiz Result Submitted | Challenge | Score/result processed for a quiz | +points per scoring rules | **Authoritative** for quiz completion & badges |
| 26 | `unknown` | Unknown (Program‑Specific) | System | Low‑volume experimental logging | varies | Keep tracked; don’t build logic until defined |
| 28 | `unknown` | Email Open (Observed) | Messaging | Open pixel event (inferred) | 0 | Treat as directional; prefer clicks (27) for intent |

---

## Reserved / Unused Codes (in current export)

These had no observed activity in your export. Safe to ignore unless intentionally activated later.

| ID Range | Keys (examples) | Notes |
|---|---|---|
| 11 | `location_visit` | Would represent on‑site check‑ins; unused in current program |
| 17–18 | `purchase_points_legacy`, `shared_link_click` | Legacy/experimental; not in active use |
| 30–50 | (undefined) | Reserved/unknown; all zeros in export |

---

## Reporting Tips & Examples

- **Quizzes:** If both **6** and **29** are present, count **29** as the definitive completion; use **6** for attempts.
- **Receipts:** Prefer **23** for modern commerce KPIs; keep **16** for historical reports.
- **Off‑platform earns:** Use **22** with clear `action_title` (e.g., “External Redemption −1000”).
- **High‑volume views:** Exclude **12 feed** from “earning actions” unless configured with view points.
- **Imports vs. organic:** Bucket **19 import** separately to avoid inflating engagement.
- **Deduping:** For one‑time earns, enforce via challenge rules & API `action_completion_limit`. In analytics, dedupe by `(participant_id, action_type, challenge_id[, day])` where appropriate.

---

## Copy‑Paste Buckets (quick reference)

```
Core account:         0 sign_up, 1 sign_in, 21 create_user
Content/education:    3 watch_video, 5 read_article, 4 visit_url, 12 feed
Quizzes/surveys:      6 quiz, 29 quiz_result (authoritative), 7 survey, 10 onboarding_questions
Social/referral/UGC:  2 connect, 8 share, 9 recruit, 14 external_content
Commerce/receipts:    23 purchase_proof (current), 16 purchase_proof_legacy
Games:                25 game_play
Rewards/tiers:        13 reward, 24 tier_change
System/data ops:      19 import, 20 challenge_completion (custom), 22 points_update
Messaging:            27 email_click
Unknown observed:     26 unknown, 28 unknown (email open)
Reserved/unused:      11, 17–18, 30–50
```

