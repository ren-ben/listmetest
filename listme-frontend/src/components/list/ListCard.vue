<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ShoppingList, AccentColor } from '../../types'

const props = defineProps<{
  list: ShoppingList
  index: number
}>()

const router = useRouter()

const progress = computed(() =>
  props.list.itemCount > 0
    ? Math.round((props.list.checkedCount / props.list.itemCount) * 100)
    : 0
)

const accentColor = computed<AccentColor>(() => {
  const colors: AccentColor[] = ['teal', 'green', 'sapphire']
  return colors[props.index % 3] ?? 'teal'
})

const accentClasses = computed(() => {
  const map: Record<AccentColor, { border: string; progress: string; glow: string; badge: string }> = {
    green: {
      border: 'border-l-ctp-green',
      progress: 'bg-ctp-green',
      glow: 'shadow-ctp-green/10',
      badge: 'bg-ctp-green/10 text-ctp-green',
    },
    teal: {
      border: 'border-l-ctp-teal',
      progress: 'bg-ctp-teal',
      glow: 'shadow-ctp-teal/10',
      badge: 'bg-ctp-teal/10 text-ctp-teal',
    },
    sapphire: {
      border: 'border-l-ctp-sapphire',
      progress: 'bg-ctp-sapphire',
      glow: 'shadow-ctp-sapphire/10',
      badge: 'bg-ctp-sapphire/10 text-ctp-sapphire',
    },
  }
  return map[accentColor.value]
})

const timeAgo = computed(() => {
  const diff = Date.now() - new Date(props.list.updatedAt).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'gerade eben'
  if (mins < 60) return `vor ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `vor ${hours}h`
  return `vor ${Math.floor(hours / 24)}d`
})
</script>

<template>
  <article
    class="
      pressable group
      bg-ctp-surface0/60 hover:bg-ctp-surface0
      border border-ctp-surface1/50 hover:border-ctp-surface1
      border-l-[3px] rounded-2xl
      p-4 cursor-pointer
      transition-all duration-200
      animate-fade-up
    "
    :class="[accentClasses.border, accentClasses.glow]"
    :style="{ animationDelay: `${index * 60}ms` }"
    @click="router.push({ name: 'list-detail', params: { id: list.id } })"
  >
    <div class="flex items-start justify-between gap-3">
      <!-- Left: emoji + info -->
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <span class="text-2xl leading-none mt-0.5 shrink-0" role="img">{{ list.emoji }}</span>

        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-ctp-text truncate leading-tight">
            {{ list.name }}
          </h3>

          <div class="flex items-center gap-2 mt-1.5 text-xs text-ctp-overlay1">
            <span>{{ list.checkedCount }}/{{ list.itemCount }} items</span>
            <span class="w-0.5 h-0.5 rounded-full bg-ctp-overlay0" />
            <span>{{ timeAgo }}</span>
          </div>

          <!-- Participant count chip for shared lists -->
          <div v-if="list.participantCount > 1" class="flex items-center gap-1 mt-2">
            <svg class="w-3 h-3 text-ctp-overlay0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <span class="text-[10px] text-ctp-overlay0">{{ list.participantCount }} Teilnehmer</span>
          </div>
        </div>
      </div>

      <!-- Right: progress badge -->
      <div
        class="shrink-0 px-2 py-1 rounded-lg text-[11px] font-semibold tabular-nums"
        :class="accentClasses.badge"
      >
        {{ progress }}%
      </div>
    </div>

    <!-- Progress bar -->
    <div class="mt-3 h-1 bg-ctp-surface1 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-700 ease-out"
        :class="accentClasses.progress"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </article>
</template>
