import { useCallback, useEffect, useState } from 'react'

type Status = 'loading' | 'error' | 'ready'

export function useOpen5eCollection<T>(fetcher: () => Promise<T[]>) {
  const [status, setStatus] = useState<Status>('loading')
  const [items, setItems] = useState<T[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setStatus('loading')
    setError(null)
    fetcher()
      .then((data) => {
        setItems(data)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load data.')
        setStatus('error')
      })
  }, [fetcher])

  useEffect(() => {
    load()
  }, [load])

  return { status, items, error, retry: load }
}
