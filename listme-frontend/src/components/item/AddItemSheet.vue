<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-ctp-crust/60 backdrop-blur-sm" @click="close" />

        <!-- Sheet -->
        <div class="relative bg-ctp-mantle rounded-t-2xl px-4 pt-3 pb-8 safe-bottom shadow-2xl">
          <!-- Handle -->
          <div class="w-10 h-1 bg-ctp-surface1 rounded-full mx-auto mb-4" />

          <h3 class="text-base font-semibold text-ctp-text mb-3">
            {{ editingItem ? 'Item bearbeiten' : 'Item hinzufügen' }}
          </h3>

          <!-- Favorites chips -->
          <div v-if="!editingItem && favorites.length > 0" class="mb-3">
            <p class="text-[10px] text-ctp-overlay0 mb-1.5 uppercase tracking-wide">Zuletzt</p>
            <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                v-for="fav in favorites"
                :key="fav.id"
                type="button"
                @click="fillFromFavorite(fav)"
                class="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-ctp-surface0 text-ctp-subtext1 text-xs hover:bg-ctp-surface1 transition-colors"
              >
                <span v-if="fav.emoji">{{ fav.emoji }}</span>
                {{ fav.itemName }}
              </button>
            </div>
          </div>

          <!-- Name input -->
          <div class="relative mb-3">
            <input
              ref="inputRef"
              v-model="name"
              type="text"
              placeholder="z.B. Milch, Brot, Äpfel..."
              maxlength="500"
              @keydown.enter="submit"
              @keydown.escape="close"
              class="w-full bg-ctp-surface0 border border-ctp-surface1 rounded-xl px-4 py-3 text-sm text-ctp-text placeholder-ctp-overlay0 focus:outline-none focus:border-ctp-teal transition-colors"
            />
          </div>

          <!-- Quantity row -->
          <div class="flex items-center gap-2 mb-3">
            <input
              v-model.number="quantity"
              type="number"
              min="0"
              step="any"
              placeholder="Menge"
              class="w-24 bg-ctp-surface0 border border-ctp-surface1 rounded-xl px-3 py-2 text-sm text-ctp-text placeholder-ctp-overlay0 focus:outline-none focus:border-ctp-teal transition-colors"
            />
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="unit in UNITS"
                :key="unit"
                type="button"
                @click="quantityUnit = quantityUnit === unit ? '' : unit"
                class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                :class="quantityUnit === unit
                  ? 'bg-ctp-teal text-ctp-base'
                  : 'bg-ctp-surface0 text-ctp-subtext0 hover:bg-ctp-surface1'"
              >
                {{ unit }}
              </button>
            </div>
          </div>

          <!-- Labels -->
          <div v-if="listLabels.length > 0" class="mb-4">
            <p class="text-[10px] text-ctp-overlay0 mb-1.5 uppercase tracking-wide">Labels</p>
            <LabelPicker :labels="listLabels" v-model:selectedIds="selectedLabelIds" />
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="close"
              class="flex-1 py-3 rounded-xl bg-ctp-surface0 text-ctp-subtext0 text-sm font-medium hover:bg-ctp-surface1 transition-colors"
            >
              Abbrechen
            </button>
            <button
              @click="submit"
              :disabled="!name.trim()"
              class="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              :class="name.trim()
                ? 'bg-ctp-teal text-ctp-base hover:brightness-110 active:scale-95'
                : 'bg-ctp-surface1 text-ctp-overlay0 cursor-not-allowed'"
            >
              {{ editingItem ? 'Speichern' : 'Hinzufügen' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import type { Item, Favorite } from '../../types'
import { favoriteService } from '../../services/favorite'
import { useLabelsStore } from '../../stores/labels'
import LabelPicker from './LabelPicker.vue'

const UNITS = ['Stk.', 'kg', 'g', 'L', 'ml']

const props = defineProps<{
  modelValue: boolean
  editingItem?: Item | null
  listId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: { name: string; quantity: number | null; quantityUnit: string | null; labelIds: string[] }]
}>()

const labelsStore = useLabelsStore()
const listLabels = computed(() => labelsStore.getForList(props.listId))

const name = ref('')
const quantity = ref<number | ''>('')
const quantityUnit = ref('')
const selectedLabelIds = ref<string[]>([])
const favorites = ref<Favorite[]>([])
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.modelValue, async (open) => {
  if (open) {
    name.value = props.editingItem?.name ?? ''
    quantity.value = props.editingItem?.quantity ?? ''
    quantityUnit.value = props.editingItem?.quantityUnit ?? ''
    selectedLabelIds.value = props.editingItem?.labels?.map(l => l.id) ?? []
    nextTick(() => inputRef.value?.focus())

    // Load favorites and labels (non-blocking)
    if (!props.editingItem) {
      favoriteService.getAll().then(f => { favorites.value = f }).catch(() => {})
    }
    labelsStore.fetchForList(props.listId)
  }
})

function fillFromFavorite(fav: Favorite) {
  name.value = fav.itemName
  nextTick(() => inputRef.value?.focus())
}

function submit() {
  if (!name.value.trim()) return
  emit('submit', {
    name: name.value.trim(),
    quantity: quantity.value === '' ? null : quantity.value,
    quantityUnit: quantityUnit.value || null,
    labelIds: selectedLabelIds.value,
  })
  close()
}

function close() {
  name.value = ''
  quantity.value = ''
  quantityUnit.value = ''
  selectedLabelIds.value = []
  emit('update:modelValue', false)
}
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from .relative,
.sheet-leave-to .relative {
  transform: translateY(100%);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
