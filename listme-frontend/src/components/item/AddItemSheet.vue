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

          <h3 class="text-base font-semibold text-ctp-text mb-4">
            {{ editingItem ? 'Item bearbeiten' : 'Item hinzufügen' }}
          </h3>

          <!-- Name input -->
          <div class="relative mb-4">
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
import { ref, watch, nextTick } from 'vue'
import type { Item } from '../../types'

const props = defineProps<{
  modelValue: boolean
  editingItem?: Item | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [name: string]
}>()

const name = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.modelValue, (open) => {
  if (open) {
    name.value = props.editingItem?.name ?? ''
    nextTick(() => inputRef.value?.focus())
  }
})

function submit() {
  if (!name.value.trim()) return
  emit('submit', name.value.trim())
  close()
}

function close() {
  name.value = ''
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
</style>
