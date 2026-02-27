import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type ColorTheme = 'dark' | 'light'
export type MascotAction = 'idle' | 'dance' | 'celebrate' | 'wave' | 'entrance'

const THEME_KEY = 'listme-theme'
const HK_UNLOCKED_KEY = 'listme-hk-unlocked'
const HK_MODE_KEY = 'listme-hk-mode'

const HK_THEME_COLOR = '#ff69b4'
const DARK_THEME_COLOR = '#303446'
const LIGHT_THEME_COLOR = '#eff1f5'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ColorTheme>((localStorage.getItem(THEME_KEY) as ColorTheme) ?? 'dark')
  const hkUnlocked = ref(localStorage.getItem(HK_UNLOCKED_KEY) === 'true')
  const hkMode = ref(localStorage.getItem(HK_MODE_KEY) === 'true')

  const mascotAction = ref<MascotAction>('idle')
  const mascotSpeech = ref<string | null>(null)

  const isHK = computed(() => hkUnlocked.value && hkMode.value)

  function applyTheme() {
    const html = document.documentElement
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')

    if (isHK.value) {
      html.setAttribute('data-theme', 'hellokitty')
      metaThemeColor?.setAttribute('content', HK_THEME_COLOR)
    } else if (theme.value === 'light') {
      html.setAttribute('data-theme', 'latte')
      metaThemeColor?.setAttribute('content', LIGHT_THEME_COLOR)
    } else {
      html.removeAttribute('data-theme')
      metaThemeColor?.setAttribute('content', DARK_THEME_COLOR)
    }
  }

  function init() {
    applyTheme()
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function unlock() {
    hkUnlocked.value = true
    hkMode.value = true
    localStorage.setItem(HK_UNLOCKED_KEY, 'true')
    localStorage.setItem(HK_MODE_KEY, 'true')
    applyTheme()
  }

  function toggleHK() {
    hkMode.value = !hkMode.value
    localStorage.setItem(HK_MODE_KEY, String(hkMode.value))
    applyTheme()
  }

  let mascotTimer: ReturnType<typeof setTimeout> | null = null
  function triggerMascot(action: MascotAction, speech?: string, duration = 2400) {
    if (!isHK.value) return
    if (mascotTimer) clearTimeout(mascotTimer)
    mascotAction.value = action
    mascotSpeech.value = speech ?? null
    mascotTimer = setTimeout(() => {
      mascotAction.value = 'idle'
      mascotSpeech.value = null
    }, duration)
  }

  watch(theme, (t) => {
    localStorage.setItem(THEME_KEY, t)
    applyTheme()
  })

  watch(isHK, () => {
    applyTheme()
  })

  return {
    theme,
    hkUnlocked,
    hkMode,
    isHK,
    mascotAction,
    mascotSpeech,
    init,
    toggle,
    unlock,
    toggleHK,
    triggerMascot,
  }
})
