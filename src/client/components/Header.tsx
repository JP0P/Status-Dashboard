import * as React from 'react'
import styled, { keyframes } from 'styled-components'

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px 0;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 16px 12px 0;
  }
`

const HeaderWrapper = styled.header`
  text-align: center;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  margin-bottom: 12px;
  text-shadow: 0 2px 20px rgba(255, 255, 255, 0.15);
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 60%, #e8dcc8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 8px;
  }
`

const LastUpdated = styled.div`
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
  font-weight: 400;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`

const shimmer = keyframes`
  from {
    left: -100%;
  }
  to {
    left: 100%;
  }
`

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: white;
  border: none;
  padding: 11px 28px;
  border-radius: 980px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
  letter-spacing: -0.01em;
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
    animation: ${shimmer} 0.5s ease forwards;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 6px rgba(0, 122, 255, 0.2);
  }
`

interface HeaderProps {
  lastUpdate: string
  onRefresh: () => void
}

export const Header = (props: HeaderProps): React.ReactElement => {
  const { lastUpdate, onRefresh } = props

  return (
    <Container>
      <HeaderWrapper>
        <Title>Edge Blockbook Servers</Title>
        <LastUpdated>Last updated: {lastUpdate}</LastUpdated>
        <RefreshButton onClick={onRefresh}>Refresh Now</RefreshButton>
      </HeaderWrapper>
    </Container>
  )
}
