# Document Generation API — Announcements & Obituaries

Create backend API endpoints and a frontend page that allow users to generate beautifully formatted **funeral announcements** and **obituary documents** from existing funeral project data.

## What This Adds

- **Announcement Generator**: A formal death/funeral announcement document with deceased details, funeral date/time/venue, family message, and committee contacts.
- **Obituary Generator**: A full obituary document with biography, life details, tribute message, and funeral arrangements.
- Both are generated as styled **HTML documents** that can be printed or saved as PDF directly from the browser (`Ctrl+P` / `window.print()`).
- A new **"Documents"** management page with a premium UI to preview and generate these documents.

---

## Proposed Changes

### Backend — Controller & Route

#### [NEW] [documentController.js](file:///d:/School/Strathmore%20Uni/Y%202.1/ICS2102%20-%20Web%20Application%20Development/Group%20Project/Faraja%20+%20backend/Faraja/js/Backend/controllers/documentController.js)
- `generateAnnouncement(req, res)` — Fetches funeral data + committee and returns a structured JSON payload optimized for rendering an announcement document.
- `generateObituary(req, res)` — Same approach but returns data structured for an obituary (includes biography, life dates, tribute text).
- Both accept an optional `customMessage` in the request body for personalized content.

#### [NEW] [documents.js](file:///d:/School/Strathmore%20Uni/Y%202.1/ICS2102%20-%20Web%20Application%20Development/Group%20Project/Faraja%20+%20backend/Faraja/js/Backend/routes/documents.js)
- `POST /api/documents/:funeralId/announcement` — Generate announcement data
- `POST /api/documents/:funeralId/obituary` — Generate obituary data
- Both routes are protected (require JWT auth)

#### [MODIFY] [server.js](file:///d:/School/Strathmore%20Uni/Y%202.1/ICS2102%20-%20Web%20Application%20Development/Group%20Project/Faraja%20+%20backend/Faraja/js/Backend/server.js)
- Add `app.use('/api/documents', require('./routes/documents'));`

---

### Frontend — Documents Page

#### [NEW] [documents.html](file:///d:/School/Strathmore%20Uni/Y%202.1/ICS2102%20-%20Web%20Application%20Development/Group%20Project/Faraja%20+%20backend/Faraja/documents.html)
- Dashboard-style page with the existing sidebar layout
- Two document cards: "Funeral Announcement" and "Obituary"
- Each card has a **Preview** button that opens a styled modal with the rendered document
- Each card has a **Download PDF** button that triggers `window.print()` on a print-optimized view
- Optional custom message textarea for personalizing each document
- Premium glassmorphism UI consistent with the existing design system

#### [MODIFY] [main.js](file:///d:/School/Strathmore%20Uni/Y%202.1/ICS2102%20-%20Web%20Application%20Development/Group%20Project/Faraja%20+%20backend/Faraja/js/main.js)
- Add `FarajaAPI.generateAnnouncement(funeralId, customMessage)` method
- Add `FarajaAPI.generateObituary(funeralId, customMessage)` method

#### [MODIFY] Sidebar navigation in all dashboard pages
- Add a "📄 Documents" link to the sidebar in existing dashboard pages (e.g., [funeral-dashboard.html](file:///d:/School/Strathmore%20Uni/Y%202.1/ICS2102%20-%20Web%20Application%20Development/Group%20Project/Faraja%20+%20backend/Faraja/funeral-dashboard.html), [committee.html](file:///d:/School/Strathmore%20Uni/Y%202.1/ICS2102%20-%20Web%20Application%20Development/Group%20Project/Faraja%20+%20backend/Faraja/committee.html), etc.)

---

## Open Questions

> [!IMPORTANT]
> **Document content scope**: The current `funeral_projects` table already has `biography`, `deceased_name`, `date_of_birth`, `date_of_death`, `funeral_date`, `funeral_time`, `venue`, `burial_site`, `officiant`, `mortuary`, and `photo`. Should the documents pull all of this from the existing data only, or do you want additional fields (e.g., "survived by", "predeceased by", "place of birth") added to the database?

> [!NOTE]
> **PDF generation approach**: I'm proposing to use the browser's built-in `window.print()` with print-optimized CSS (`@media print`) rather than a server-side PDF library. This keeps things simple with zero new dependencies. The user clicks "Download PDF" → the document opens in a print-friendly view → they print/save as PDF. Is this acceptable, or do you need server-generated PDF files?

---

## Verification Plan

### Manual Verification
1. Start the backend (`npm run dev` in `js/Backend`)
2. Open `documents.html` with Live Server
3. Select a funeral project → Preview announcement → verify all data renders correctly
4. Select a funeral project → Preview obituary → verify biography and life details render
5. Click "Download PDF" → verify print view opens with clean, print-ready formatting
6. Test with a funeral that has minimal data (no biography, no photo) → verify graceful fallbacks
