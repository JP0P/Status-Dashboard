import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import type { ServerConfig, ServerStatusData } from '../../common/types'
import { refreshInterval, servers } from '../../common/values'
import { getApiBaseUrl } from '../api/baseUrl'
import { ServerCard } from './ServerCard'

const Grid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 40px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 12px 24px;
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

const INITIAL_STATUS: ServerStatusData = {
  status: 'checking',
  blockbook: {},
  backend: {},
  warnings: [],
  errors: [],
  error: null
}

const checkServerStatus = async (
  server: ServerConfig
): Promise<ServerStatusData> => {
  try {
    const apiUrl = `${server.url}api/v2`
    const proxyUrl = `${getApiBaseUrl()}/api/proxy?url=${encodeURIComponent(apiUrl)}`

    const response = await fetch(proxyUrl, {
      method: 'GET',
      cache: 'no-cache'
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const blockbook = data.blockbook ?? {}
    const backend = data.backend ?? {}

    let status: ServerStatusData['status'] = 'online'
    const warnings: string[] = []
    const errors: string[] = []

    if (backend.error != null) {
      status = 'error'
      errors.push(`Backend error: ${backend.error}`)
    }

    if (
      backend.warnings != null &&
      typeof backend.warnings === 'string' &&
      backend.warnings.trim() !== ''
    ) {
      if (status === 'online') status = 'warning'
      warnings.push(backend.warnings.trim())
    }

    if (blockbook.inSync === false) {
      if (status === 'online') status = 'warning'
      warnings.push('Blockbook not synchronized')
    }

    if (blockbook.inSyncMempool === false) {
      if (status === 'online') status = 'warning'
      warnings.push('Mempool not synchronized')
    }

    if (blockbook.lastBlockTime != null) {
      const lastBlockDate = new Date(blockbook.lastBlockTime)
      const hoursSinceLastBlock =
        (Date.now() - lastBlockDate.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLastBlock > 24) {
        status = 'error'
        errors.push(
          `Last block was ${Math.floor(hoursSinceLastBlock / 24)} days ago - chain may be stalled`
        )
      } else if (hoursSinceLastBlock > 2) {
        if (status === 'online') status = 'warning'
        warnings.push(
          `Last block was ${Math.floor(hoursSinceLastBlock)} hours ago`
        )
      }
    }

    return { status, blockbook, backend, warnings, errors, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      status: 'offline',
      blockbook: {},
      backend: {},
      warnings: [],
      errors: [],
      error: message
    }
  }
}

const getChangedFields = (
  oldStatus: ServerStatusData | undefined,
  newStatus: ServerStatusData
): string[] | null => {
  if (oldStatus == null) return null

  const changes: string[] = []
  const oldBlock = oldStatus.backend?.blocks ?? oldStatus.blockbook?.bestHeight
  const newBlock = newStatus.backend?.blocks ?? newStatus.blockbook?.bestHeight

  if (oldStatus.status !== newStatus.status) changes.push('status')
  if (oldBlock !== newBlock) changes.push('block-height')
  if (oldStatus.blockbook?.inSync !== newStatus.blockbook?.inSync)
    changes.push('synchronized')
  if (oldStatus.blockbook?.inSyncMempool !== newStatus.blockbook?.inSyncMempool)
    changes.push('mempool-sync')
  if (oldStatus.blockbook?.lastBlockTime !== newStatus.blockbook?.lastBlockTime)
    changes.push('last-block')
  if (
    oldStatus.blockbook?.lastMempoolTime !==
    newStatus.blockbook?.lastMempoolTime
  )
    changes.push('last-mempool')
  if (oldStatus.blockbook?.version !== newStatus.blockbook?.version)
    changes.push('version')
  if (oldStatus.blockbook?.coin !== newStatus.blockbook?.coin)
    changes.push('coin')

  return changes
}

interface ServerGridProps {
  refreshKey: number
  onUpdate: (time: string) => void
}

export const ServerGrid = (props: ServerGridProps): React.ReactElement => {
  const { refreshKey, onUpdate } = props
  const [statuses, setStatuses] = useState<ServerStatusData[]>(
    servers.map(() => INITIAL_STATUS)
  )
  const [changedFieldsMap, setChangedFieldsMap] = useState<
    Map<number, string[]>
  >(new Map())
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const previousStatuses = useRef<Array<ServerStatusData | undefined>>(
    servers.map(() => undefined)
  )

  const fetchAllStatuses = useCallback(() => {
    servers.forEach((server, index) => {
      checkServerStatus(server)
        .then(newStatus => {
          const oldStatus = previousStatuses.current[index]
          const changed = getChangedFields(oldStatus, newStatus)

          setStatuses(prev => {
            const next = [...prev]
            next[index] = newStatus
            return next
          })

          if (changed != null && changed.length > 0) {
            setChangedFieldsMap(prev => {
              const next = new Map(prev)
              next.set(index, changed)
              return next
            })

            setTimeout(() => {
              setChangedFieldsMap(prev => {
                const next = new Map(prev)
                next.delete(index)
                return next
              })
            }, 1500)
          }

          previousStatuses.current[index] = newStatus
        })
        .catch(console.error)
    })

    onUpdate(new Date().toLocaleTimeString())
    setIsFirstLoad(false)
  }, [onUpdate])

  // Initial fetch and polling
  useEffect(() => {
    fetchAllStatuses()
    const interval = setInterval(fetchAllStatuses, refreshInterval)
    return () => {
      clearInterval(interval)
    }
  }, [fetchAllStatuses])

  // Manual refresh via refreshKey
  useEffect(() => {
    if (refreshKey > 0) {
      fetchAllStatuses()
    }
  }, [refreshKey, fetchAllStatuses])

  return (
    <Grid>
      {servers.map((server, index) => (
        <ServerCard
          key={server.url}
          server={server}
          statusData={statuses[index]}
          isInitialLoad={isFirstLoad}
          animationDelay={index * 0.05}
          changedFields={changedFieldsMap.get(index) ?? null}
        />
      ))}
    </Grid>
  )
}
