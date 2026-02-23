import { watch } from 'vue'
import { OperationQueue } from '../crdt/OperationQueue'
import api from '../services/api'
import { useOffline } from './useOffline'
import type { CrdtOperation } from '../crdt/types'

let flushInProgress = false

/**
 * Composable that watches the online state and flushes any queued CRDT
 * operations to the server whenever connectivity is restored.
 *
 * Mount once at the App root. Each list-detail view enqueues operations
 * while offline via OperationQueue.enqueue(); this composable drains them.
 */
export function useSyncQueue() {
  const { isOnline } = useOffline()

  watch(isOnline, async (online) => {
    if (online) await flushQueue()
  })

  return { flushQueue }
}

async function flushQueue(): Promise<void> {
  if (flushInProgress) return
  flushInProgress = true

  try {
    const pending = await OperationQueue.getAllPending()
    if (pending.length === 0) return

    // Group by listId so we can send one batch per list
    const byList = pending.reduce<Record<string, CrdtOperation[]>>((acc, op) => {
      if (!acc[op.listId]) acc[op.listId] = []
      acc[op.listId]!.push(op)
      return acc
    }, {})

    const synced: string[] = []

    for (const [listId, ops] of Object.entries(byList)) {
      try {
        await api.post(`/lists/${listId}/crdt/ops`, ops)
        synced.push(...ops.map(o => o.id))
      } catch (e) {
        // Leave failed ops in queue — will retry next reconnect
        console.warn('[SyncQueue] Failed to flush ops for list', listId, e)
      }
    }

    if (synced.length > 0) {
      await OperationQueue.markAllSynced(synced)
      await OperationQueue.pruneOld()
    }
  } finally {
    flushInProgress = false
  }
}
