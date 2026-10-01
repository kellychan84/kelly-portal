# Cloud runbook — Kelly's daily market brief

This file is followed by the scheduled **cloud routines** (Claude Code in Anthropic's cloud, Linux, fresh checkout of this repo).
The routine prompt tells you the **slot**: `morning`, `afternoon` or `weekend`. Everything else is here.

Kelly Chan is a Malaysian **信托基金顾问 (unit trust consultant)**. The briefs go on her public website
(https://kellychan84.github.io/your-wealth-compass/) for her clients and prospects.

---

## 0. Setup
- Today's date in Malaysia: `TZ=Asia/Kuala_Lumpur date +%F` → `DATE`. Use Malaysia time for everything.
- If `briefs/$DATE-$SLOT.html` **already exists**, stop and report "already published" — do not overwrite.
- Read, in full, before writing anything:
  - `automation/brief-rules.md` — source whitelist/blacklist, verified-links-only policy, content categories, layout rules, self-check list. **These rules are non-negotiable.**
  - `automation/brief-template.html` — the exact HTML/CSS template. Reuse it; only replace content.
  - `insights/README.md` — rules for the insight cards.

## 1. Research (per brief-rules.md)
- Use WebSearch / WebFetch against **whitelist sources only**; never use Bloomberg, Axios or NPR.
- Every link you put in the brief must be a URL you actually fetched or saw in search results **in this run**. Never write a URL from memory.
- If a category has no whitelisted update, **leave it out entirely** — no card, alert, scorecard cell or takeaway saying "no update / 暂无更新 / could not verify" (Kelly's rule, 2026-10-01). Never fill the gap with invented or stale numbers either. Only publish what you actually have.

Coverage (Kelly, 2026-10-01 — cover news more broadly): besides the Fed, tech/AI, oil/gold and Malaysia, actively look for
**US** stories (Wall Street indices, major US companies/earnings, US economic data and policy) and **China** stories (China
economy and data, PBoC / yuan, China and Hong Kong stocks, Chinese companies, US–China trade/tech), and **Asian tech &
semiconductors** (TSMC / Taiwan, Samsung and SK Hynix / Korea, Japanese chip and equipment makers, China chip makers, Malaysia's
semiconductor and data-centre sector, Asian chip-stock moves, export controls and supply chains). FX168 is a good whitelisted
source for China and Asia news. Same rules apply: whitelist sources only, and if there is no real update for a region, leave it out.

Slot-specific focus:
- **morning** (masthead 9:00 AM MYT, sub-line "本周回顾 + 每日早报 · Weekly Recap & Daily Brief"): full brief with all sections.
- **afternoon** (5:00 PM MYT, sub-line "午后新进展 · What's Changed Since This Morning"): first read `briefs/$DATE-morning.html`
  (or the newest morning file). Focus on what changed since the morning: Asia close / Bursa Malaysia (KLCI, USD/MYR), Fed odds, oil,
  news and earnings since the morning. Top alerts state the change ("from this morning's X to Y"). Shorter, but keep Kelly's Takeaways.
- **weekend** (9:00 AM MYT, sub-line "周末版 · 本周回顾与下周展望 · Weekend Edition · Week in Review & Ahead"): the week's key moves in the
  scorecard (US indices, KLCI, USD/MYR, Treasury yields, oil, Fed odds), the week's 2–3 story lines (read this week's files in `briefs/`
  for context), weekend news, and a week-ahead look (data, Fed events, earnings).

Voice (short version of Kelly's style guide): warm and professional, like explaining to a friend. Always say **信托基金顾问** and
**信托基金** (never 理财顾问 / 单位信托). Turn market news into "what this means for your wallet, retirement and children's education".

## 2. Write the brief
- Write the finished HTML to `briefs/$DATE-$SLOT.html` (there is no Artifact publishing in the cloud — the website is the destination).
- `<title>`: e.g. `Oct 1 Morning Brief`, `Oct 1 Afternoon Check`, `Oct 3 Weekend Brief`.
- The language toggle must really work (zh-t / en-t classes + the template's `setL` function).
- **No WhatsApp copy/share section** (no waZh/waEn message, no copy buttons) — Kelly removed it from the website. The brief ends after Kelly's Takeaways + disclaimer. (`add_brief.py` also strips it as a safety net.)
- Run the self-check list from brief-rules.md. Fix anything that fails before continuing.

## 3. Insight cards
Write `insights/data/$DATE-$SLOT.json` — a valid JSON array (no comments) of cards, following `insights/README.md` exactly:
- morning: 2–4 cards, ids `$DATE-m1…`, time `${DATE}T09:00:00+08:00`
- afternoon: 2–3 cards (skip stories already carded this morning unless there is a real update), ids `$DATE-a1…`, time `${DATE}T17:00:00+08:00`
- weekend: 2–4 cards, ids `$DATE-w1…`, time `${DATE}T09:00:00+08:00`
- `brief`: `"$DATE-$SLOT.html"`. Facts and `source.url` only from the brief you just wrote.
- 🎯 DDA / Lump Sum / PRS = general education. No allocation percentages, no "split into N tranches", no buy/sell calls on named funds
  or stocks, no promissory words (保证 / 稳赚 / 必涨 / 牢不可破 / 封死下行空间 / guaranteed / unshakeable).

## 4. Build
```bash
python3 tools/add_brief.py briefs/$DATE-$SLOT.html $DATE $SLOT
```
Check the output: `briefs.js rebuilt with N briefs` (N went up by one), `insights.js rebuilt with M insight cards` (M went up), and
**no WARNING lines**. Open `briefs/briefs.js` and confirm the first entry is today's file with a real `headlineZh`/`headlineEn`
(not just the title). If not, add `<meta name="kp-headline-zh" content="...">` and `<meta name="kp-headline-en" content="...">`
to the brief's `<head>` and rerun.

## 5. Publish
Only these paths may change: `briefs/` and `insights/`. If anything else shows in `git status`, do not commit it.
```bash
git add briefs insights
git commit -m "Add $DATE $SLOT brief"
git push origin HEAD:main
```
GitHub Pages redeploys the site about a minute after the push to `main`.
If the push to `main` is rejected, push to a new branch instead (`git push origin HEAD:claude/brief-$DATE-$SLOT`) and say clearly in
the summary that it needs merging into `main` before it appears on the site.

## 6. Summary (final message)
- Brief file + the 2–3 top headlines
- Insight cards added (count)
- Push result: "live on the site" / "pushed to branch X, needs merge" / error details
- Categories left out of the brief because there was no whitelisted update (mention them here only, never on the site)
