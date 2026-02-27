<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { shareService } from '../../services/share'
import type { ParticipantResponse } from '../../types'

const props = defineProps<{ listId: string }>()

const participants = ref<ParticipantResponse[]>([])

onMounted(async () => {
  try {
    participants.value = await shareService.getParticipants(props.listId)
  } catch {
    // non-critical — silently ignore
  }
})

const MAX_VISIBLE = 5
const visible = computed(() => participants.value.slice(0, MAX_VISIBLE))
const overflow = computed(() => Math.max(0, participants.value.length - MAX_VISIBLE))

// Use first char of UUID as avatar letter
function avatarLetter(deviceId: string) {
  return deviceId.charAt(0).toUpperCase()
}

// Cycle through accent colors per index
const colors = ['bg-ctp-teal', 'bg-ctp-sapphire', 'bg-ctp-green', 'bg-ctp-mauve', 'bg-ctp-peach']
function avatarColor(index: number) {
  return colors[index % colors.length]
}
</script>

<template>
  <div v-if="participants.length > 1" class="flex items-center gap-1 px-4 pb-2">
    <div
      v-for="(p, i) in visible"
      :key="p.deviceId"
      class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-ctp-base shrink-0 -ml-1 first:ml-0 ring-1 ring-ctp-mantle"
      :class="avatarColor(i)"
      :title="p.role"
    >
      {{ avatarLetter(p.deviceId) }}
    </div>
    <div
      v-if="overflow > 0"
      class="w-6 h-6 rounded-full bg-ctp-surface1 flex items-center justify-center text-[9px] font-bold text-ctp-subtext0 -ml-1 ring-1 ring-ctp-mantle"
    >
      +{{ overflow }}
    </div>
    <span class="text-xs text-ctp-overlay0 ml-2">
      {{ participants.length }} Teilnehmer
    </span>
  </div>
</template>
