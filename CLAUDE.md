# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file vanilla HTML/CSS/JS dashboard for the **Learning Science Lab (LSL) at NYU Stern**. It visualizes workshop attendance data drawn from a Google Sheets spreadsheet via the Google Sheets API.

There is no build system, package manager, or framework — just `index.html`.

## Development

Open `index.html` directly in a browser, or serve it locally:

```bash
python3 -m http.server 8080
```

The dashboard requires Google sign-in to function. It uses the **Google Identity Services (GSI)** implicit flow to obtain an OAuth access token, then calls the Google Sheets API.

## Architecture

Everything lives in `index.html`:

1. **Config block** (line ~745): `CLIENT_ID`, `SHEET_ID`, `SHEET_NAME` — the Google OAuth client, target spreadsheet, and sheet tab name.
2. **Auth** (`signIn`, `signOut`, `handleToken`): Uses `google.accounts.oauth2.initTokenClient` (GSI implicit flow). On success, calls `fetchSheetData`.
3. **Data fetch** (`fetchSheetData`): Calls `https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{SHEET_NAME}` with the Bearer token.
4. **Data processing** (`processData`, `parseSemester`): Parses raw sheet rows by column header name. Splits rows into `rawRows` (attended) and `allRsvpRows` (RSVP'd). Derives `semester` from date string.
5. **Filters** (`FILTER_CONFIGS`, `filtersState`, `filterOptions`): Multi-select dropdown filters for Semester, Tag, Type, Affiliation, Department. State is managed as a `Set` per filter. `getRowsMatchingFilters(excludeId)` is used for cross-filter option counts.
6. **Render** (`renderAll`, `renderKPIs`, `renderChart`, `renderTable`): Rebuilds all charts and the table on every filter change. Charts use **Chart.js 4.4** (CDN). Old charts are destroyed before re-creating.
7. **UI state** (`setUIState`): Toggles between `landing`, `loading`, and `dashboard` views.

## Expected Google Sheet Schema

The sheet tab named `Event Attendance Log` must have these column headers in row 1:
- `Date` (M/D/YY or M/D/YYYY format)
- `Event Name`
- `Tag`
- `Type`
- `Affiliation`
- `Department`
- `RSVP'd` (`yes`/`no`)
- `Attended` (`yes`/`no`)

## Styling

- Fonts: **Lato** (headings/numbers) and **Montserrat** (body) via Google Fonts.
- Color palette defined as CSS custom properties in `:root` — teal/blue/purple brand colors.
- Responsive breakpoints at 980px, 800px, and 560px.
