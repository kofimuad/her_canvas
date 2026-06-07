import { useCallback, useEffect, useState } from 'react'
import { listBoards, saveBoard, duplicateBoard, removeBoard, renameBoard, updateBoard } from '../lib/boards'

export function useBoards() {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setBoards(await listBoards())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(async (board) => {
    const item = await saveBoard(board)
    setBoards((b) => [item, ...b])
    return item
  }, [])

  const duplicate = useCallback(async (board) => {
    const item = await duplicateBoard(board)
    setBoards((b) => [item, ...b])
    return item
  }, [])

  const rename = useCallback(async (board, name) => {
    const updated = await renameBoard(board.id, name)
    setBoards((bs) => bs.map((b) => (b.id === board.id ? updated : b)))
  }, [])

  const update = useCallback(async (board, patch) => {
    const updated = await updateBoard(board.id, patch)
    setBoards((bs) => bs.map((b) => (b.id === board.id ? updated : b)))
    return updated
  }, [])

  const remove = useCallback(async (board) => {
    await removeBoard(board)
    setBoards((bs) => bs.filter((b) => b.id !== board.id))
  }, [])

  return { boards, loading, error, save, duplicate, rename, update, remove, refresh }
}
