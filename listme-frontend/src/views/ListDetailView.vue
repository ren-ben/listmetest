<template>
  <div class="min-h-screen bg-ctp-base">
    <!-- Connection banner -->
    <ConnectionBanner :connected="syncConnected" />

    <!-- Header -->
    <div class="sticky top-0 z-30 bg-ctp-mantle/80 backdrop-blur-xl border-b border-ctp-surface0 safe-top">
      <div class="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        <button
          @click="router.back()"
          class="p-2 rounded-xl text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="flex-1 min-w-0">
          <div v-if="list" class="flex items-center gap-2">
            <span class="text-xl">{{ list.emoji }}</span>
            <span class="font-semibold text-ctp-text truncate">{{ list.name }}</span>
          </div>
          <div v-else class="h-5 w-32 bg-ctp-surface0 rounded skeleton" />
        </div>

        <!-- Online count + progress chip + share button -->
        <div class="flex items-center gap-2 shrink-0">
          <div v-if="onlineCount > 1" class="flex items-center gap-1 text-xs text-ctp-teal">
            <span class="w-1.5 h-1.5 rounded-full bg-ctp-teal animate-pulse" />
            <span>{{ onlineCount }}</span>
          </div>
          <div v-if="list && list.itemCount > 0" class="text-xs font-medium text-ctp-subtext0">
            {{ list.checkedCount }}/{{ list.itemCount }}
          </div>
          <!-- Search button -->
          <button
            @click="toggleSearch"
            class="p-2 rounded-xl transition-colors"
            :class="showSearch ? 'text-ctp-teal bg-ctp-surface0' : 'text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0'"
            title="Suchen"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>
          <!-- Share button -->
          <button
            v-if="list"
            @click="showShareModal = true"
            class="p-2 rounded-xl text-ctp-subtext0 hover:text-ctp-teal hover:bg-ctp-surface0 transition-colors"
            title="Liste teilen"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Search bar -->
      <Transition name="search">
        <div v-if="showSearch" class="max-w-lg mx-auto px-4 pb-3">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="search"
            placeholder="Items suchen…"
            class="w-full bg-ctp-surface0 border border-ctp-surface1 rounded-xl px-4 py-2 text-sm text-ctp-text placeholder-ctp-overlay0 focus:outline-none focus:border-ctp-teal transition-colors"
          />
        </div>
      </Transition>

      <!-- Participant avatars (only shown when list has >1 participant) -->
      <ParticipantList :list-id="listId" />

      <!-- Progress bar -->
      <div v-if="list && list.itemCount > 0" class="h-0.5 bg-ctp-surface0 mx-4 rounded-full overflow-hidden">
        <div
          class="h-full bg-ctp-teal rounded-full transition-all duration-500"
          :style="{ width: progressPct + '%' }"
        />
      </div>
    </div>

    <!-- Conflict banner -->
    <ConflictBanner :conflicts="conflicts" @dismiss="dismissConflicts" />

    <!-- Content -->
    <div class="max-w-lg mx-auto px-4 py-4 pb-32">
      <div v-if="itemsStore.loading" class="space-y-2 mt-2">
        <div v-for="n in 4" :key="n" class="h-12 bg-ctp-surface0 rounded-xl skeleton" />
      </div>

      <div v-else-if="itemsStore.error" class="text-center py-12 text-ctp-red text-sm">
        {{ itemsStore.error }}
      </div>

      <div
        v-else-if="items.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center gap-3"
      >
        <span class="text-5xl">🛒</span>
        <p class="text-ctp-subtext0 text-sm">Noch keine Items. Füge das erste hinzu!</p>
      </div>

      <template v-else>
        <!-- Budget bar (shown when any unchecked item has a price) -->
        <BudgetBar :list-id="listId" :items-version="itemsVersion" />

        <div v-if="filteredItems.length === 0" class="text-center py-12 text-ctp-subtext0 text-sm">
          Keine Items für „{{ searchQuery }}" gefunden.
        </div>

        <div v-else class="space-y-1">
          <!-- Unchecked -->
          <div class="group" v-for="item in filteredUncheckedItems" :key="item.id">
            <ItemRow
              :item="item"
              @toggle="onToggle(listId, $event)"
              @edit="startEdit"
              @delete="deleteItem"
            />
          </div>

          <!-- Divider -->
          <div v-if="filteredUncheckedItems.length > 0 && filteredCheckedItems.length > 0" class="flex items-center gap-3 py-2 px-4">
            <div class="flex-1 h-px bg-ctp-surface1" />
            <span class="text-xs text-ctp-overlay0">Erledigt</span>
            <div class="flex-1 h-px bg-ctp-surface1" />
          </div>

          <!-- Checked -->
          <div class="group" v-for="item in filteredCheckedItems" :key="item.id">
            <ItemRow
              :item="item"
              @toggle="onToggle(listId, $event)"
              @edit="startEdit"
              @delete="deleteItem"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- FAB -->
    <button
      @click="showAddSheet = true"
      class="fixed bottom-24 right-4 safe-bottom w-14 h-14 rounded-full bg-gradient-to-br from-ctp-teal to-ctp-sapphire shadow-lg flex items-center justify-center text-ctp-base active:scale-95 transition-transform z-20"
    >
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <AddItemSheet
      v-model="showAddSheet"
      :editing-item="editingItem"
      :list-id="listId"
      @submit="handleItemSubmit"
    />

    <ShareListModal
      v-if="list"
      v-model="showShareModal"
      :list="list"
      @token-changed="onTokenChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListsStore } from '../stores/lists'
