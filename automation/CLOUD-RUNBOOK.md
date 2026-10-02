# Cloud runbook — Kelly's Market Insights updates

This file is followed by the scheduled **cloud routines** (Claude Code in Anthropic's cloud, Linux, fresh checkout of this repo).
The routine prompt tells you the **slot**: `morning`, `afternoon` or `weekend`. Everything else is here.

Kelly Chan is a Malaysian **信托基金顾问 (unit trust consultant)**. Her public website
(https://kellychan84.github.io/your-wealth-compass/) shows all market news on ONE page, **市场洞察 Market Insights**
(`insights.html`). Since 2026-10-02 there are **no separate brief pages** — do not create anything in `briefs/`.
Each run adds one JSON file: a **今日速览 snapshot** plus one **insight card per news story**.

---

## 0. Setup
- Today's date in Malaysia: `TZ=Asia/Kuala_Lumpur date +%F` → `DATE`. Use Malaysia time for everything.
- If `insights/data/$DATE-$SLOT.json` **already exists**, stop and report "already published" — do not overwrite.
- Read, in full, before writing anything:
  - `automation/brief-rules.md` — **only the source rules** (whitelist / blacklist / verified-links-only, 第一步) and the voice
    guidance apply. Its HTML layout sections are retired; ignore them and `automation/brief-template.html`.
  - `insights/README.md` — the exact card format and writing rules. **Non-negotiable.**
- For context and to avoid repeating yourself, read the newest 2–3 files in `insights/data/` (afternoon: today's morning file).

## 1. Research
- Use WebSearch / WebFetch against **whitelist sources only**; never use Bloomberg, Axios or NPR.
- Every link must be a URL you actually fetched or saw in search results **in this run**. Never write a URL from memory.
- If a category has no whitelisted update, **leave it out entirely** — never write "no update / 暂无更新 / could not verify"
  anywhere, and never fill a gap with invented or stale numbers (Kelly's rule, 2026-10-01). Only publish what you actually have.

Coverage (Kelly, 2026-10-01 — cover news broadly): the Fed and US macro; **US** stories (Wall Street indices, major US
companies/earnings, US data and policy); **China** (economy and data, PBoC / yuan, China and Hong Kong stocks, Chinese companies,
US–China trade/tech); **Asian tech & semiconductors** (TSMC / Taiwan, Samsung and SK Hynix / Korea, Japanese chip and equipment
makers, China chip makers, Malaysia's semiconductor and data-centre sector, chip-stock moves, export controls, supply chains);
**oil and gold**; **Malaysia / ASEAN** (KLCI, ringgit, Bank Negara / OPR, local policy). FX168 is a good whitelisted source for
China and Asia news.

Slot focus:
- **morning** (time `${DATE}T09:00:00+08:00`): overnight Wall Street, Fed/yields, oil/gold, Asia open, Malaysia, big company news.
- **afternoon** (time `${DATE}T17:00:00+08:00`): what changed since this morning — Asia close / Bursa Malaysia (KLCI, USD/MYR),
  Fed odds, oil, news and earnings since the morning. Skip stories already carded this morning unless there is a real update.
- **weekend** (time `${DATE}T09:00:00+08:00`): the week in review (the week's key moves and 2–3 story lines — read this week's
  files in `insights/data/`), weekend news, and the week ahead (data, Fed events, earnings).

Voice: warm and professional, like explaining to a friend. Always say **信托基金顾问** and **信托基金** (never 理财顾问 / 单位信托).

## 2. Write `insights/data/$DATE-$SLOT.json`
A valid JSON array (no comments), exactly as specified in `insights/README.md`:
1. **First item: the 今日速览 snapshot** (`"kind": "summary"`, id `$DATE-m0` / `$DATE-a0` / `$DATE-w0`) — headline, 3–6 key
   figures that you verified this run, 2–3 bullet points, Kelly's view, and the sources.
2. **Then one card per news story** — morning and weekend **4–8 cards**, afternoon **3–6 cards**; ids `$DATE-m1…` / `$DATE-a1…` /
   `$DATE-w1…`. Every card has **all four** 🎯 boxes (`dda`, `prs`, `lump`, `bond`), each written for that specific story in
   both zh and en. Do not copy the same box text across cards.
- Do not add a `brief` field (there is no brief page any more).

## 3. Build and check
```bash
python3 tools/build_index.py
```
It must print `insights.js rebuilt with N insight cards` (N went up) and **no WARNING lines**. Every WARNING names the card and
the problem (missing box, label repeated in a box, banned word, "no update" wording…). Fix the JSON and rerun until it is clean.

## 4. Publish
Only `insights/` may change. If anything else shows in `git status`, do not commit it.
```bash
git add insights
git commit -m "Add $DATE $SLOT insights"
git push origin HEAD:main
```
GitHub Pages redeploys about a minute after the push to `main`.
If the push to `main` is rejected, push to a new branch instead (`git push origin HEAD:claude/insights-$DATE-$SLOT`) and say
clearly in the summary that it needs merging into `main` before it appears on the site.

## 5. Summary (final message)
- The snapshot headline and the card titles
- Number of cards added
- Push result: "live on the site" / "pushed to branch X, needs merge" / error details
- Categories left out because there was no whitelisted update (mention them here only, never on the site)
