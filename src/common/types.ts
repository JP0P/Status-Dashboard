import { asBoolean, asNumber, asObject, asOptional, asString } from 'cleaners'

export const asBlockbookInfo = asObject({
  coin: asOptional(asString),
  version: asOptional(asString),
  bestHeight: asOptional(asNumber),
  lastBlockTime: asOptional(asString),
  lastMempoolTime: asOptional(asString),
  inSync: asOptional(asBoolean),
  inSyncMempool: asOptional(asBoolean)
})

export const asBackendInfo = asObject({
  blocks: asOptional(asNumber),
  version: asOptional(asString),
  error: asOptional(asString),
  warnings: asOptional(asString)
})

export const asBlockbookResponse = asObject({
  blockbook: asBlockbookInfo,
  backend: asBackendInfo
})

export type BlockbookInfo = ReturnType<typeof asBlockbookInfo>
export type BackendInfo = ReturnType<typeof asBackendInfo>
export type BlockbookResponse = ReturnType<typeof asBlockbookResponse>

export interface ServerConfig {
  name: string
  region: string
  url: string
  accentColor: string
}

export type ServerStatus =
  | 'online'
  | 'warning'
  | 'error'
  | 'offline'
  | 'checking'

export interface ServerStatusData {
  status: ServerStatus
  blockbook: Partial<BlockbookInfo>
  backend: Partial<BackendInfo>
  warnings: string[]
  errors: string[]
  error: string | null
}
