<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useListsStore } from '../stores/lists'
import ListSection from '../components/list/ListSection.vue'
import ListCard from '../components/list/ListCard.vue'
import FloatingActionButton from '../components/common/FloatingActionButton.vue'
import AddListModal from '../components/common/AddListModal.vue'

const listsStore = useListsStore()
const showAddModal = ref(false)

onMounted(() => listsStore.fetchAll())

const lists = computed(() => listsStore.lists)
const totalDone = computed(() => lists.value.reduce((a, l) => a + l.checkedCount, 0))
const totalRemaining = computed(() => lists.value.reduce((a, l) => a + (l.itemCount - l.checkedCount), 0))
const sharedCount = computed(() => lists.value.filter(l => l.participantCount > 1).length)

async function handleCreate(name: string, emoji: string) {
  await listsStore.create({ name, emoji })
}
</script>

<template>
  <div class="pt-16 pb-24 px-5 max-w-lg mx-auto">
    <!-- Greeting -->
    <div class="mt-4 mb-6 animate-fade-up">
      <p class="text-ctp-overlay1 text-sm">Willkommen zurück</p>
      <h2 class="text-2xl font-bold text-ctp-text mt-0.5">
        Deine Listen
        <span class="text-ctp-overlay0 font-normal text-base ml-1">
          ({{ lists.length }})
        </span>
      </h2>
    </div>

    <!-- Quick stats -->
    <div class="grid grid-cols-3 gap-3 mb-8 animate-fade-up" style="animation-delay: 60ms">
      <div class="bg-ctp-surface0/60 border border-ctp-surface1/40 rounded-2xl p-3 text-center">
        <p class="text-xl font-bold text-ctp-green tabular-nums">{{ totalDone }}</p>
        <p class="text-[10px] text-ctp-overlay0 mt-0.5 uppercase tracking-wider">Erledigt</p>
      </div>
      <div class="bg-ctp-surface0/60 border border-ctp-surface1/40 rounded-2xl p-3 text-center">
        <p class="text-xl font-bold text-ctp-teal tabular-nums">{{ totalRemaining }}</p>
        <p class="text-[10px] text-ctp-overlay0 mt-0.5 uppercase tracking-wider">Offen</p>
      </div>
      <div class="bg-ctp-surface0/60 border border-ctp-surface1/40 rounded-2xl p-3 text-center">
        <p class="text-xl font-bold text-ctp-sapphire tabular-nums">{{ sharedCount }}</p>
        <p class="text-[10px] text-ctp-overlay0 mt-0.5 uppercase tracking-wider">Geteilt</p>
      </div>
    </div>

    <!-- Loading skeletons -->
    <div v-if="listsStore.loading" class="space-y-3 animate-fade-up">
      <div v-for="n in 3" :key="n" class="h-24 bg-ctp-surface0 rounded-2xl skeleton" />
    </div>

    <!-- Error -->
    <div v-else-if="listsStore.error" class="text-center py-12 text-ctp-red text-sm animate-fade-up">
      {{ listsStore.error }}
    </div>

    <!-- Lists -->
    <template v-else>
      <ListSection title="Meine Listen" :count="lists.length" class="mb-8">
        <ListCard
          v-for="(list, i) in lists"
          :key="list.id"
          :list="list"
          :index="i"
        />

        <div v-if="lists.length === 0" class="text-center py-12 animate-fade-up">
          <p class="text-4xl mb-3">🛒</p>
          <p class="text-ctp-overlay0 text-sm">Noch keine Listen. Erstelle deine erste!</p>
        </div>
      </ListSection>
    </template>

    <!-- FAB -->
    <FloatingActionButton @click="showAddModal = true" />

    <!-- Add modal -->
    <AddListModal
      :open="showAddModal"
      @close="showAddModal = false"
      @create="handleCreate"
    />
  </div>
</template>
