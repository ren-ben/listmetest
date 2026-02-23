<template>
  <Transition name="banner">
    <div
      v-if="show"
      class="fixed top-14 left-0 right-0 z-40 flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium safe-top"
      :class="bannerClass"
    >
      <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="dotClass" />
      <span>{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useOffline } from '../../composables/useOffline'

const props = defineProps<{ connected: boolean }>()

const { isOnline } = useOffline()

const show = ref(false)
let hideTimeout: ReturnType<typeof setTimeout> | null = null

/** Worst-case state: offline HTTP > offline WS > connected */
const status = computed<'offline' | 'syncing' | 'connected'>(() => {
  if (!isOnline.value) return 'offline'
  if (!props.connected) return 'syncing'
  return 'connected'
})

const bannerClass = computed(() => ({
  'bg-ctp-red/15 text-ctp-red border-b border-ctp-red/20': status.value === 'offline',
  'bg-ctp-yellow/15 text-ctp-yellow border-b border-ctp-yellow/20': status.value === 'syncing',
  'bg-ctp-green/15 text-ctp-green border-b border-ctp-green/20': status.value === 'connected',
}))

const dotClass = computed(() => ({
  'bg-ctp-red': status.value === 'offline',
  'bg-ctp-yellow animate-pulse': status.value === 'syncing',
  'bg-ctp-green animate-pulse': status.value === 'connected',
}))

const message = computed(() => {
  if (status.value === 'offline') return 'Kein Internet — Änderungen werden gespeichert'
  if (status.value === 'syncing') return 'Verbindung wird hergestellt…'
  return 'Verbunden — Änderungen werden live synchronisiert'
})

onMounted(() => {
  if (status.value !== 'connected') show.value = true
})

watch(status, (next, prev) => {
  if (hideTimeout) clearTimeout(hideTimeout)
  show.value = true
  if (next === 'connected' && prev !== 'connected') {
    hideTimeout = setTimeout(() => { show.value = false }, 2000)
  }
})
</script>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: all 0.25s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
