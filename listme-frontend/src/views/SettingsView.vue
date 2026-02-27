<template>
  <div class="pt-16 pb-24 px-5 max-w-lg mx-auto">
    <!-- Header -->
    <div class="mt-4 mb-8 animate-fade-up">
      <p class="text-ctp-overlay1 text-sm">Personalisierung</p>
      <h2 class="text-2xl font-bold text-ctp-text mt-0.5">Einstellungen</h2>
    </div>

    <!-- Appearance section -->
    <section class="mb-6 animate-fade-up" style="animation-delay: 60ms">
      <p class="text-xs font-semibold text-ctp-overlay0 uppercase tracking-wider mb-3 px-1">
        Erscheinungsbild
      </p>
      <div class="bg-ctp-surface0/60 border border-ctp-surface1/40 rounded-2xl overflow-hidden divide-y divide-ctp-surface1/40">
        <!-- Dark/light toggle -->
        <div class="flex items-center justify-between px-4 py-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                 :class="isDark ? 'bg-ctp-sapphire/15 text-ctp-sapphire' : 'bg-ctp-yellow/15 text-ctp-yellow'">
              <svg v-if="isDark" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5" />
                <path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-ctp-text">Design</p>
              <p class="text-xs text-ctp-subtext0 mt-0.5">{{ isDark ? 'Dunkel (Frappe)' : 'Hell (Latte)' }}</p>
            </div>
          </div>
          <button
            @click="themeStore.toggle()"
            aria-label="Design wechseln"
            class="pressable relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-teal"
            :class="isDark ? 'bg-ctp-teal' : 'bg-ctp-surface2'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-ctp-base shadow transition-transform duration-300"
              :class="isDark ? 'translate-x-6' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Hello Kitty toggle (only after unlock) -->
        <Transition name="hk-row">
          <div v-if="themeStore.hkUnlocked" class="flex items-center justify-between px-4 py-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                   :class="themeStore.isHK ? 'bg-pink-200/60' : 'bg-ctp-surface1/60'">
                🎀
              </div>
              <div>
                <p class="text-sm font-medium text-ctp-text">Kawaii Mode</p>
                <p class="text-xs text-ctp-subtext0 mt-0.5">Hello Kitty Theme 🍓</p>
              </div>
            </div>
            <button
              @click="themeStore.toggleHK()"
              aria-label="Kawaii Mode umschalten"
              class="pressable relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2"
              :class="themeStore.isHK ? 'bg-pink-400' : 'bg-ctp-surface2'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
                :class="themeStore.isHK ? 'translate-x-6' : 'translate-x-0'"
              />
            </button>
          </div>
        </Transition>
      </div>
    </section>

    <!-- About section -->
    <section class="animate-fade-up" style="animation-delay: 120ms">
      <p class="text-xs font-semibold text-ctp-overlay0 uppercase tracking-wider mb-3 px-1">
        App
      </p>
      <div class="bg-ctp-surface0/60 border border-ctp-surface1/40 rounded-2xl divide-y divide-ctp-surface1/40">
        <!-- Version row — clickable easter egg -->
        <button
          class="w-full flex items-center justify-between px-4 py-3.5 select-none focus:outline-none"
          @click="onVersionClick"
          aria-label="Version"
        >
          <span class="text-sm text-ctp-text">Version</span>
          <span class="text-sm text-ctp-subtext0 font-mono flex items-center gap-1.5">
            Phase 9
            <span v-if="versionClicks > 0 && versionClicks < 10" class="text-xs text-ctp-overlay0">({{ versionClicks }}/10)</span>
          </span>
        </button>
        <div class="flex items-center justify-between px-4 py-3.5">
          <span class="text-sm text-ctp-text">Theme</span>
          <span class="text-sm text-ctp-subtext0">
            {{ themeStore.isHK ? 'Hello Kitty 🎀' : isDark ? 'Catppuccin Frappe' : 'Catppuccin Latte' }}
          </span>
        </div>
        <div class="flex items-center justify-between px-4 py-3.5">
          <span class="text-sm text-ctp-text">Offline-first</span>
          <span class="text-sm text-ctp-green font-medium">Aktiv</span>
        </div>
      </div>
    </section>
  </div>

  <!-- Unlock overlay (Teleported to body) -->
  <Teleport to="body">
    <Transition name="unlock-overlay">
      <div
        v-if="showUnlockOverlay"
        class="hk-unlock-overlay"
        @click.self="dismissOverlay"
      >
        <!-- Confetti -->
        <span v-for="i in 18" :key="i" class="hk-confetti" :style="{
          left: `${(i * 5.5) % 100}%`,
          animationDelay: `${(i * 0.09).toFixed(2)}s`,
          fontSize: i % 3 === 0 ? '22px' : i % 2 === 0 ? '16px' : '20px',
          '--rot': `${(i * 37) % 360}deg`,
        }">{{ ['🍓','💕','🌸','⭐','🎀','✨','🌷','💗'][i % 8] }}</span>

        <!-- Card -->
        <div class="hk-unlock-card">
          <!-- Mascot mini -->
          <div class="hk-unlock-mascot">
            <svg width="90" height="108" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="36" cy="72" rx="20" ry="14" fill="#fff0f5" stroke="#ffb6c1" stroke-width="1.5"/>
              <ellipse cx="14" cy="70" rx="6" ry="9" fill="#fff0f5" stroke="#ffb6c1" stroke-width="1.5" transform="rotate(-20 14 70)"/>
              <ellipse cx="58" cy="70" rx="6" ry="9" fill="#fff0f5" stroke="#ffb6c1" stroke-width="1.5" transform="rotate(20 58 70)"/>
              <ellipse cx="36" cy="34" rx="26" ry="28" fill="white" stroke="#ffb6c1" stroke-width="1.5"/>
              <ellipse cx="13" cy="14" rx="8" ry="10" fill="white" stroke="#ffb6c1" stroke-width="1.5"/>
              <ellipse cx="59" cy="14" rx="8" ry="10" fill="white" stroke="#ffb6c1" stroke-width="1.5"/>
              <g transform="translate(54, 4)">
                <ellipse cx="-4" cy="6" rx="6" ry="4" fill="#ff69b4" transform="rotate(-30 -4 6)"/>
                <ellipse cx="4" cy="6" rx="6" ry="4" fill="#ff69b4" transform="rotate(30 4 6)"/>
                <circle cx="0" cy="6" r="3" fill="#ff1493"/>
              </g>
              <ellipse cx="26" cy="34" rx="4.5" ry="5" fill="#3d1a2e"/>
              <ellipse cx="46" cy="34" rx="4.5" ry="5" fill="#3d1a2e"/>
              <circle cx="27.5" cy="32" r="1.5" fill="white"/>
              <circle cx="47.5" cy="32" r="1.5" fill="white"/>
              <ellipse cx="36" cy="42" rx="3" ry="2" fill="#ffd700"/>
              <ellipse cx="20" cy="44" rx="5" ry="3.5" fill="#ffb6c1" opacity="0.7"/>
              <ellipse cx="52" cy="44" rx="5" ry="3.5" fill="#ffb6c1" opacity="0.7"/>
              <line x1="6" y1="40" x2="24" y2="43" stroke="#ffabbe" stroke-width="1.2" stroke-linecap="round"/>
              <line x1="6" y1="45" x2="24" y2="45" stroke="#ffabbe" stroke-width="1.2" stroke-linecap="round"/>
              <line x1="66" y1="40" x2="48" y2="43" stroke="#ffabbe" stroke-width="1.2" stroke-linecap="round"/>
              <line x1="66" y1="45" x2="48" y2="45" stroke="#ffabbe" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </div>

          <h2 class="hk-unlock-title">Secret Unlocked! 🎀</h2>
          <p class="hk-unlock-subtitle">Kawaii Mode ist jetzt verfügbar~<br/>Viel Spaß mit Hello Kitty! 🍓✨</p>

          <button class="hk-unlock-btn" @click="activateHK">
            Kawaii Mode starten ✨
          </button>
          <button class="hk-unlock-dismiss" @click="dismissOverlay">
            Vielleicht später
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.theme === 'dark')

