import Dexie, { type Table } from 'dexie'
import type { ShoppingList, Item } from '../types'

export interface CachedList extends ShoppingList {
  _savedAt: number
}

export interface CachedItem extends Item {
  _savedAt: number
}

class ListMeCacheDb extends Dexie {
  lists!: Table<CachedList, string>
  items!: Table<CachedItem, string>

  constructor() {
    super('listme-cache')
    this.version(1).stores({
      lists: 'id, _savedAt',
      items: 'id, listId, _savedAt',
    })
  }
}

export const cacheDb = new ListMeCacheDb()
