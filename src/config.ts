import { makeConfig } from 'cleaner-config'
import { asNumber, asObject, asOptional, asString } from 'cleaners'

export const asConfig = asObject({
  port: asOptional(asNumber, 8008),
  allowedDomain: asOptional(asString, 'edge.app/api/v2'),
  fetchTimeout: asOptional(asNumber, 10000)
})

export const config = makeConfig(asConfig, 'config.json')
