import * as React from 'react'
import { useState } from 'react'
import styled, { css, keyframes } from 'styled-components'

import type {
  ServerConfig,
  ServerStatus,
  ServerStatusData
} from '../../common/types'
import { getTimeSince } from '../../common/utils'
import { StatusIndicator } from './StatusIndicator'

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const dataUpdate = keyframes`
  0% {
    transform: scale(1) translateY(0);
    box-shadow: var(--shadow-sm);
  }
  40% {
    transform: scale(1.01) translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 122, 255, 0.12);
  }
  100% {
    transform: scale(1) translateY(0);
    box-shadow: var(--shadow-sm);
  }
`

const fieldHighlight = keyframes`
  0% {
    background: rgba(59, 130, 246, 0.3);
  }
  100% {
    background: transparent;
  }
`

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const Card = styled.div<{
  $accentColor: string
  $isInitialLoad: boolean
  $animationDelay: number
  $hasUpdate: boolean
  $expanded: boolean
}>`
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(70px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.8),
    inset 0 1px 1px rgba(255, 255, 255, 0.8);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.25px solid rgba(255, 255, 255, 0.28);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${props => props.$accentColor} 50%,
      transparent 100%
    );
    opacity: 1;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px ${props => props.$accentColor};
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: var(--radius-lg);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    background: radial-gradient(
      circle at 50% 0%,
      ${props => props.$accentColor},
      transparent 60%
    );
    mix-blend-mode: soft-light;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.9),
      inset 0 1px 1px rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.03);
    border: 1.25px solid rgba(255, 255, 255, 0.35);
  }

  &:hover::before {
    height: 4px;
    box-shadow: 0 0 30px ${props => props.$accentColor};
  }

  &:hover::after {
    opacity: 0.08;
  }

  ${props =>
    props.$isInitialLoad &&
    css`
      animation: ${fadeInUp} 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      animation-delay: ${props.$animationDelay}s;
      opacity: 0;
    `}

  ${props =>
    props.$hasUpdate &&
    css`
      animation: ${dataUpdate} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    `}

  @media (max-width: 768px) {
    padding: 14px 16px 18px;
    cursor: pointer;
    user-select: none;

    &:active {
      transform: scale(0.99);
    }

    &::after {
      content: '${props => (props.$expanded ? '\\25B2' : '\\25BC')}';
      position: absolute;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%) scaleX(1.3);
      top: auto;
      right: auto;
      width: auto;
      height: auto;
      font-size: 0.6875rem;
      color: #c5d1e0;
      opacity: 0.85;
      pointer-events: none;
      z-index: 10;
      background: none;
      border-radius: 0;
      mix-blend-mode: normal;
    }
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--divider);

  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding-bottom: 10px;
  }
`

const ServerTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: baseline;
    gap: 8px;
  }
`

const ServerName = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`

const ServerRegion = styled.div`
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--text-secondary);
  letter-spacing: -0.01em;
  opacity: 0.85;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`

const InfoSection = styled.div`
  margin-bottom: 18px;

  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`

const InfoRow = styled.div<{
  $field: string
  $expanded: boolean
  $highlighted: boolean
}>`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 10px 0;
  font-size: 0.875rem;
  transition: background 0.15s ease;

  &:not(:last-child) {
    border-bottom: 1px solid var(--divider);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    margin: 0 -12px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: var(--radius-sm);
  }

  ${props =>
    props.$highlighted &&
    css`
      animation: ${fieldHighlight} 1.5s ease-out;
      margin: 0 -12px;
      padding-left: 12px;
      padding-right: 12px;
      border-radius: var(--radius-sm);
    `}

  @media (max-width: 768px) {
    ${props =>
      props.$field !== 'status' &&
      !props.$expanded &&
      css`
        display: none;
      `}

    &:hover {
      margin: 0;
      padding: 10px 0;
    }
  }
`

const InfoLabel = styled.span`
  color: var(--text-secondary);
  font-weight: 400;
  letter-spacing: -0.01em;
`

const InfoValue = styled.span<{ $statusColor?: string }>`
  color: ${props => props.$statusColor ?? 'var(--text-primary)'};
  font-weight: ${props => (props.$statusColor != null ? '600' : '500')};
  text-align: right;
  letter-spacing: -0.01em;
`

const WarningMessage = styled.div`
  background: rgba(251, 191, 36, 0.15);
  border-left: 3px solid var(--warning);
  color: #fcd34d;
  font-size: 0.8125rem;
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.5;
`

const ErrorMessage = styled.div`
  background: rgba(248, 113, 113, 0.15);
  border-left: 3px solid var(--error);
  color: #fca5a5;
  font-size: 0.8125rem;
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.5;
`

const ServerLink = styled.a`
  display: block;
  text-align: center;
  background: linear-gradient(135deg, var(--accent) 0%, #0051d5 100%);
  color: white;
  text-decoration: none;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.01em;
  margin-top: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    margin-top: 12px;
    margin-bottom: 8px;
    padding: 10px 14px;
    font-size: 0.875rem;
  }
`

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<ServerStatus, string> = {
  online: 'HEALTHY',
  warning: 'DEGRADED',
  error: 'ERROR',
  offline: 'OFFLINE',
  checking: 'CHECKING'
}

const STATUS_COLORS: Record<ServerStatus, string> = {
  online: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
  offline: 'var(--offline)',
  checking: 'var(--accent)'
}

