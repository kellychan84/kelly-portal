# Lead capture setup (Google Sheet + email alerts) · about 10 minutes

Use the **same Google account as your booking calendar** (kelly.chan1413@gmail.com), so everything is in one place.

## 1 · Create a blank sheet
Go to **sheets.new** (or sheets.google.com → Blank). Rename it at the top-left to **Website Leads · Kelly Chan**.
Leave it empty; the script builds everything.

## 2 · Paste the script
1. In the sheet menu: **Extensions → Apps Script**.
2. Delete the sample `function myFunction() {}`.
3. Open `Code.gs` from this folder (Notepad is fine), **Ctrl+A, Ctrl+C**, then paste into the Apps Script editor.
4. Click **💾 Save**. Name the project `Website Leads` if asked.

## 3 · Build the sheet (one click)
1. In the toolbar's function dropdown pick **setupSheet** → **▶ Run**.
2. Google asks for permission → **Review permissions** → choose your account →
   "Google hasn't verified this app" → **Advanced** → **Go to Website Leads (unsafe)** → **Allow**.
   (It says "unverified" only because it's your own script. It can only touch this sheet and send you email.)
3. Back in the sheet you'll now have:
   - **Leads** tab: gold header row, frozen name columns, RM number formats, and a **Status** dropdown
     (New → Contacted → Booked → Met → Client / Not now) with colours.
   - **Summary** tab: total leads, last 7 days, this month, leads by source, consultation requests,
     average retirement gap, and your pipeline counts. Updates automatically.

## 4 · Test the email alert
Pick **testLead** → **▶ Run**. A "Test Lead" row appears and you get an email titled *"🔔 New website lead: Test Lead"*.
Then delete that row in the sheet.

## 5 · Put it online
1. **Deploy → New deployment** → click the ⚙️ gear → **Web app**.
2. Description `website leads` · Execute as **Me** · Who has access **Anyone** → **Deploy**.
3. Copy the **Web app URL** (ends in `/exec`) and send it to Claude, or paste it into `leadEndpoint` in `assets/config.js`.

---

**If `Code.gs` changes later:** paste the new code → Save → **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.
The URL stays the same.

**Working your leads:** click the **WhatsApp link** column to message someone instantly, and update **Status** as you go.
Before the first call, check **Gap** and **Required monthly** to see how big their shortfall is.
