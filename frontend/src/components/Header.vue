<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Wordmark from '@/components/svg/Wordmark.vue'
import { useScreenBreakpoints } from '@/composables/useScreenBreakpoints'
import NavMenu from '@/components/NavMenu.vue'

const { isMobile } = useScreenBreakpoints()
const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => {
  if (isMobile.value) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header :class="[
    'flex justify-between gap-0 w-full p-4 shadow-md/30 z-40',
    'bg-gradient-to-b from-white/95 to-white/70 backdrop-blur-md border-b border-white/70',
    isMobile ? 'h-20' : 'h-32'
  ]">
    <div class="flex justify-start items-center h-full">
      <Wordmark alt="trainerfly" :class="`h-auto ${isMobile ? 'w-40' : 'w-60'} ml-4`" pathClass="fill-[#212020]" />
    </div>
    <slot name="center" />
    <div class="flex justify-end items-start h-full relative">
      <!-- Desktop: Full NavMenu -->
      <NavMenu v-if="!isMobile" />
      
      <!-- Mobile: Hamburger Menu -->
      <div v-else ref="menuRef" class="relative">
        <UButton
          icon="fa6-solid:bars"
          variant="ghost"
          color="neutral"
          class="rounded-full"
          @click.stop="menuOpen = !menuOpen"
          size="lg"
        />
        
        <!-- Dropdown Menu -->
        <div
          v-if="menuOpen"
          class="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white/95 backdrop-blur-md shadow-xl border border-gray-200 ring-1 ring-black/5 z-50 px-2 py-2"
          @click.stop
        >
          <NavMenu compact />
        </div>
      </div>
    </div>
  </header>
</template>
