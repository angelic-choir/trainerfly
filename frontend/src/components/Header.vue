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
  <header :class="['flex justify-between gap-0 w-full p-4 bg-white shadow-md/30 z-40', isMobile ? 'h-20' : 'h-32']">
    <div class="flex justify-start items-center h-full">
      <Wordmark alt="trainerfly" :class="['h-auto', isMobile ? 'w-40' : 'w-60', 'ml-4']" pathClass="fill-[#212020]" />
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
          color="gray"
          @click.stop="menuOpen = !menuOpen"
          size="lg"
        />
        
        <!-- Dropdown Menu -->
        <div
          v-if="menuOpen"
          class="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50"
          @click.stop
        >
          <NavMenu />
        </div>
      </div>
    </div>
  </header>
</template>
