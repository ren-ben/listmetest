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

        <!-- Online count + progress chip -->
        <div class="flex items-center gap-2 shrink-0">
          <div v-if="onlineCount > 1" class="flex items-center gap-1 text-xs text-ctp-teal">
            <span class="w-1.5 h-1.5 rounded-full bg-ctp-teal animate-pulse" />
            <span>{{ onlineCount }}</span>
          </div>
          <div v-if="list && list.itemCount > 0" class="text-xs font-medium text-ctp-subtext0">
            {{ list.checkedCount }}/{{ list.itemCount }}
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div v-if="list && list.itemCount > 0" class="h-0.5 bg-ctp-surface0 mx-4 rounded-full overflow-hidden">
        <div
          class="h-full bg-ctp-teal rounded-full transition-all duration-500"
          :style="{ width: progressPct + '%' }"
        />
      </div>
    </div>

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

      <div v-else class="space-y-1">
        <!-- Unchecked -->
        <div class="group" v-for="item in uncheckedItems" :key="item.id">
          <ItemRow
            :item="item"
            @toggle="itemsStore.toggleCheck(listId, $event)"
            @edit="startEdit"
            @delete="deleteItem"
          />
        </div>

        <!-- Divider -->
        <div v-if="uncheckedItems.length > 0 && checkedItems.length > 0" class="flex items-center gap-3 py-2 px-4">
          <div class="flex-1 h-px bg-ctp-surface1" />
          <span class="text-xs text-ctp-overlay0">Erledigt</span>
          <div class="flex-1 h-px bg-ctp-surface1" />
        </div>

        <!-- Checked -->
        <div class="group" v-for="item in checkedItems" :key="item.id">
          <ItemRow
            :item="item"
            @toggle="itemsStore.toggleCheck(listId, $event)"
            @edit="startEdit"
            @delete="deleteItem"
          />
        </div>
      </div>
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
      @submit="handleItemSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListsStore } from '../stores/lists'
import { useItemsStore } from '../stores/items'
import { usePresenceStore } from '../stores/presence'
import { useListSync } from '../composables/useListSync'
import ItemRow from '../components/item/ItemRow.vue'
import AddItemSheet from '../components/item/AddItemSheet.vue'
import ConnectionBanner from '../components/common/ConnectionBanner.vue'
import type { Item } from '../types'

const route = useRoute()
const router = useRouter()
const listId = route.params.id as string

const listsStore = useListsStore()
const itemsStore = useItemsStore()
const presenceStore = usePresenceStore()
const { connected: syncConnected, startSync } = useListSync()

const list = computed(() => listsStore.getById(listId))
const items = computed(() => itemsStore.getItems(listId))
const uncheckedItems = computed(() => items.value.filter(i => !i.checked))
const checkedItems = computed(() => items.value.filter(i => i.checked))
const onlineCount = computed(() => presenceStore.getCount(listId))
const progressPct = computed(() => {
  if (!list.value || list.value.itemCount === 0) return 0
  return Math.round((list.value.checkedCount / list.value.itemCount) * 100)
})

const showAddSheet = ref(false)
const editingItem = ref<Item | null>(null)

onMounted(async () => {
  if (!list.value) await listsStore.fetchAll()
  await itemsStore.fetchAll(listId)
  // Start real-time sync (non-blocking — works offline too)
  startSync(listId)
})

function startEdit(item: Item) {
  editingItem.value = item
  showAddSheet.value = true
}

async function handleItemSubmit(name: string) {
  if (editingItem.value) {
    await itemsStore.update(listId, editingItem.value.id, { name })
    editingItem.value = null
  } else {
    await itemsStore.create(listId, { name })
  }
}

async function deleteItem(itemId: string) {
  await itemsStore.remove(listId, itemId)
}
</script>
