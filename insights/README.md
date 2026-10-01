# Insight cards (市场洞察 feed) — rules for writing them

Every morning / afternoon / weekend brief adds **2–4 insight cards** to the feed at `insights.html`.
One JSON file per brief: `insights/data/<YYYY-MM-DD>-<morning|afternoon|weekend>.json` (a JSON array).
Then run `tools\build-index.ps1` (add-brief.ps1 already runs it) to rebuild `insights/insights.js`.

## Source rules (same as the daily brief — non-negotiable)
- Every fact, number and quote must come from **that day's brief**, which only uses verified whitelist sources.
- `source.url` must be the exact "阅读全文" link of the brief's news card the insight is based on. Never invent or alter URLs.
- No new research in this step — the card is a re-packaging of the brief, not new reporting.

## Writing rules (Kelly's decision, 2026-09-30)
- 🎯 boxes are **general educational perspectives**, not personal advice.
- **No specific allocation numbers** ("put 5–10% in…", "split into 3 tranches"), no buy/sell calls on named funds or stocks.
- **No promissory or absolute language**: avoid 保证 / 稳赚 / 必涨 / 牢不可破 / 封死下行空间 / "guaranteed" / "can't lose" / "unshakeable".
- Lump Sum box: principles only (phasing in to spread timing risk, check concentration, match to goals and risk tolerance).
- PRS box: may mention the PRS tax relief of up to RM3,000 a year.
- Analysis (💡): 2–4 sentences — what happened (with the brief's numbers), why it matters; one everyday analogy is welcome, keep it short.
- Bilingual: every text field has `zh` and `en`. Tone: Kelly's warm-professional voice.
- **Never make a card about missing data** ("no update", "暂无更新", "could not verify"), and don't mention gaps inside a card (Kelly, 2026-10-01). Only card real news.

## Schema
```json
{
  "id": "2026-10-01-m1",                    // <date>-<m|a|w><n>, unique
  "time": "2026-10-01T09:00:00+08:00",      // brief time, Malaysia time
  "brief": "2026-10-01-morning.html",       // file in briefs/
  "tags": ["fed", "us"],                    // 1–3 of: my, us, cn, tech, commodities, fed
  "title":    { "zh": "...", "en": "..." },
  "analysis": { "zh": "...", "en": "..." },
  "dda":      { "zh": "...", "en": "..." },
  "lump":     { "zh": "...", "en": "..." },
  "prs":      { "zh": "...", "en": "..." },
  "source":   { "name": "Investing.com", "url": "https://..." }
}
```
Tags: `my` 🌏 马来西亚/东盟 · `us` 🗽 美国 · `cn` 🏮 中国 · `tech` 💻 科技与AI · `commodities` 🟡 黄金与原油 · `fed` 🏦 美联储与宏观. (No `prs` tag — Kelly removed it 2026-10-01; every card still has its 🎯 PRS box.)

- `us`: US stock market (Dow / S&P 500 / Nasdaq), US companies and earnings, US economy and policy (tariffs, Treasury, jobs, consumers). Fed decisions keep `fed`; add `us` too when the story is about US markets.
- `tech`: global tech/AI **including Asian tech & semiconductors** (TSMC, Samsung, SK Hynix, Japanese/Chinese chip makers, Malaysia's semiconductor and data-centre sector). Add `cn` or `my` too when the company/market is Chinese or Malaysian.
- `cn`: China and Hong Kong — Chinese economy and data, PBoC / yuan, China and HK stocks, Chinese companies, US–China trade and tech relations.