const versionClicks = ref(0)
const showUnlockOverlay = ref(false)

function onVersionClick() {
  if (themeStore.hkUnlocked) return
  versionClicks.value++
  if (versionClicks.value >= 10) {
    showUnlockOverlay.value = true
  }
}

function activateHK() {
  themeStore.unlock()
  showUnlockOverlay.value = false
  versionClicks.value = 0
}

function dismissOverlay() {
  showUnlockOverlay.value = false
  // Still unlock so the toggle shows, just don't activate
  if (!themeStore.hkUnlocked) {
    themeStore.unlock()
    themeStore.toggleHK() // turn it back off
  }
  versionClicks.value = 0
}
</script>

<style scoped>
/* HK row slide-in */
.hk-row-enter-active { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
.hk-row-leave-active { transition: all 0.25s ease; }
.hk-row-enter-from  { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.hk-row-enter-to    { opacity: 1; max-height: 80px; }
.hk-row-leave-to    { opacity: 0; }

/* Overlay */
.hk-unlock-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(90, 21, 48, 0.55);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.unlock-overlay-enter-active { animation: hk-bounce-in 0.5s cubic-bezier(0.16,1,0.3,1) both; }
.unlock-overlay-leave-active { transition: opacity 0.25s ease; }
.unlock-overlay-leave-to    { opacity: 0; }

.hk-confetti {
  position: absolute;
  top: -30px;
  animation: hk-confetti-fall linear infinite;
  animation-duration: 3s;
  pointer-events: none;
}

.hk-unlock-card {
  background: white;
  border-radius: 28px;
  padding: 36px 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 24px 64px rgba(255, 105, 180, 0.4), 0 0 0 3px #ff69b4;
  position: relative;
  z-index: 1;
  animation: hk-bounce-in 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both;
}

.hk-unlock-mascot {
  animation: hk-celebrate 0.6s ease-in-out 5;
  margin-bottom: 4px;
}

.hk-unlock-title {
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(90deg, #ff1493, #ff69b4, #da70d6, #ff1493);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: hk-shimmer-text 2s linear infinite;
  margin: 0;
}

.hk-unlock-subtitle {
  font-size: 14px;
  color: #8b2447;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.hk-unlock-btn {
  margin-top: 8px;
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  color: white;
  font-weight: 700;
  font-size: 15px;
  padding: 13px 28px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 6px 20px rgba(255, 20, 147, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  animation: hk-pulse-pink 2s ease-in-out infinite;
}
.hk-unlock-btn:active {
  transform: scale(0.97);
}

.hk-unlock-dismiss {
  background: none;
  border: none;
  font-size: 13px;
  color: #d44f7a;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0.8;
  transition: opacity 0.15s;
}
.hk-unlock-dismiss:hover { opacity: 1; }
</style>
