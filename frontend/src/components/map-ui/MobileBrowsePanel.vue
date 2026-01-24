<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSideMenu } from '@/composables/useSideMenu'
import { useLoading } from '@/composables/useLoading'
import { useMapStore } from '@/stores/map'
import SideMenuLoadingVisual from '@/components/loading-ui/SideMenuLoadingVisual.vue'
import { onBeforeEnter, onEnter } from '@/helpers/animation'

const { goBack, displayListings, categories, listings, selectedCategory, searchQuery } = useSideMenu()
const { loading, startLoading, loadWatcherCallback } = useLoading()
const mapStore = useMapStore()

watch(categories, loadWatcherCallback, { immediate: true })
watch(listings, loadWatcherCallback)

const hasLocation = computed(() => {
  const mapboxId = mapStore.location?.properties?.mapbox_id
  return Boolean(mapboxId && mapboxId !== '0')
})

const showPanel = computed(() => {
  return hasLocation.value && (categories.value.length > 0 || listings.value.length > 0 || selectedCategory.value)
})
</script>

<template>
  <div v-if="showPanel" class="absolute inset-x-0 bottom-28 z-30 px-4 pointer-events-none">
    <div
      class="pointer-events-auto max-h-[60vh] overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm"
    >
      <div class="flex items-center justify-between gap-3 px-4 pt-4">
        <UButton
          v-if="selectedCategory && selectedCategory.id !== 0"
          icon="fa6-solid:arrow-left"
          label="Back"
          variant="ghost"
          color="primary"
          @click="goBack"
        />
        <span v-else class="text-xs font-bold uppercase tracking-wide text-gray-700">
          What do I want to learn?
        </span>
        <span v-if="selectedCategory && selectedCategory.id !== 0" class="text-xs font-semibold uppercase text-gray-600">
          {{ selectedCategory.name }}
        </span>
      </div>

      <div v-if="!displayListings" class="px-4 pb-2 pt-3">
        <UInput
          v-model="searchQuery"
          placeholder="Search categories"
          variant="soft"
          color="neutral"
          size="md"
          class="w-full"
        />
      </div>

      <div class="border-t border-gray-100" />

      <div class="max-h-[45vh] overflow-y-auto px-4 pb-4 pt-3">
        <SideMenuLoadingVisual v-if="loading" :listing="displayListings" />
        <TransitionGroup
          v-else
          tag="div"
          appear
          @before-enter="onBeforeEnter"
          @enter="onEnter"
          :class="{ 'grid grid-cols-2 gap-4': !displayListings, 'flex flex-col gap-4': displayListings }"
        >
          <CategoryCard
            v-for="(c, i) in categories"
            :key="c.id"
            :data-index="i"
            :category="c"
            @selectCategory="startLoading"
          />
          <ListingCard
            v-for="(l, i) in listings"
            :key="l.id"
            :data-index="i"
            :listing="l"
            class="cursor-pointer transition-colors hover:bg-gray-100"
          />
          <NoListingsMessage
            v-if="displayListings && listings.length === 0"
            :categoryName="selectedCategory?.name || ''"
          />
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>