import { useItemsStore } from '../stores/items'
import { usePresenceStore } from '../stores/presence'
import { useListSync } from '../composables/useListSync'
import ItemRow from '../components/item/ItemRow.vue'
import AddItemSheet from '../components/item/AddItemSheet.vue'
import BudgetBar from '../components/list/BudgetBar.vue'
import ConnectionBanner from '../components/common/ConnectionBanner.vue'
import ConflictBanner from '../components/list/ConflictBanner.vue'
import ParticipantList from '../components/list/ParticipantList.vue'
import ShareListModal from '../components/list/ShareListModal.vue'
import type { Item } from '../types'

const route = useRoute()
const router = useRouter()
const listId = route.params.id as string

const listsStore = useListsStore()
const itemsStore = useItemsStore()
const presenceStore = usePresenceStore()
const { connected: syncConnected, conflicts, dismissConflicts, startSync } = useListSync()

const list = computed(() => listsStore.getById(listId))
const items = computed(() => itemsStore.getItems(listId))

// Bumped after any create/update/toggle/delete so BudgetBar re-fetches
const itemsVersion = ref(0)

const showSearch = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(i => i.name.toLowerCase().includes(q))
})
const filteredUncheckedItems = computed(() => filteredItems.value.filter(i => !i.checked))
const filteredCheckedItems = computed(() => filteredItems.value.filter(i => i.checked))

const onlineCount = computed(() => presenceStore.getCount(listId))
const progressPct = computed(() => {
  if (!list.value || list.value.itemCount === 0) return 0
  return Math.round((list.value.checkedCount / list.value.itemCount) * 100)
})

const showAddSheet = ref(false)
const showShareModal = ref(false)
const editingItem = ref<Item | null>(null)

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    nextTick(() => searchInputRef.value?.focus())
  } else {
    searchQuery.value = ''
  }
}

onMounted(async () => {
  if (!list.value) await listsStore.fetchAll()
  await itemsStore.fetchAll(listId)
  startSync(listId)
})

function onTokenChanged(token: string | null) {
  const l = listsStore.lists.find(l => l.id === listId)
  if (l) l.shareToken = token
}

function startEdit(item: Item) {
  editingItem.value = item
  showAddSheet.value = true
}

async function onToggle(lid: string, itemId: string) {
  await itemsStore.toggleCheck(lid, itemId)
  itemsVersion.value++
}

async function handleItemSubmit(payload: { name: string; quantity: number | null; quantityUnit: string | null; labelIds: string[]; price: number | null; imageUrl: string | null }) {
  if (editingItem.value) {
    await itemsStore.update(listId, editingItem.value.id, {
      name: payload.name,
      quantity: payload.quantity,
      quantityUnit: payload.quantityUnit,
      labelIds: payload.labelIds,
      price: payload.price,
      imageUrl: payload.imageUrl,
    })
    editingItem.value = null
  } else {
    await itemsStore.create(listId, {
      name: payload.name,
      quantity: payload.quantity,
      quantityUnit: payload.quantityUnit,
      labelIds: payload.labelIds,
      price: payload.price,
      imageUrl: payload.imageUrl,
    })
  }
  itemsVersion.value++
}

async function deleteItem(itemId: string) {
  await itemsStore.remove(listId, itemId)
  itemsVersion.value++
}
</script>

<style scoped>
.search-enter-active,
.search-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.search-enter-from,
.search-leave-to {
  opacity: 0;
  max-height: 0;
  padding-bottom: 0;
}
.search-enter-to,
.search-leave-from {
  opacity: 1;
  max-height: 60px;
}
</style>
