# Kelly Chan · Wealth Insights website

A static website (no server to maintain) with:

| Page | What it does |
|---|---|
| `index.html` | Home: latest briefs, calculator promo, about, booking CTA |
| `briefs/` | Archive of every daily brief (morning / afternoon / weekend), filterable |
| `calculator.html` | Public retirement gap calculator. Shows the gap for free, and the full report (chart + required monthly savings) after name / phone / email |
| `book.html` | Consultation request form, then a Google Calendar booking page, with a WhatsApp fallback |
| `privacy.html` | PDPA privacy notice (linked from every consent box) |

Leads from both forms land in a **Google Sheet**, and you get an **email alert** for each one.

---

## Go-live checklist (one-time, ~30 minutes)

### 1. Lead capture → Google Sheet
Follow [`apps-script/SETUP.md`](apps-script/SETUP.md). You'll get a Web App URL.

### 2. Booking page → Google Calendar
1. Open Google Calendar on a computer → **Create** → **Appointment schedule**.
2. Set it up (e.g. "Free 30-min consultation", your available hours, Google Meet on).
3. Save → open the schedule → **Share** → copy the **booking page link**.

### 3. Fill in `assets/config.js`
```js
leadEndpoint: 'https://script.google.com/macros/s/XXXX/exec',
bookingUrl:   'https://calendar.google.com/calendar/appointments/schedules/XXXX',
whatsapp:     '60123456789',        // digits only, with country code
contactEmail: 'you@example.com',    // optional
licenceLine:  'FIMM Reg. No. ... · Distributor: ...'   // optional
```

### 4. Publish on GitHub Pages
1. Create a free account at github.com, then a **new public repository**, e.g. `your-wealth-compass`.
2. On the repository page: **Add file → Upload files** → drag in *everything inside this folder* → **Commit**.
   (Or install **GitHub Desktop** and publish this folder. That makes daily updates easier.)
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / root → **Save**.
4. After ~1 minute your site is live at `https://<your-username>.github.io/your-wealth-compass/`.
5. Optional: buy a domain (e.g. `kellychan.my`) and add it under **Settings → Pages → Custom domain**.

---

## Adding a new brief

When a new brief is published, save its HTML file and run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\add-brief.ps1 -Source "C:\path\to\brief.html" -Date 2026-10-01 -Slot morning
```

`-Slot` is `morning`, `afternoon` or `weekend`. The script copies the file into `briefs/`, adds the site bar and
call-to-action, and rebuilds the index. Then upload/commit the changed files (`briefs/<new file>.html` and `briefs/briefs.js`).

Or simply ask Claude: *"add today's morning brief to the website"*.

To override the headline shown on the card, add to the brief's HTML:
```html
<meta name="kp-headline-zh" content="中文标题"><meta name="kp-headline-en" content="English headline">
```

## Previewing locally
```powershell
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```
Then open http://localhost:8080.

## Customising
- **Photo**: put `kelly.jpg` in `assets/` and follow the comment in the About section of `index.html`.
- **Text**: every piece of copy is in the HTML as a `<span class="zh">` / `<span class="en">` pair.
- **Calculator defaults and assumptions**: the `value="..."` attributes in `calculator.html`.
