import * as React from 'react'
import { createGlobalStyle } from 'styled-components'

import { Header } from './components/Header'
import { ServerGrid } from './components/ServerGrid'

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --background: #0f1419;
    --surface: rgba(255, 255, 255, 0.06);
    --surface-hover: rgba(255, 255, 255, 0.09);
    --text-primary: #ffffff;
    --text-secondary: #c5d1e0;
    --accent: #3b82f6;
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
    --offline: #64748b;
    --divider: rgba(255, 255, 255, 0.08);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.5);
    --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.6);
    --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.7);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
      'SF Pro Text', 'Helvetica Neue', sans-serif;
    background: var(--background);
    min-height: 100vh;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    position: relative;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background:
      radial-gradient(
        circle at 20% 20%,
        rgba(59, 130, 246, 0.25) 0%,
        transparent 45%
      ),
      radial-gradient(
        circle at 80% 15%,
        rgba(139, 92, 246, 0.22) 0%,
        transparent 45%
      ),
      radial-gradient(
        circle at 40% 70%,
        rgba(236, 72, 153, 0.18) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 90% 80%,
        rgba(16, 185, 129, 0.2) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 60% 50%,
        rgba(251, 191, 36, 0.15) 0%,
        transparent 50%
      );
    animation: float 25s ease-in-out infinite;
    z-index: -1;
  }

  @keyframes float {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    33% {
      transform: translate(40px, -40px) rotate(8deg);
    }
    66% {
      transform: translate(-30px, 30px) rotate(-8deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`

export const App = (): React.ReactElement => {
  const [lastUpdate, setLastUpdate] = React.useState<string>('Never')
  const [refreshKey, setRefreshKey] = React.useState<number>(0)

  const handleRefresh = (): void => {
    setRefreshKey(prev => prev + 1)
  }

  const handleUpdate = (time: string): void => {
    setLastUpdate(time)
  }

  return (
    <>
      <GlobalStyle />
      <Header lastUpdate={lastUpdate} onRefresh={handleRefresh} />
      <ServerGrid refreshKey={refreshKey} onUpdate={handleUpdate} />
    </>
  )
}
