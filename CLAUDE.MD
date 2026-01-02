# Project Context for Claude Code

## Project Overview

**Status Dashboard** is a real-time monitoring dashboard for Blockbook servers. It provides live status updates, metrics, and health monitoring for multiple Blockbook cryptocurrency server instances.

### Key Information
- **Type**: Web application (Node.js/Express backend + vanilla JavaScript frontend)
- **Purpose**: Real-time server monitoring and status visualization
- **Primary Users**: System administrators, DevOps teams monitoring Blockbook infrastructure
- **Stack**: Node.js, Express, vanilla JavaScript, HTML5, CSS3

## Project Structure

```
Status-Dashboard/
├── server.js           # Express server with API proxy endpoint
├── index.html          # Main dashboard UI
├── style.css           # Dashboard styles
├── script.js           # Frontend logic for fetching and displaying server status
├── package.json        # Node.js dependencies and scripts
└── README.md           # User-facing documentation
```

## Architecture

**IMPORTANT: This is a unified full-stack application.** The Express server (`server.js`) serves BOTH the static frontend files AND the API proxy endpoint. There is NO separate frontend/backend deployment - it's a single Node.js process.

### Backend (server.js)
- **Framework**: Express.js
- **Port**: 3000 (configurable via PORT env var)
- **Serves Static Files**: `app.use(express.static(__dirname))` - serves index.html, style.css, script.js
- **Key Endpoint**: `/api/proxy?url=<blockbook-url>`
  - Proxies requests to Blockbook servers
  - Validates URLs (only allows edge.app endpoints)
  - 10-second timeout for API requests
  - Returns JSON responses

### Frontend
- **Architecture**: Static HTML/CSS/JS (no framework) - served by Express
- **Auto-refresh**: 60-second intervals
- **Server Configuration**: Defined in `script.js` servers array
- **Features**:
  - Color-coded status indicators
  - Block height tracking
  - Version and sync status display
  - Last block time tracking
  - Manual refresh capability

## Key Technical Details

### Server Configuration
Servers are defined in the `script.js` file:
```javascript
const servers = [
    { name: 'Server Name', url: 'https://server.edge.app/' }
];
```

### API Response Structure
Expected Blockbook API response format:
```json
{
  "blockbook": {
    "version": "string",
    "bestHeight": number,
    "lastBlockTime": "ISO-8601 timestamp"
  },
  "backend": {
    "version": "string"
  }
}
```

### Security Constraints
- Only proxies to `edge.app/api/v2` endpoints
- No authentication required (monitoring public endpoints)
- CORS handled via backend proxy

## Development Guidelines

### Code Style
- Use ES6+ JavaScript features
- Keep vanilla JavaScript (no frameworks)
- Maintain simplicity and readability
- Follow existing patterns in codebase

### Adding New Features
1. Keep the dashboard lightweight and fast
2. Maintain backward compatibility with existing server configs
3. Test with actual Blockbook endpoints
4. Ensure mobile responsiveness

### Common Tasks

#### Adding a New Server
1. Edit `script.js`
2. Add new entry to `servers` array
3. Test connectivity to ensure endpoint is accessible

#### Changing Refresh Interval
- Modify `script.js` line ~111: `setInterval(updateDashboard, 60000)`

#### Changing Port
- Set `PORT` environment variable or edit `server.js:6`

## Deployment Context

**Deployment Model**: Single application deployment only. The Express server is the entire application - no separate frontend hosting, no separate API server, just one Node.js process.

### Supported Platforms
- Railway (recommended)
- Render
- Heroku
- DigitalOcean App Platform
- Vercel
- Self-hosted (VPS with PM2)

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (production/development)

### Dependencies
- `express`: ^4.18.2 - Web framework
- `node-fetch`: ^2.7.0 - HTTP client for API requests

## Important Considerations

### When Making Changes

1. **Keep it simple**: This is a lightweight monitoring tool, not a complex application
2. **No over-engineering**: Avoid adding unnecessary abstractions or frameworks
3. **Maintain compatibility**: Changes should work across all deployment platforms
4. **Test with real endpoints**: Always verify against actual Blockbook servers
5. **Mobile-first**: Ensure changes work on mobile devices

### Known Limitations
- Only monitors edge.app Blockbook endpoints
- No persistent storage (all data is real-time)
- No authentication/authorization
- Single-page application (no routing)

## Testing Approach

### Manual Testing
1. Start server: `npm start`
2. Open browser: `http://localhost:3000`
3. Verify all servers show correct status
4. Test auto-refresh functionality
5. Test manual refresh button
6. Verify mobile responsiveness

### Endpoint Testing
```bash
curl "http://localhost:3000/api/proxy?url=https://firo-eusa1.edge.app/api/v2"
```

## Future Enhancement Ideas
- Add historical uptime tracking
- Email/SMS alerts for server downtime
- Performance metrics (response time graphs)
- Custom server grouping/organization
- Dark mode toggle
- Export status reports

## Git Workflow
- This project does not currently use Git (not initialized as a repository)
- Consider initializing Git if version control is needed

## Notes for Claude
- Prioritize simplicity over complexity
- This is a monitoring tool, not a feature-rich application
- Users value stability and reliability over new features
- Always test changes against real Blockbook endpoints
- Respect the existing vanilla JavaScript approach (no frameworks)
