<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()

const animClass = computed(() => {
  switch (themeStore.mascotAction) {
    case 'dance':     return 'hk-anim-dance'
    case 'celebrate': return 'hk-anim-celebrate'
    case 'wave':      return 'hk-anim-wave'
    case 'entrance':  return 'hk-anim-entrance'
    default:          return 'hk-anim-float'
  }
})

const idleSpeeches = [
  'Nyaa~ 🎀', 'Kawaii~ ✨', 'Hehe~ 💕', 'Sugoi! 🌸',
  'Konnichiwa~ 🎀', 'So cute! 💗', 'Yay~ ⭐',
]

function onMascotClick() {
  const speech = idleSpeeches[Math.floor(Math.random() * idleSpeeches.length)]
  themeStore.triggerMascot('wave', speech, 1800)
}

const sparkles = [
  { tx: '-40px', ty: '-50px' }, { tx: '40px', ty: '-55px' },
  { tx: '-55px', ty: '-20px' }, { tx: '55px', ty: '-25px' },
  { tx: '-30px', ty: '-70px' }, { tx: '30px', ty: '-65px' },
  { tx: '-60px', ty: '-45px' }, { tx: '60px', ty: '-40px' },
]
</script>

<template>
  <Teleport to="body">
    <div
      v-if="themeStore.isHK"
      class="hk-mascot-root"
      @click="onMascotClick"
      aria-label="Hello Kitty Maskottchen"
    >
      <!-- Speech bubble -->
      <Transition name="speech">
        <div v-if="themeStore.mascotSpeech" class="hk-speech">
          {{ themeStore.mascotSpeech }}
          <div class="hk-speech-tail" />
        </div>
      </Transition>

      <!-- Sparkles (only on celebrate) -->
      <template v-if="themeStore.mascotAction === 'celebrate'">
        <span
          v-for="(s, i) in sparkles"
          :key="i"
          class="hk-sparkle"
          :style="{ '--tx': s.tx, '--ty': s.ty, 'animation-delay': `${i * 60}ms` }"
        >✨</span>
      </template>

      <!-- Mascot SVG -->
      <div :class="['hk-body', animClass]">
        <svg width="72" height="88" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <ellipse cx="36" cy="72" rx="20" ry="14" fill="#fff0f5" stroke="#ffb6c1" stroke-width="1.5"/>
          <!-- Left arm -->
          <ellipse cx="14" cy="70" rx="6" ry="9" fill="#fff0f5" stroke="#ffb6c1" stroke-width="1.5" transform="rotate(-20 14 70)"/>
          <!-- Right arm -->
          <ellipse cx="58" cy="70" rx="6" ry="9" fill="#fff0f5" stroke="#ffb6c1" stroke-width="1.5" transform="rotate(20 58 70)"/>

          <!-- Head -->
          <ellipse cx="36" cy="34" rx="26" ry="28" fill="white" stroke="#ffb6c1" stroke-width="1.5"/>

          <!-- Left ear -->
          <ellipse cx="13" cy="14" rx="8" ry="10" fill="white" stroke="#ffb6c1" stroke-width="1.5"/>
          <!-- Right ear -->
          <ellipse cx="59" cy="14" rx="8" ry="10" fill="white" stroke="#ffb6c1" stroke-width="1.5"/>

          <!-- Bow on right ear -->
          <g transform="translate(54, 4)">
            <ellipse cx="-4" cy="6" rx="6" ry="4" fill="#ff69b4" transform="rotate(-30 -4 6)"/>
            <ellipse cx="4" cy="6" rx="6" ry="4" fill="#ff69b4" transform="rotate(30 4 6)"/>
            <circle cx="0" cy="6" r="3" fill="#ff1493"/>
          </g>

          <!-- Eyes -->
          <ellipse cx="26" cy="34" rx="4.5" ry="5" fill="#3d1a2e"/>
          <ellipse cx="46" cy="34" rx="4.5" ry="5" fill="#3d1a2e"/>
          <!-- Eye shine -->
          <circle cx="27.5" cy="32" r="1.5" fill="white"/>
          <circle cx="47.5" cy="32" r="1.5" fill="white"/>

          <!-- Nose (yellow oval) -->
          <ellipse cx="36" cy="42" rx="3" ry="2" fill="#ffd700"/>

          <!-- Blush -->
          <ellipse cx="20" cy="44" rx="5" ry="3.5" fill="#ffb6c1" opacity="0.7"/>
          <ellipse cx="52" cy="44" rx="5" ry="3.5" fill="#ffb6c1" opacity="0.7"/>

          <!-- Whiskers left -->
          <line x1="6" y1="40" x2="24" y2="43" stroke="#ffabbe" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="6" y1="45" x2="24" y2="45" stroke="#ffabbe" stroke-width="1.2" stroke-linecap="round"/>
          <!-- Whiskers right -->
          <line x1="66" y1="40" x2="48" y2="43" stroke="#ffabbe" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="66" y1="45" x2="48" y2="45" stroke="#ffabbe" stroke-width="1.2" stroke-linecap="round"/>

          <!-- Teal belly dot (ListMe accent) -->
          <circle cx="36" cy="72" r="5" fill="#ff69b4" opacity="0.6"/>
        </svg>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.hk-mascot-root {
  position: fixed;
  bottom: 5.5rem;
  left: 1rem;
  z-index: 45;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  user-select: none;
}

/* Action animations */
.hk-anim-float    { animation: hk-float    3.2s ease-in-out infinite; }
.hk-anim-dance    { animation: hk-dance    0.8s ease-in-out 3; }
.hk-anim-celebrate{ animation: hk-celebrate 0.6s ease-in-out 4; }
.hk-anim-wave     { animation: hk-wave     0.7s ease-in-out 2; }
.hk-anim-entrance { animation: hk-entrance 0.7s cubic-bezier(0.16,1,0.3,1) both; }

/* Speech bubble */
.hk-speech {
  position: relative;
  background: white;
  border: 2px solid #ff69b4;
  border-radius: 14px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #5a1530;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(255, 105, 180, 0.3);
  animation: hk-speech-pop 0.3s cubic-bezier(0.16,1,0.3,1) both;
}
.hk-speech-tail {
  position: absolute;
  bottom: -9px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 9px solid #ff69b4;
}
.hk-speech-tail::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: -5px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 7px solid white;
}

/* Sparkles */
.hk-sparkle {
  position: absolute;
  font-size: 14px;
  animation: hk-spark 0.7s ease-out both;
  pointer-events: none;
}

/* Speech transition */
.speech-enter-active { animation: hk-speech-pop 0.3s cubic-bezier(0.16,1,0.3,1) both; }
.speech-leave-active { transition: opacity 0.2s ease; }
.speech-leave-to    { opacity: 0; }
</style>
