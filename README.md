# 🌐 GlobalMarket Tracker

> A professional, real-time cryptocurrency market tracking dashboard built with **Angular 17** (standalone components), TypeScript, Chart.js, and the CoinGecko public API.

---

## 📐 System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Sidebar    │  │    Header    │  │   Router Outlet      │  │
│  │  (nav links) │  │ (global mkt) │  │  (lazy-loaded pages) │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               Feature Modules (Lazy-loaded)             │    │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │    │
│  │  │  Dashboard │  │ Watchlist  │  │  Asset Detail    │  │    │
│  │  │  /dashboard│  │ /watchlist │  │  /asset/:id      │  │    │
│  │  └────────────┘  └────────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Core Services Layer                    │    │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐ │    │
│  │  │ MarketStateService│  │   WatchlistService           │ │    │
│  │  │ (signal-based   │  │   (localStorage persistence) │ │    │
│  │  │  global state)  │  └──────────────────────────────┘ │    │
│  │  └─────────────────┘                                   │    │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐ │    │
│  │  │ CoinGeckoService│  │   WebSocketService           │ │    │
│  │  │ (HTTP + retry)  │  │   (Binance WS stream)        │ │    │
│  │  └─────────────────┘  └──────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                          │                │
               ┌──────────▼──────┐  ┌──────▼──────────┐
               │  CoinGecko API  │  │  Binance WS      │
               │  (REST/public)  │  │  (price ticks)   │
               └─────────────────┘  └──────────────────┘
```

### Key Architecture Decisions

| Concern | Choice | Reason |
|---|---|---|
| State management | Angular Signals | Built-in, zero deps, fine-grained reactivity |
| Components | Standalone | No NgModules, tree-shakeable, Angular 17+ best practice |
| Change detection | OnPush | Minimal re-renders, signal compatibility |
| Data fetching | RxJS + HttpClient | Retry, debounce, cancellation out of the box |
| Real-time | WebSocket (Binance) | True push updates; polling fallback built in |
| Persistence | localStorage | Simple, synchronous, zero server required |
| Charting | Chart.js + ng2-charts | Mature, performant, rich configuration |
| Routing | Angular Router (lazy) | Code-split per feature for fast initial load |
| Styling | Component SCSS + CSS vars | Scoped styles + global design token system |

---

## ✅ Functional Features

### 1. Live Dashboard (`/dashboard`)
- Fetches top 100 cryptocurrencies from CoinGecko
- **Auto-refreshes every 30 seconds** using `interval()` + RxJS
- WebSocket stream from Binance for real-time price tick updates
- Animated price flash (green ↑ / red ↓) via `PriceFlashDirective`
- 7-day sparkline mini-chart rendered on `<canvas>`

### 2. Advanced Filtering
- **Search bar** with `debounceTime(400ms)` + `distinctUntilChanged()` via `FormControl`
- Clear button appears when query is non-empty
- **Category filters**: All / 🚀 Top Gainers / 📉 Top Losers / ⭐ Watchlist
- **Sortable columns**: Rank, Price, 24h %, Market Cap, Volume
- Bidirectional sort (click same column to toggle ↑/↓)
- All filtering/sorting done **client-side via computed signals** — zero extra API calls

### 3. Persistent Watchlist (`/watchlist`)
- Star (★) toggle on every row in the dashboard table
- `WatchlistService` uses Angular signals for reactive state
- Automatically **persisted to `localStorage`** under key `gmt_watchlist`
- Survives page refresh, tab close, browser restart
- Watchlist page shows asset cards with sparkline, price, and 24h change
- "Clear All" button with confirmation dialog
- Watchlist count badge in sidebar nav

### 4. Dynamic Asset Detail (`/asset/:id`)
- Sub-route with **component input binding** (`@Input() id`)
- Loaded lazily — zero cost until navigated to
- **Interactive Chart.js line chart** powered by `ng2-charts`
- Range selector: 24H / 7D / 1M / 3M / 1Y
- Chart dynamically switches colour (green/red) based on price direction
- Custom dark-theme tooltip showing formatted price + date
- Stats grid: market cap, volume, 24h high/low, ATH, ATL, circulating supply
- Performance table: 24h / 7d / 30d / 1y % changes
- Description section (first 5 sentences from CoinGecko)
- Add/remove from watchlist directly from detail page

---

## 🚀 Setup & Run Commands

### Prerequisites

```bash
node --version   # Must be >= 18.x
npm --version    # Must be >= 9.x
```

If you don't have Node, install via [nvm](https://github.com/nvm-sh/nvm):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

---

### Step 1 — Install Angular CLI globally

```bash
npm install -g @angular/cli@17
```

Verify:
```bash
ng version
```

---

### Step 2 — Clone / enter the project

```bash
# If starting from this scaffold:
cd global-market-tracker

