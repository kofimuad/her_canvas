import { useCallback, useEffect, useState } from 'react'
import { listShoots, saveShoot, updateShoot, removeShoot } from '../lib/shoots'

export function useShoots() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setPlans(await listShoots())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(async (plan) => {
    const item = await saveShoot(plan)
    setPlans((p) => [item, ...p])
    return item
  }, [])

  const update = useCallback(async (plan, patch) => {
    const updated = await updateShoot(plan.id, patch)
    setPlans((ps) => ps.map((p) => (p.id === plan.id ? updated : p)))
    return updated
  }, [])

  const remove = useCallback(async (plan) => {
    await removeShoot(plan)
    setPlans((ps) => ps.filter((p) => p.id !== plan.id))
  }, [])

  return { plans, loading, error, save, update, remove, refresh }
}
