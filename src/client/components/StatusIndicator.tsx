import * as React from 'react'
import styled, { keyframes } from 'styled-components'

import type { ServerStatus } from '../../common/types'

const pulseRing = keyframes`
  0% {
    box-shadow: 0 0 0 0 currentColor;
  }
  70% {
    box-shadow: 0 0 0 4px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
`

const STATUS_COLORS: Record<ServerStatus, string> = {
  online: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
  offline: 'var(--offline)',
  checking: 'var(--accent)'
}

const Dot = styled.span<{ $status: ServerStatus }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: relative;
  display: inline-block;
  color: ${props => STATUS_COLORS[props.$status]};
  animation: ${props => (props.$status !== 'offline' ? pulseRing : 'none')} 2s
    cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.4),
      currentColor
    );
    transform: translate(-50%, -50%);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`

interface StatusIndicatorProps {
  status: ServerStatus
}

export const StatusIndicator = (
  props: StatusIndicatorProps
): React.ReactElement => {
  const { status } = props
  return <Dot $status={status} />
}
