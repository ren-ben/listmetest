<script setup lang="ts">
import { computed } from 'vue'
import { Teleport } from 'vue'
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()

const particles = [
  { emoji: '🍓', left: '8%',  delay: '0s',    dur: '9s',  size: '22px' },
  { emoji: '💕', left: '20%', delay: '1.5s',  dur: '11s', size: '18px' },
  { emoji: '🌸', left: '35%', delay: '0.7s',  dur: '13s', size: '24px' },
  { emoji: '⭐', left: '48%', delay: '2.2s',  dur: '10s', size: '16px' },
  { emoji: '🎀', left: '60%', delay: '0.3s',  dur: '12s', size: '26px' },
  { emoji: '💗', left: '72%', delay: '1.9s',  dur: '8s',  size: '18px' },
  { emoji: '🌷', left: '83%', delay: '0.9s',  dur: '14s', size: '22px' },
  { emoji: '✨', left: '92%', delay: '3.1s',  dur: '10s', size: '16px' },
  { emoji: '🍓', left: '14%', delay: '4.5s',  dur: '11s', size: '18px' },
  { emoji: '💕', left: '55%', delay: '5.2s',  dur: '9s',  size: '20px' },
]
</script>

<template>
  <Teleport to="body">
    <div v-if="themeStore.isHK" class="hk-bg-root" aria-hidden="true">
      <span
        v-for="(p, i) in particles"
        :key="i"
        class="hk-particle"
        :style="{
          left: p.left,
          fontSize: p.size,
          animationDuration: p.dur,
          animationDelay: p.delay,
        }"
      >{{ p.emoji }}</span>
    </div>
  </Teleport>
</template>

<style scoped>
.hk-bg-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
}

.hk-particle {
  position: absolute;
  bottom: -40px;
  animation: hk-rise linear infinite both;
  opacity: 0;
}
</style>
