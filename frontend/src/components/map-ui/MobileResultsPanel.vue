<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSideMenu } from '@/composables/useSideMenu'
import { useLoading } from '@/composables/useLoading'
import { useMapStore } from '@/stores/map'
import SideMenuLoadingVisual from '@/components/loading-ui/SideMenuLoadingVisual.vue'
import { onBeforeEnter, onEnter } from '@/helpers/animation'

const props = defineProps<{
  suggestions: Array<any>
  forceVisible?: boolean
}>()

const emit = defineEmits<{
  (e: 'selectSuggestion', suggestion: any): void
}>()

const { displayListings, categories, listings, selectedCategory, searchQuery } = useSideMenu()
const { loading, startLoading, loadWatcherCallback } = useLoading()
const mapStore = useMapStore()

watch(categories, loadWatcherCallback, { immediate: true })
watch(listings, loadWatcherCallback)

const hasLocation = computed(() => {
  const mapboxId = mapStore.location?.properties?.mapbox_id
  return Boolean(mapboxId && mapboxId !== '0')
})

const showSuggestions = computed(() => (props.suggestions?.length ?? 0) > 0)
const showPanel = computed(() => {
  if (showSuggestions.value) return true
  if (props.forceVisible) return true
  if (!hasLocation.value) return false
  return loading.value || categories.value.length > 0 || listings.value.length > 0 || selectedCategory.value
})
</script>

<template>
  <div v-if="showPanel" class="w-full h-full px-4 pointer-events-auto">
    <div class="w-full h-full max-h-full overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm flex flex-col min-h-0">
      <div class="flex items-center justify-between px-4 pt-4 flex-none">
        <span v-if="showSuggestions" class="text-xs font-semibold uppercase tracking-wide text-gray-600">
          Search Suggestions
        </span>
        <span v-else-if="selectedCategory && selectedCategory.id !== 0" class="text-xs font-semibold uppercase text-gray-600">
          {{ selectedCategory.name }}
        </span>
        <span v-else class="text-xs font-bold uppercase tracking-wide text-gray-700">
          What do I want to learn?
        </span>
      </div>

      <div v-if="showSuggestions" class="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-3">
        <ul class="p-0 m-0 rounded">
          <li
            v-for="suggestion in props.suggestions"
            :key="suggestion.mapbox_id"
            class="cursor-pointer hover:bg-gray-100 rounded-lg py-2 px-3"
            @click="emit('selectSuggestion', suggestion)"
          >
            <div class="font-medium">{{ suggestion.name }}</div>
            <div class="text-sm text-gray-500">
              {{ suggestion.full_address || suggestion.place_formatted }}
            </div>
          </li>
        </ul>
      </div>

      <template v-else>
        <div class="border-t border-gray-100" />

        <div class="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-3">
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
      </template>
    </div>
  </div>
</template>
