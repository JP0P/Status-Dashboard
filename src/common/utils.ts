export const snooze = async (ms: number): Promise<void> => {
  await new Promise((resolve: Function) => setTimeout(resolve, ms))
}

export const retryFetch = async (
  request: RequestInfo,
  init?: RequestInit,
  maxRetries: number = 3
): Promise<Response> => {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(request, init)

      // If successful or not a 500 error, return immediately
      if (response.ok || response.status !== 500) {
        return response
      }

      lastError = new Error(`HTTP ${response.status}`)
      if (attempt < maxRetries - 1) {
        await snooze(500)
      }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      if (attempt < maxRetries - 1) {
        await snooze(500)
      }
    }
  }

  throw lastError ?? new Error('Fetch failed after retries')
}

export const getTimeSince = (timestamp: string): string => {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    const remainingHours = diffHours % 24
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    const remainingMins = diffMins % 60
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${remainingMins} min${remainingMins !== 1 ? 's' : ''} ago`
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  } else {
    return 'just now'
  }
}