# OR scaffold fresh and copy files:
ng new global-market-tracker \
  --style=scss \
  --routing=true \
  --standalone \
  --skip-tests=false
cd global-market-tracker
```

---

### Step 3 — Install dependencies

```bash
npm install
```

This installs:
- `chart.js` + `ng2-charts` — interactive charting
- `rxjs` — reactive data streams
- `zone.js` — Angular change detection
- All Angular 17 core packages

---

### Step 4 — Install WebSocket support

```bash
npm install rxjs  # ensure version >= 7.8
```

RxJS ships `webSocket` from `rxjs/webSocket` — no extra package needed.

---

### Step 5 — Start the development server

```bash
ng serve
```

Or open the browser automatically:
```bash
ng serve --open
```

Or use a specific port:
```bash
ng serve --port 4201 --open
```

The app runs at: **http://localhost:4200**

---

### Step 6 — Production build

```bash
ng build
```

Output goes to `dist/global-market-tracker/browser/`.

To preview the production build locally:
```bash
npm install -g serve
serve dist/global-market-tracker/browser
```

---

### Step 7 — Run unit tests

```bash
ng test
```

Runs Karma + Jasmine in watch mode (headless Chrome).

Single run (CI mode):
```bash
ng test --watch=false --browsers=ChromeHeadless
```

---

### Step 8 — Lint

```bash
ng lint
```

---

## ⚙️ Configuration

### Change auto-refresh interval

Edit `src/environments/environment.ts`:
```ts
refreshInterval: 30000,  // milliseconds (30s default)
```

### Change search debounce

```ts
debounceTime: 400,  // milliseconds
```

### Change default currency

```ts
defaultCurrency: 'usd',  // 'usd' | 'eur' | 'gbp' | 'btc'
```

### Adjust assets per page

```ts
defaultItemsPerPage: 50,  // max 250 on free CoinGecko plan
```

---

## 🔑 API Notes

This project uses the **CoinGecko free public API** — no API key required.

| Endpoint | Used for |
|---|---|
| `GET /coins/markets` | Dashboard asset list |
| `GET /coins/{id}` | Asset detail page |
| `GET /coins/{id}/market_chart` | Chart data (price history) |
| `GET /global` | Header global market stats |

**Rate limits (free tier):** ~30 requests/minute. The interceptor handles `429 Too Many Requests` by waiting 60s and retrying automatically.

For production usage, register for a [CoinGecko API key](https://www.coingecko.com/en/api) and add it to the `HttpParams` in `CoinGeckoService`.

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0d1a` | Page background |
| `--surface-1` | `#111827` | Cards, sidebar, header |
| `--surface-2` | `#1a2235` | Table headers, input bg |
| `--accent` | `#6366f1` | Active states, links, focus rings |
| `--green` | `#22c55e` | Positive price change |
| `--red` | `#ef4444` | Negative price change |
| `--font-display` | Syne | Page headings |
| `--font-body` | Space Grotesk | All UI text |
| `--font-mono` | DM Mono | Prices, numbers |

---

## 📦 Dependency Reference

```json
{
  "@angular/core": "^17",
  "@angular/router": "^17",        // withComponentInputBinding, withViewTransitions
  "@angular/forms": "^17",         // ReactiveFormsModule, FormControl
  "@angular/common/http": "^17",   // HttpClient, functional interceptors
  "chart.js": "^4.4",
  "ng2-charts": "^6.0",
  "rxjs": "~7.8"                   // webSocket, interval, debounceTime, etc.
}
```

---

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| `CORS error` in console | CoinGecko allows browser requests; if blocked, use a proxy: `ng serve --proxy-config proxy.conf.json` |
| `429 Too Many Requests` | Wait 60s; the interceptor retries automatically |
| Chart not rendering | Ensure `ng2-charts` and `chart.js` are both installed; check `BaseChartDirective` is imported |
| WebSocket errors in console | Normal if Binance blocks your network; prices still update via 30s polling |
| Fonts not loading | Requires internet access for Google Fonts CDN; app is fully functional without them |
| `localStorage` quota exceeded | Call `watchlistService.clearAll()` or clear browser storage |

---
