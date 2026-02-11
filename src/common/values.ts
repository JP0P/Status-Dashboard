import type { ServerConfig } from './types'

export const appPort = 8008

export const refreshInterval = 15000

export const fetchTimeout = 10000

export const allowedDomain = 'edge.app/api/v2'

export const servers: ServerConfig[] = [
  {
    name: 'Bitcoin',
    region: 'Europe 1',
    url: 'https://btc-eu1.edge.app/',
    accentColor: '#f7931a'
  },
  {
    name: 'Bitcoin',
    region: 'West USA 1',
    url: 'https://btc-wusa1.edge.app/',
    accentColor: '#f7931a'
  },
  {
    name: 'Bitcoin Cash',
    region: 'East USA 1',
    url: 'https://bch-eusa1.edge.app/',
    accentColor: '#10b981'
  },
  {
    name: 'Dash',
    region: 'West USA 1',
    url: 'https://dash-wusa1.edge.app/',
    accentColor: '#06b6d4'
  },
  {
    name: 'DigiByte',
    region: 'Europe 1',
    url: 'https://dgb-eu1.edge.app/',
    accentColor: '#6366f1'
  },
  {
    name: 'Dogecoin',
    region: 'East USA 1',
    url: 'https://doge-eusa1.edge.app/',
    accentColor: '#fbbf24'
  },
  {
    name: 'Firo',
    region: 'East USA 1',
    url: 'https://firo-eusa1.edge.app/',
    accentColor: '#a855f7'
  },
  {
    name: 'Litecoin',
    region: 'West USA 1',
    url: 'https://ltc-wusa1.edge.app/',
    accentColor: '#60a5fa'
  },
  {
    name: 'PIVX',
    region: 'East USA 1',
    url: 'https://pivx-eusa1.edge.app/',
    accentColor: '#ec4899'
  },
  {
    name: 'Qtum',
    region: 'West USA 1',
    url: 'https://qtum-wusa1.edge.app/',
    accentColor: '#14b8a6'
  },
  {
    name: 'Vertcoin',
    region: 'West USA 1',
    url: 'https://vtc-wusa1.edge.app/',
    accentColor: '#8b5cf6'
  }
]
