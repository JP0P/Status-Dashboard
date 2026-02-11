import cors from 'cors'
import express from 'express'
import fetch from 'node-fetch'
import path from 'path'

import { appPort } from '../common/values'
import { config } from '../config'

const app = express()

app.use(cors())

// Proxy endpoint for Blockbook API
app.get('/api/proxy', async (req, res) => {
  const targetUrl = req.query.url

  if (typeof targetUrl !== 'string' || targetUrl === '') {
    res.status(400).json({ error: 'Missing url parameter' })
    return
  }

  if (!targetUrl.includes(config.allowedDomain)) {
    res.status(400).json({
      error: 'Invalid URL - only edge.app Blockbook endpoints allowed'
    })
    return
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: config.fetchTimeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Error fetching ${targetUrl}:`, message)
    res.status(500).json({
      error: message,
      message: 'Failed to fetch from Blockbook server'
    })
  }
})

// Serve static files from webpack output
app.use(express.static(path.join(__dirname, '../../dist')))

// Catch-all route serves index.html
app.get('*catchAll', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'))
})

const PORT =
  process.env.PORT != null
    ? parseInt(process.env.PORT)
    : (config.port ?? appPort)

app.listen(PORT, () => {
  console.log(`Blockbook Status Dashboard running at http://localhost:${PORT}`)
})