const formatBlockHeight = (value: number | undefined): string => {
  if (value == null) return 'N/A'
  return value.toLocaleString()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ServerCardProps {
  server: ServerConfig
  statusData: ServerStatusData
  isInitialLoad: boolean
  animationDelay: number
  changedFields: string[] | null
}

export const ServerCard = (props: ServerCardProps): React.ReactElement => {
  const { server, statusData, isInitialLoad, animationDelay, changedFields } =
    props
  const [expanded, setExpanded] = useState(false)

  const { status, blockbook, backend, warnings, errors, error } = statusData
  const isLive = status !== 'offline' && status !== 'checking'

  const blockHeight = backend.blocks ?? blockbook.bestHeight
  const version = blockbook.version ?? 'N/A'
  const coin = blockbook.coin ?? 'N/A'
  const inSync = blockbook.inSync
  const inSyncMempool = blockbook.inSyncMempool
  const lastBlockTime =
    blockbook.lastBlockTime != null
      ? getTimeSince(blockbook.lastBlockTime)
      : 'N/A'
  const lastMempoolTime =
    blockbook.lastMempoolTime != null
      ? getTimeSince(blockbook.lastMempoolTime)
      : 'N/A'

  const handleCardClick = (e: React.MouseEvent): void => {
    if (window.innerWidth > 768) return
    const target = e.target as HTMLElement
    if (target.closest('a') != null) return
    setExpanded(prev => !prev)
  }

  const isFieldChanged = (field: string): boolean => {
    return changedFields?.includes(field) ?? false
  }

  return (
    <Card
      $accentColor={server.accentColor}
      $isInitialLoad={isInitialLoad}
      $animationDelay={animationDelay}
      $hasUpdate={changedFields != null && changedFields.length > 0}
      $expanded={expanded}
      onClick={handleCardClick}
    >
      <CardHeader>
        <ServerTitle>
          <ServerName>{server.name}</ServerName>
          <ServerRegion>{server.region}</ServerRegion>
        </ServerTitle>
        <StatusIndicator status={status} />
      </CardHeader>

      <InfoSection>
        <InfoRow
          $field="status"
          $expanded={expanded}
          $highlighted={isFieldChanged('status')}
        >
          <InfoLabel>Status</InfoLabel>
          <InfoValue $statusColor={STATUS_COLORS[status]}>
            {STATUS_LABELS[status]}
          </InfoValue>
        </InfoRow>

        {isLive && (
          <>
            <InfoRow
              $field="coin"
              $expanded={expanded}
              $highlighted={isFieldChanged('coin')}
            >
              <InfoLabel>Coin</InfoLabel>
              <InfoValue>{coin}</InfoValue>
            </InfoRow>

            <InfoRow
              $field="block-height"
              $expanded={expanded}
              $highlighted={isFieldChanged('block-height')}
            >
              <InfoLabel>Block Height</InfoLabel>
              <InfoValue>{formatBlockHeight(blockHeight)}</InfoValue>
            </InfoRow>

            <InfoRow
              $field="synchronized"
              $expanded={expanded}
              $highlighted={isFieldChanged('synchronized')}
            >
              <InfoLabel>Synchronized</InfoLabel>
              <InfoValue
                $statusColor={
                  inSync === true ? 'var(--success)' : 'var(--error)'
                }
              >
                {inSync === true ? '\u2713 Yes' : '\u2717 No'}
              </InfoValue>
            </InfoRow>

            <InfoRow
              $field="last-block"
              $expanded={expanded}
              $highlighted={isFieldChanged('last-block')}
            >
              <InfoLabel>Last Block</InfoLabel>
              <InfoValue>{lastBlockTime}</InfoValue>
            </InfoRow>

            <InfoRow
              $field="mempool-sync"
              $expanded={expanded}
              $highlighted={isFieldChanged('mempool-sync')}
            >
              <InfoLabel>Mempool Sync</InfoLabel>
              <InfoValue
                $statusColor={
                  inSyncMempool === true ? 'var(--success)' : 'var(--error)'
                }
              >
                {inSyncMempool === true ? '\u2713 Yes' : '\u2717 No'}
              </InfoValue>
            </InfoRow>

            <InfoRow
              $field="last-mempool"
              $expanded={expanded}
              $highlighted={isFieldChanged('last-mempool')}
            >
              <InfoLabel>Last Mempool Update</InfoLabel>
              <InfoValue>{lastMempoolTime}</InfoValue>
            </InfoRow>

            <InfoRow
              $field="version"
              $expanded={expanded}
              $highlighted={isFieldChanged('version')}
            >
              <InfoLabel>Version</InfoLabel>
              <InfoValue>{version}</InfoValue>
            </InfoRow>
          </>
        )}
      </InfoSection>

      {warnings.map((warning, i) => (
        <WarningMessage key={i}>
          {'\u26A0\uFE0F'} {warning}
        </WarningMessage>
      ))}

      {errors.map((err, i) => (
        <ErrorMessage key={i}>
          {'\u274C'} {err}
        </ErrorMessage>
      ))}

      {error != null && (
        <ErrorMessage>
          {'\u274C'} Connection failed: {error}
        </ErrorMessage>
      )}

      <ServerLink href={server.url} target="_blank" rel="noopener noreferrer">
        Visit Server &rarr;
      </ServerLink>
    </Card>
  )
}
