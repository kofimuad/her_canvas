import { useCallback, useEffect, useState } from 'react'
import { listFits, addFit, updateFit, removeFit } from '../lib/fits'

export function useFits() {
  const [fits, setFits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setFits(await listFits())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = useCallback(async (payload) => {
    const item = await addFit(payload)
    setFits((f) => [item, ...f])
    return item
  }, [])

  const toggleFavourite = useCallback(async (fit) => {
    const updated = await updateFit(fit.id, { favourite: !fit.favourite })
    setFits((fs) => fs.map((f) => (f.id === fit.id ? updated : f)))
  }, [])

  const remove = useCallback(async (fit) => {
    await removeFit(fit)
    setFits((fs) => fs.filter((f) => f.id !== fit.id))
  }, [])

  return { fits, loading, error, add, toggleFavourite, remove, refresh }
}
