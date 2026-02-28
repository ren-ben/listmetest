<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-[60] flex flex-col bg-black">
        <!-- Header -->
        <div class="flex items-center gap-3 px-4 pt-safe pt-4 pb-3 bg-black/80">
          <button @click="close" class="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors" aria-label="Schließen">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            <h2 class="font-semibold text-white text-sm">Barcode scannen</h2>
            <p class="text-white/50 text-xs">{{ statusText }}</p>
          </div>
        </div>

        <!-- Camera -->
        <div class="relative flex-1 overflow-hidden">
          <video ref="videoEl" class="w-full h-full object-cover" autoplay playsinline muted />

          <!-- Scan frame overlay -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="relative w-64 h-40">
              <!-- Corner brackets -->
              <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-ctp-teal rounded-tl-md" />
              <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-ctp-teal rounded-tr-md" />
              <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-ctp-teal rounded-bl-md" />
              <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-ctp-teal rounded-br-md" />
              <!-- Scan line -->
              <div v-if="scanning" class="scan-line absolute left-2 right-2 h-0.5 bg-ctp-teal opacity-80" />
            </div>
          </div>

          <!-- Found overlay -->
          <Transition name="found">
            <div v-if="foundProduct" class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-6 px-6 text-center">
              <p class="text-white font-semibold text-lg mb-1">{{ foundProduct }}</p>
              <p class="text-white/60 text-sm mb-4">Gefunden · Barcode: {{ lastBarcode }}</p>
              <div class="flex gap-3">
                <button @click="rejectProduct" class="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-medium">Abbrechen</button>
                <button @click="acceptProduct" class="flex-1 py-3 rounded-xl bg-ctp-teal text-ctp-base text-sm font-semibold">Übernehmen</button>
              </div>
            </div>
          </Transition>

          <!-- Unsupported -->
          <div v-if="unsupported" class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 px-8 text-center">
            <span class="text-4xl">📵</span>
            <p class="text-white font-semibold">Barcode-Scanner nicht verfügbar</p>
            <p class="text-white/60 text-sm">Dein Browser unterstützt die BarcodeDetector API nicht. Nutze Chrome oder Edge.</p>
            <button @click="close" class="mt-2 px-6 py-3 rounded-xl bg-white/10 text-white text-sm font-medium">Schließen</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'scanned': [name: string]
}>()

const videoEl = ref<HTMLVideoElement | null>(null)
const scanning = ref(false)
const unsupported = ref(false)
const foundProduct = ref<string | null>(null)
const lastBarcode = ref('')
const statusText = ref('Halte einen Barcode in den Rahmen')

let stream: MediaStream | null = null
let detector: any = null
let animFrame: number | null = null

watch(() => props.modelValue, async (open) => {
  if (open) {
    await startScanner()
  } else {
    stopScanner()
  }
})

onUnmounted(stopScanner)

async function startScanner() {
  foundProduct.value = null
  unsupported.value = false
  statusText.value = 'Halte einen Barcode in den Rahmen'

  if (!('BarcodeDetector' in window)) {
    unsupported.value = true
    return
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    })
    if (videoEl.value) {
      videoEl.value.srcObject = stream
      await videoEl.value.play()
    }

    // @ts-ignore — BarcodeDetector not yet in TS lib
    detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'] })
    scanning.value = true
    detectLoop()
  } catch {
    statusText.value = 'Kamera-Zugriff verweigert'
  }
}

async function detectLoop() {
  if (!videoEl.value || !detector || !scanning.value) return
  try {
    const barcodes = await detector.detect(videoEl.value)
    if (barcodes.length > 0 && !foundProduct.value) {
      const code = barcodes[0].rawValue
      lastBarcode.value = code
      scanning.value = false
      statusText.value = 'Barcode erkannt — suche Produkt…'
      await lookupBarcode(code)
    }
  } catch { /* ignore */ }

  if (scanning.value) {
    animFrame = requestAnimationFrame(detectLoop)
  }
}

async function lookupBarcode(code: string) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
    const data = await res.json()
    if (data.status === 1 && data.product?.product_name) {
      foundProduct.value = data.product.product_name
      statusText.value = 'Produkt gefunden'
    } else {
      foundProduct.value = code
      statusText.value = 'Produkt unbekannt — Barcode übernehmen'
    }
  } catch {
    foundProduct.value = code
    statusText.value = 'Offline — Barcode als Name'
  }
}

function acceptProduct() {
  if (foundProduct.value) {
    emit('scanned', foundProduct.value)
    close()
  }
}

function rejectProduct() {
  foundProduct.value = null
  scanning.value = true
  statusText.value = 'Halte einen Barcode in den Rahmen'
  detectLoop()
}

function stopScanner() {
  scanning.value = false
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
  if (videoEl.value) videoEl.value.srcObject = null
  foundProduct.value = null
}

function close() {
  stopScanner()
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.found-enter-active { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease; }
.found-leave-active { transition: opacity 0.2s ease; }
.found-enter-from { transform: translateY(20px); opacity: 0; }
.found-leave-to { opacity: 0; }
.scan-line { animation: scan 2s ease-in-out infinite; top: 0; }
@keyframes scan {
  0%, 100% { top: 4px; }
  50% { top: calc(100% - 4px); }
}
</style>
