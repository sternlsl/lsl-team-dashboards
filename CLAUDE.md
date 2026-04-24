# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains standalone vanilla HTML/CSS/JS dashboards for the **Learning Science Lab (LSL) at NYU Stern**. They visualize data drawn from a Google Sheets spreadsheet via the Google Sheets API.

There is no build system, package manager, or framework.

- `index.html`: workshop attendance dashboard using the `Event Attendance Log` sheet.
- `consultations.html`: consultation history dashboard using the `Service Log` sheet.

## Development

Open either HTML file directly in a browser, or serve the directory locally:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/index.html` or `http://localhost:8080/consultations.html`.

Both dashboards require Google sign-in to function. They use the **Google Identity Services (GSI)** implicit flow to obtain an OAuth access token, then call the Google Sheets API.

## Architecture

Each dashboard is self-contained in its HTML file:

1. **Config block**: `CLIENT_ID`, `SHEET_ID`, `SHEET_NAME` — the Google OAuth client, target spreadsheet, and sheet tab name.
2. **Auth** (`signIn`, `signOut`, `handleToken`): Uses `google.accounts.oauth2.initTokenClient` (GSI implicit flow). On success, calls `fetchSheetData`.
3. **Data fetch** (`fetchSheetData`): Calls `https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{SHEET_NAME}` with the Bearer token.
4. **Data processing** (`processData`, `parseSemester`): Parses raw sheet rows by column header name and derives semester values from dates.
5. **Filters** (`FILTER_CONFIGS`, `filtersState`, `filterOptions`): Multi-select dropdown filters. State is managed as a `Set` per filter. `getRowsMatchingFilters(excludeId)` is used for cross-filter option counts.
6. **Render** (`renderAll`, `renderKPIs`, `renderChart`, `renderTable`): Rebuilds all charts and the table on every filter change. Charts use **Chart.js 4.4** (CDN). Old charts are destroyed before re-creating.
7. **UI state** (`setUIState`): Toggles between `landing`, `loading`, and `dashboard` views.

## Expected Google Sheet Schemas

The sheet tab named `Event Attendance Log` must have these column headers in row 1:
- `Date` (M/D/YY or M/D/YYYY format)
- `Event Name`
- `Tag`
- `Type`
- `Affiliation`
- `Department`
- `RSVP'd` (`yes`/`no`)
- `Attended` (`yes`/`no`)

The sheet tab named `Service Log` must have these column headers in row 1:
- `Date`
- `Type`
- `Affiliation`
- `Client`
- `Title`
- `Department`
- `Faculty Rank (if applicable)`
- `Faculty Type`
- `Service Category`
- `Initials`
- `Time (mins)`
- `Status`
- `Notes`

The consultation dashboard treats each `Service Log` row as one consultation. It supports semester filters, date range filters, stacked monthly consultation counts by type, service category and department charts, faculty mix charts, staff load charts, and a top-client table.

## Styling

- Fonts: **Lato** (headings/numbers) and **Montserrat** (body) via Google Fonts.
- Color palette defined as CSS custom properties in `:root` — teal/blue/purple brand colors.
- Responsive breakpoints at 980px, 800px, and 560px.
