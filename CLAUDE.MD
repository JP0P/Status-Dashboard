# Project Context for Claude Code

## Project Overview

**Edge Blockbook Status** is a real-time monitoring dashboard for Blockbook servers. It provides live status updates, metrics, and health monitoring for multiple Blockbook cryptocurrency server instances.

### Key Information
- **Type**: Full-stack web application (TypeScript)
- **Purpose**: Real-time server monitoring and status visualization
- **Primary Users**: System administrators, DevOps teams monitoring Blockbook infrastructure
- **Stack**: TypeScript, React, Express, styled-components, Webpack

## Project Structure

```
edge-blockbook-status/
├── .editorconfig          # EditorConfig (UTF-8, LF, 2-space indent)
├── .gitignore             # Git ignore rules
├── .husky/pre-commit      # Husky pre-commit hook (runs lint)
├── .prettierrc            # Prettier config (single quotes, no semi)
├── .yarnrc                # Yarn security config (--ignore-scripts)
├── eslint.config.mjs      # ESLint flat config (standard-kit)
├── package.json           # Yarn-managed dependencies and scripts
├── pm2.json               # PM2 production process config
├── tsconfig.json          # Base TypeScript config (client)
├── tsconfig.server.json   # Server TypeScript config (CommonJS)
├── webpack.config.js      # Webpack config for client bundling
├── CLAUDE.md              # This file
├── README.md              # User-facing documentation
└── src/
    ├── config.ts              # Server config via cleaner-config
    ├── common/
    │   ├── types.ts           # Cleaner-validated Blockbook API types
    │   ├── values.ts          # Constants (port, servers, intervals)
    │   └── utils.ts           # Shared utilities (retryFetch, getTimeSince)
    ├── server/
    │   └── index.ts           # Express server with /api/proxy endpoint
    └── client/
        ├── index.html         # Minimal HTML shell
        ├── index.tsx          # React entry point
        ├── App.tsx            # Root component with GlobalStyle
        ├── api/
        │   └── baseUrl.ts     # Dev/prod API base URL logic
        └── components/
            ├── Header.tsx          # Dashboard header + refresh button
            ├── ServerGrid.tsx      # Grid layout, polling, state management
            ├── ServerCard.tsx      # Individual server card with status
            └── StatusIndicator.tsx # Pulsing dot status indicator
```

## Architecture

**Single full-stack application.** The Express server serves the webpack-built frontend AND provides the API proxy. One Node.js process, one deployment.

### Backend (src/server/index.ts)
- **Framework**: Express 5
- **Port**: 8008 (configurable via `config.json` or `PORT` env var)
- **Serves Static Files**: From `dist/` (webpack output)
- **Key Endpoint**: `/api/proxy?url=<blockbook-url>`
  - Proxies requests to Blockbook servers
  - Validates URLs (only allows edge.app endpoints)
  - Configurable timeout via cleaner-config
- **Configuration**: `cleaner-config` reads from `config.json`

### Frontend (src/client/)
- **Framework**: React 19 with styled-components
- **Build**: Webpack with ts-loader
- **Auto-refresh**: 15-second polling intervals
- **Server Configuration**: Defined in `src/common/values.ts`
- **Features**:
  - Color-coded status indicators (HEALTHY, DEGRADED, ERROR, OFFLINE)
  - Block height tracking with change highlighting
  - Version, sync status, mempool status display
  - Last block time tracking with relative timestamps
  - Mobile-responsive with expand/collapse cards
  - Manual refresh button

### Shared Code (src/common/)
- **types.ts**: Cleaner-validated types for Blockbook API responses
- **values.ts**: Server list, port, refresh interval constants
- **utils.ts**: Retry logic, time formatting

## Key Technical Details

### Server Configuration
Servers are defined in `src/common/values.ts`:
```typescript
export const servers: ServerConfig[] = [
  { name: 'Bitcoin', region: 'Europe 1', url: 'https://btc-eu1.edge.app/', accentColor: '#f7931a' }
]
```

### Data Validation
Uses the `cleaners` library for type-safe API response validation:
```typescript
export const asBlockbookResponse = asObject({
  blockbook: asBlockbookInfo,
  backend: asBackendInfo
})
```

### Config Management
Uses `cleaner-config` for server settings:
```typescript
export const asConfig = asObject({
  port: asOptional(asNumber, 8008),
  allowedDomain: asOptional(asString, 'edge.app/api/v2'),
  fetchTimeout: asOptional(asNumber, 10000)
})
```

## Development

### Scripts
- `yarn start.dev` -- Start backend with Sucrase (hot TypeScript, no build needed)
- `yarn start.web` -- Start webpack dev server on port 3000 (proxies API to 8008)
- `yarn start` -- Start production server from `lib/` (requires build)
- `yarn build.server` -- Compile server TypeScript to `lib/`
- `yarn build.web` -- Bundle client with webpack to `dist/`
- `yarn lint` -- Run ESLint
- `yarn fix` -- Run ESLint with auto-fix
- `yarn clean` -- Remove `lib/` and `dist/`
- `yarn prepare` -- Full build (husky + clean + build all)

### Development Workflow
1. Terminal 1: `yarn start.dev` (backend on port 8008)
2. Terminal 2: `yarn start.web` (frontend on port 3000, proxies API)
3. Open `http://localhost:3000`

### Production
```bash
yarn prepare          # Build everything
yarn start            # Or: pm2 start pm2.json
```

## Conventions

This project follows Edge development conventions:
- **Package Manager**: Yarn v1
- **Language**: TypeScript (strict mode)
- **Linting**: ESLint with eslint-config-standard-kit + Prettier
- **Formatting**: Single quotes, no semicolons, no trailing commas
- **Exports**: Named exports only (no default exports)
- **Imports**: Auto-sorted by eslint-config-standard-kit
- **Hooks**: Husky pre-commit runs ESLint
- **Process Management**: PM2 for production
- **Data Validation**: cleaners library
- **Config**: cleaner-config

## Dependencies

### Runtime
- `express` -- Web framework
- `cors` -- CORS middleware
- `node-fetch` -- HTTP client for API proxy
- `cleaners` -- Data validation
- `cleaner-config` -- Configuration management

### Dev
- `typescript`, `sucrase` -- TypeScript compilation
- `webpack`, `ts-loader`, `html-webpack-plugin` -- Client bundling
- `react`, `react-dom`, `styled-components` -- Frontend UI
- `eslint`, `eslint-config-standard-kit`, `prettier` -- Code quality
- `husky`, `lint-staged` -- Git hooks

## Notes for Claude
- Follow Edge conventions (named exports, single quotes, no semicolons)
- Use `cleaners` for any new data validation
- Keep the dashboard lightweight and focused on monitoring
- Test changes with actual Blockbook endpoints
- Run `yarn lint` before considering any change complete
