// API types (match backend DTOs)

export interface ShoppingList {
  id: string
  name: string
  emoji: string
  shareToken: string | null
  itemCount: number
  checkedCount: number
  participantCount: number
  createdAt: string
  updatedAt: string
}

export interface Item {
  id: string
  listId: string
  name: string
  checked: boolean
  position: number
  categoryId: string | null
  categoryName: string | null
  categoryColor: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string | null
  position: number
}

// UI-only helpers

export type AccentColor = 'green' | 'teal' | 'sapphire'

export interface Participant {
  id: string
  initials: string
  online: boolean
}

// Request types

export interface CreateListRequest {
  name: string
  emoji?: string
}

export interface UpdateListRequest {
  name: string
  emoji?: string
}

export interface CreateItemRequest {
  name: string
  categoryId?: string
}

export interface UpdateItemRequest {
  name: string
  categoryId?: string
}

export interface CreateCategoryRequest {
  name: string
  color?: string
}
