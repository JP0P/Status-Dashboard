# Blockbook Server Status Dashboard

A real-time monitoring dashboard for Blockbook servers with auto-refresh capabilities.

**This is a single full-stack Node.js application** - one server hosts both the website and API. No separate frontend/backend deployments needed!

## Features

- Real-time status monitoring for multiple Blockbook servers
- Color-coded status indicators (green = online, red = offline)
- Displays key metrics: block height, version, sync status, last block time
- Auto-refresh every 60 seconds
- Manual refresh button
- Direct links to each Blockbook server
- Responsive design for mobile and desktop

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to:
```
http://localhost:3000
```

## Deployment Options

**Note:** You only need to deploy this ONE application. The Express server handles both the website and API in a single process.

### Option 1: Railway (Recommended - Easiest)

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select this repository
4. Railway auto-detects Node.js and deploys automatically
5. Your dashboard will be live at `https://your-app.railway.app`

### Option 2: Render

1. Create account at [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click "Create Web Service"
6. Your dashboard will be live at `https://your-app.onrender.com`

### Option 3: Heroku

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login:
```bash
heroku login
```

3. Create app:
```bash
heroku create your-app-name
```

4. Deploy:
```bash
git push heroku main
```

5. Open:
```bash
heroku open
```

### Option 4: DigitalOcean App Platform

1. Create account at [digitalocean.com](https://www.digitalocean.com)
2. Go to App Platform → "Create App"
3. Connect your GitHub repository
4. DigitalOcean auto-detects Node.js
5. Click "Next" through the steps and deploy

### Option 5: Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts, and you're live!

### Option 6: Self-Hosted (VPS/Server)

1. SSH into your server
2. Clone the repository:
```bash
git clone <your-repo-url>
cd Status-Dashboard
```

3. Install dependencies:
```bash
npm install
```

4. Install PM2 for process management:
```bash
npm install -g pm2
```

5. Start with PM2:
```bash
pm2 start server.js --name blockbook-dashboard
pm2 save
pm2 startup
```

6. Configure nginx/Apache as reverse proxy (optional)

## Configuration

### Adding/Removing Servers

Edit `script.js` and modify the `servers` array:

```javascript
const servers = [
    { name: 'Firo (East USA 1)', url: 'https://firo-eusa1.edge.app/' },
    { name: 'Dogecoin (East USA 1)', url: 'https://doge-eusa1.edge.app/' },
    { name: 'Bitcoin (West USA 1)', url: 'https://btc-wusa1.edge.app/' },
    { name: 'Vertcoin (West USA 1)', url: 'https://vtc-wusa1.edge.app/' }
];
```

### Changing Port

Set the `PORT` environment variable:
```bash
PORT=8080 npm start
```

Or edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your preferred port
```

### Adjusting Refresh Interval

Edit `script.js`, line 111:
```javascript
setInterval(updateDashboard, 60000); // 60000ms = 1 minute
```

## Tech Stack

- **Architecture**: Single full-stack application (unified frontend + backend)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (served as static files)
- **Backend**: Node.js, Express (serves frontend + provides API proxy)
- **HTTP Client**: node-fetch
- **Deployment**: Platform agnostic (works anywhere Node.js runs) - **ONE deployment only**

## API Endpoint

The app exposes a proxy endpoint:

```
GET /api/proxy?url=<blockbook-api-url>
```

Example:
```
http://localhost:3000/api/proxy?url=https://firo-eusa1.edge.app/api/v2
```

This endpoint proxies requests to Blockbook servers to avoid CORS issues.

## Security

- Only allows proxying to `edge.app` Blockbook endpoints
- 10-second timeout on API requests
- No sensitive data stored

## Troubleshooting

### Servers showing as offline

1. Check that the Blockbook servers are actually online by visiting their URLs
2. Check server logs for errors: `npm start` or `pm2 logs blockbook-dashboard`
3. Verify your server has internet access to reach the Blockbook endpoints

### Port already in use

Change the port:
```bash
PORT=8080 npm start
```

### Deployment issues

- Ensure `package.json` is committed to git
- Verify Node.js version is 14+ (check platform requirements)
- Check deployment platform logs for specific errors

## License

MIT

## Contributing

Pull requests welcome! Feel free to add more servers or improve the dashboard.
