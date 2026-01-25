<script setup>
import { ref, nextTick, watch, watchEffect, onUnmounted, computed } from 'vue'
import ModeSwitch from '@/components/ModeSwitch.vue'
import { useMapSearch } from '@/composables/useMapSearch.ts'
import { useRouter } from 'vue-router'
import { useSideMenu } from '@/composables/useSideMenu'
import { useMap } from '@indoorequal/vue-maplibre-gl'
import { useListings } from '@/composables/useListings'
import { useMapStore } from '@/stores/map'
import MobileResultsPanel from '@/components/map-ui/MobileResultsPanel.vue'
import { useListingStore } from '@/stores/listing'

const props = defineProps({
  mobile: { type: Boolean, default: false }
})

const { query, suggestions, retrieve, preventSuggestions, selectedSuggestion } = useMapSearch()
const { clearAll, goBack, categories, listings, selectedCategory, displayListings } = useSideMenu()
const mobileInputRef = ref(null)
const mapStore = useMapStore()
const listingStore = useListingStore()
const map = useMap('main')
const { getCategories, removeMarkersFromMap } = useListings()
const showSearchHere = ref(false)
const mapListenersAttached = ref(false)
const suggestionsOpen = computed(() => (suggestions.value?.length ?? 0) > 0)
const showBackButton = computed(() => {
  if (suggestionsOpen.value) return true
  return categories.value.length > 0 || listings.value.length > 0 || selectedCategory.value
})

watch(() => mapStore.location?.properties?.mapbox_id, () => {
  showSearchHere.value = false
})

const handleUserMove = (event) => {
  if (event && 'originalEvent' in event && !event.originalEvent) return
  showSearchHere.value = true
}

watchEffect(() => {
  if (!map?.map || mapListenersAttached.value) return
  mapListenersAttached.value = true
  map.map.on('dragstart', handleUserMove)
  map.map.on('zoomstart', handleUserMove)
  map.map.on('rotatestart', handleUserMove)
  map.map.on('pitchstart', handleUserMove)
})

onUnmounted(() => {
  if (!map?.map || !mapListenersAttached.value) return
  map.map.off('dragstart', handleUserMove)
  map.map.off('zoomstart', handleUserMove)
  map.map.off('rotatestart', handleUserMove)
  map.map.off('pitchstart', handleUserMove)
})

// Function to handle the selection of a suggestion
const selectSuggestion = async (suggestion) => {
  // First, prevent any suggestions from appearing
  preventSuggestions()

  // Then update the selected suggestion and query
  selectedSuggestion.value = suggestion
  query.value = suggestion.name

  // Automatically retrieve the selected suggestion, better UX IMO
  await retrieve(selectedSuggestion.value)
}

// Find and navigate to the selected place
const search = async () => {
  await retrieve(selectedSuggestion.value)
}

// Function to handle the 'enter' keyboard shortcut
const onEnter = async () => {
  if (suggestions.value && suggestions.value.length > 0) {
    await selectSuggestion(suggestions.value[0])
  }
}

const focusMobileInput = async () => {
  await nextTick()
  const inputEl = document.getElementById('location-search-field-mobile')
  if (inputEl && 'focus' in inputEl) {
    inputEl.focus()
    inputEl.click()
    return
  }
  const fallbackInput = mobileInputRef.value?.$el?.querySelector?.('input')
  if (fallbackInput) {
    fallbackInput.focus()
    fallbackInput.click()
  }
}

const handleBackClick = () => {
  if (suggestionsOpen.value) {
    preventSuggestions()
    return
  }
  if (displayListings.value || (selectedCategory.value && selectedCategory.value.parent !== 0)) {
    goBack()
    focusMobileInput()
    return
  }
  if (categories.value.length > 0 || listings.value.length > 0 || selectedCategory.value) {
    listingStore.listings = []
    listingStore.categories = []
    listingStore.display = false
    listingStore.selectedCategory = null
    listingStore.selectedListing = null
    mapStore.resetLocation()
    removeMarkersFromMap()
    focusMobileInput()
  }
}

