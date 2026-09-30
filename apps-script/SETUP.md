# Lead capture setup (Google Sheet + email alerts)

1. Go to **sheets.google.com** → create a blank spreadsheet → name it **Website Leads**.
2. In the sheet: **Extensions → Apps Script**.
3. Delete the sample code, paste in everything from `Code.gs` (this folder), and click **Save** 💾.
4. Optional: put your alert email in `NOTIFY_EMAIL` at the top (blank = the Google account you're signed in with).
5. Test it: choose `testLead` in the function dropdown → **Run** → approve the permissions Google asks for
   (it says "unverified app" because it's your own script: **Advanced → Go to project**).
   A `Leads` tab with a TEST row should appear, and you should receive an email.
6. **Deploy → New deployment** → gear icon → **Web app**
   - Description: `website leads`
   - Execute as: **Me**
   - Who has access: **Anyone**
   → **Deploy** → copy the **Web app URL** (ends in `/exec`).
7. Paste that URL into `leadEndpoint` in `assets/config.js`.
8. Delete the TEST row from the sheet.

**If you edit `Code.gs` later**: Deploy → Manage deployments → ✏️ → Version: *New version* → Deploy.
The URL stays the same.

### Working the leads
- The **WhatsApp link** column opens a chat with the lead in one click.
- Use the **Status** column (New → Contacted → Booked → Client) as a simple pipeline.
- **Gap** and **Required monthly** tell you, before the first call, how big the shortfall is.
