# Edge Blockbook Status

Real-time monitoring dashboard for Edge Blockbook cryptocurrency servers.

## Features

- Live status monitoring with 15-second polling
- Color-coded health indicators (Healthy, Degraded, Error, Offline)
- Block height, sync status, mempool, and version tracking
- Change-highlighting animations when data updates
- Mobile-responsive with collapsible server cards
- Manual refresh capability

## Quick Start

### Prerequisites

- Node.js >= 18
- Yarn v1

### Development

```bash
# Install dependencies
yarn install

# Run prepare manually (required due to --ignore-scripts)
yarn prepare

# Start backend (port 8008)
yarn start.dev

# In a second terminal, start frontend dev server (port 3000)
yarn start.web
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
# Build everything
yarn prepare

# Start with Node
yarn start

# Or start with PM2
pm2 start pm2.json
```

## Configuration

### Server Settings

Create a `config.json` in the project root to override defaults:

```json
{
  "port": 8008,
  "allowedDomain": "edge.app/api/v2",
  "fetchTimeout": 10000
}
```

The `PORT` environment variable also works:

```bash
PORT=3000 yarn start
```

### Adding/Removing Servers

Edit `src/common/values.ts` and modify the `servers` array:

```typescript
export const servers: ServerConfig[] = [
  {
    name: 'Bitcoin',
    region: 'Europe 1',
    url: 'https://btc-eu1.edge.app/',
    accentColor: '#f7931a'
  }
]
```

Rebuild after changes: `yarn prepare`

### Refresh Interval

Edit `src/common/values.ts`:

```typescript
export const refreshInterval = 15000 // milliseconds
```

## Scripts

| Script | Description |
|--------|-------------|
| `yarn start.dev` | Start backend with Sucrase (no build needed) |
| `yarn start.web` | Start webpack dev server with hot reload |
| `yarn start` | Start production server (requires build) |
| `yarn build.server` | Compile server TypeScript to `lib/` |
| `yarn build.web` | Bundle client with webpack to `dist/` |
| `yarn prepare` | Full build (husky + clean + all builds) |
| `yarn lint` | Run ESLint |
| `yarn fix` | Run ESLint with auto-fix |
| `yarn clean` | Remove build output (`lib/`, `dist/`) |

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Backend**: Express 5, node-fetch, cleaner-config
- **Frontend**: React 19, styled-components
- **Build**: Webpack (client), tsc (server), Sucrase (dev)
- **Code Quality**: ESLint (standard-kit), Prettier, Husky
- **Process Management**: PM2
- **Data Validation**: cleaners

## Deployment

This is a single full-stack Node.js application. One deployment serves both the frontend and API.

### Railway / Render / Heroku

These platforms auto-detect Node.js. Ensure the build command runs `yarn prepare` and the start command runs `yarn start`.

### Self-Hosted (VPS)

```bash
git clone <repo-url>
cd edge-blockbook-status
yarn install
yarn prepare
pm2 start pm2.json
pm2 save
pm2 startup
```

## API

### Proxy Endpoint

```
GET /api/proxy?url=<blockbook-api-url>
```

Example:

```bash
curl "http://localhost:8008/api/proxy?url=https://firo-eusa1.edge.app/api/v2"
```

Only proxies to `edge.app` Blockbook endpoints (configurable).

## License

MIT