const useMapCenterLocation = async () => {
  if (!map?.map) return
  const center = map.map.getCenter()
  query.value = 'Custom location'
  preventSuggestions()
  const newLocation = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [center.lng, center.lat]
    },
    properties: {
      mapbox_id: 'center',
      coordinates: {
        longitude: center.lng,
        latitude: center.lat
      }
    }
  }
  mapStore.location = newLocation
  await getCategories(newLocation)
}

//#region Navigate to Remote Listing Screen

const router = useRouter()

const goToRemote = () => {
  clearAll() // Clear store when switching to remote
  router.push('/remote')
}

//#endregion

</script>

<template>
  <!-- Desktop: Header Search -->
  <div v-if="!mobile" class="flex flex-col gap-2 justify-center h-full items-center">
    <div class="flex gap-2 justify-center items-center relative">
      <label for="location-search-field" class="uppercase font-extrabold">Location: </label>
      <div class="relative w-64">
        <UInput v-model="query" id="location-search-field" placeholder="Search across the nation"
                variant="soft" color="neutral" class="w-full" @keyup.enter="onEnter" />

        <!-- Suggestions Dropdown -->
        <div v-if="suggestions && suggestions.length > 0"
             class="absolute z-500 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <ul class="p-0 m-0 rounded">
            <li
              v-for="suggestion in suggestions"
              :key="suggestion.mapbox_id"
              class="cursor-pointer hover:bg-gray-100 rounded-none, py-2 px-3"
              @click="selectSuggestion(suggestion)"
            >
              <div class="font-medium">{{ suggestion.name }}</div>
              <div class="text-sm text-gray-500">
                {{ suggestion.full_address || suggestion.place_formatted }}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <UButton label="Search" @click="search" />
      <UButton label="Search for Online" variant="outline"
               color="primary" @click="goToRemote" />
    </div>
  </div>

  <!-- Mobile: Floating Button + Bottom Search Bar + Suggestions -->
  <div v-else class="absolute inset-0 flex flex-col justify-between items-stretch gap-0 pointer-events-none z-40">
    <div class="flex flex-col w-full h-fit gap-4 items-center pointer-events-none pt-4">
      <MobileResultsPanel
        :suggestions="suggestions"
        @selectSuggestion="selectSuggestion"
      />
    </div>
    <div class="flex flex-col w-full h-fit gap-4 items-center pointer-events-none">

      <!-- Floating Search Button (only after manual map move) -->
      <Transition name="fade">
        <div v-if="showSearchHere" class="z-40 pointer-events-auto">
          <UButton
            icon="lucide:scan-search"
            :ui="{ 
              rounded: 'rounded-full',
              base: 'justify-center normal-case'
            }"
            size="xl"
            color="primary"
            class="px-4"
            @click="() => { useMapCenterLocation(); focusMobileInput() }"
          >
            <span>Do search here</span>
          </UButton>
        </div>
      </Transition>

      <!-- Bottom Search Bar (always visible) -->
      <div class="w-full bg-white">
        <div class="w-full pointer-events-auto">
          <div class="flex items-center gap-2 px-2 py-3">
            <UButton
              v-if="showBackButton"
              icon="lucide:arrow-left"
              color="neutral"
              variant="ghost"
              size="lg"
              class="flex-shrink-0"
              @click="handleBackClick"
            />
            <UInput
              v-model="query"
              id="location-search-field-mobile"
            ref="mobileInputRef"
              placeholder="Search location"
              variant="soft"
              color="neutral"
              class="flex-1"
              size="xl"
              @keyup.enter="onEnter"
              type="search"
            />
            <UButton
              icon="lucide:search"
              @click="search"
              color="primary"
              variant="solid"
              size="xl"
              class="flex-shrink-0"
            />
          </div>
        </div>
        <div class="flex justify-center w-full bg-white pointer-events-auto">
          <UButton
            icon="lucide:rocket"
            label="Search online trainers instead"
            @click="goToRemote"
            color="primary"
            variant="ghost"
            size="lg"
            class="flex-shrink-0 normal-case w-full mb-4"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 500ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
