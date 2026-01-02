const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Proxy endpoint for Blockbook API
app.get('/api/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Validate that the URL is a Blockbook API endpoint
    if (!targetUrl.includes('edge.app/api/v2')) {
        return res.status(400).json({ error: 'Invalid URL - only edge.app Blockbook endpoints allowed' });
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Send the data back to the client
        res.json(data);

    } catch (error) {
        console.error(`Error fetching ${targetUrl}:`, error.message);
        res.status(500).json({
            error: error.message,
            message: 'Failed to fetch from Blockbook server'
        });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Blockbook Status Dashboard running at http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔌 API Proxy: http://localhost:${PORT}/api/proxy?url=<blockbook-url>`);
});
