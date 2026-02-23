import { defineStore } from 'pinia'
import { ref } from 'vue'
import { itemService } from '../services/item'
import { CacheService } from '../services/cache'
import { useListsStore } from './lists'
import type { Item, CreateItemRequest, UpdateItemRequest } from '../types'

export const useItemsStore = defineStore('items', () => {
  // Items keyed by listId for multi-list caching
  const itemsByList = ref<Record<string, Item[]>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getItems(listId: string): Item[] {
    return itemsByList.value[listId] ?? []
  }

  async function fetchAll(listId: string) {
    loading.value = true
    error.value = null

    // Serve cached items immediately so the list feels instant
    const cached = await CacheService.getItems(listId)
    if (cached.length > 0) {
      itemsByList.value[listId] = cached
      loading.value = false
    }

    try {
      const fresh = await itemService.getAll(listId)
      itemsByList.value[listId] = fresh
      await CacheService.saveItems(listId, fresh)
    } catch {
      if ((itemsByList.value[listId] ?? []).length === 0) {
        error.value = 'Items konnten nicht geladen werden'
      }
      // Silently stay on cached data when offline
    } finally {
      loading.value = false
    }
  }

  async function create(listId: string, req: CreateItemRequest): Promise<Item> {
    const item = await itemService.create(listId, req)
    if (!itemsByList.value[listId]) itemsByList.value[listId] = []
    itemsByList.value[listId].push(item)
    await CacheService.saveItem(item)
    syncCounts(listId)
    return item
  }

  async function update(listId: string, itemId: string, req: UpdateItemRequest): Promise<void> {
    const updated = await itemService.update(listId, itemId, req)
    const items = itemsByList.value[listId] ?? []
    const idx = items.findIndex(i => i.id === itemId)
    if (idx !== -1) items[idx] = updated
    await CacheService.saveItem(updated)
  }

  async function toggleCheck(listId: string, itemId: string): Promise<void> {
    const updated = await itemService.toggleCheck(listId, itemId)
    const items = itemsByList.value[listId] ?? []
    const idx = items.findIndex(i => i.id === itemId)
    if (idx !== -1) items[idx] = updated
    await CacheService.saveItem(updated)
    syncCounts(listId)
  }

  async function remove(listId: string, itemId: string): Promise<void> {
    await itemService.delete(listId, itemId)
    if (itemsByList.value[listId]) {
      itemsByList.value[listId] = itemsByList.value[listId].filter(i => i.id !== itemId)
    }
    await CacheService.removeItem(itemId)
    syncCounts(listId)
  }

  function syncCounts(listId: string) {
    const items = itemsByList.value[listId] ?? []
    useListsStore().patchCounts(listId, items.length, items.filter(i => i.checked).length)
  }

  return { itemsByList, loading, error, getItems, fetchAll, create, update, toggleCheck, remove }
})
