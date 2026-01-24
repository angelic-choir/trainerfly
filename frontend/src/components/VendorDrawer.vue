<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { useScreenBreakpoints } from '@/composables/useScreenBreakpoints'
import FreeDrawer from '@/components/FreeDrawer.vue'

const listingStore = useListingStore()
const listing = computed(() => listingStore.selectedListing)
const { isMobile } = useScreenBreakpoints()

// Drawer reference and state
type FreeDrawerType = InstanceType<typeof FreeDrawer>
const drawerRef = ref<FreeDrawerType>()

// Watch for changes in the selected listing
watch(
  () => listing.value,
  (newListing) => {
    if (newListing && drawerRef.value) {
      drawerRef.value.isOpen = true
    } else if (drawerRef.value) {
      drawerRef.value.isOpen = false
    }
  },
)

// Links --------------------------------

const goToListing = () => {
  if (listing.value) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/361e7f73-dad7-45cc-96f6-5ef1e3fc3064',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VendorDrawer.vue:30',message:'goToListing clicked',data:{hasListing:true,listingId:listing.value.id,listingHasUrl:!!listing.value.url},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    // router.push(`/listing/${listing.value.id}`)
    window.location.href = listing.value.url;
  }
}

const clearListing = () => {
  listingStore.selectedListing = null
}

const containerClass = computed(() => {
  return isMobile.value ? 'flex h-full w-full items-end justify-center px-4 pb-4' : 'flex h-full w-full justify-start'
})

const panelClass = computed(() => {
  return isMobile.value
    ? 'relative w-full max-w-lg p-4 pt-5 h-fit flex flex-col gap-4 bg-white rounded-2xl shadow-lg'
    : 'ml-96 w-[1000px] p-4 pt-6 h-full flex flex-col gap-4 bg-white rounded-t-xl'
})

const infoClass = computed(() => {
  return isMobile.value ? 'flex flex-col gap-3' : 'flex flex-grow items-start gap-4'
})

const imageClass = computed(() => {
  return isMobile.value ? 'h-20 w-20 rounded-full object-cover' : 'flex-none h-30 aspect-square rounded-lg object-cover'
})

const buttonsClass = computed(() => {
  return isMobile.value ? 'flex w-full' : 'flex flex-none flex-col gap-2 w-64'
})

</script>

<template>
  <FreeDrawer
    ref="drawerRef"
    direction="bottom"
    :showToggleButton="false"
    :initiallyOpen="false"
    :transparent="true"
  >
    <!-- When Opened -->
    <div v-if="listing" :class="containerClass">
      <div :class="panelClass">
        <!-- Header: Vendor Image and Info -->
        <div :class="infoClass">
          <UButton
            v-if="isMobile"
            icon="lucide:x"
            variant="ghost"
            color="neutral"
            class="absolute right-3 top-3"
            @click="clearListing"
          />
          <img :src="listing.vendor.image || 'https://via.placeholder.com/150'" alt="Vendor" :class="imageClass" />
          <div id="info" class="flex flex-col flex-grow gap-1">
            <div class="flex gap-6 items-center">
              <h2 class="text-xl font-bold">{{ listing.vendor.name }}</h2>
              <div class="flex gap-2 items-center justify-start">
                <UBadge v-for="d of listing.vendor.descriptors" class="rounded-full px-3 py-2" :label="d ?? ''" variant="outline" />
              </div>
            </div>
            <h3 class="text-lg font-normal">{{ listing.title }}</h3>
            <p class="text-sm text-gray-600">
              {{ listing.description ?? 'No description available' }}
            </p>
          </div>
          <div id="buttons" :class="buttonsClass">
            <UButton color="primary" class="w-full" @click="goToListing">More Info / Contact</UButton>
          </div>
        </div>

        <!-- Recent Review -->
        <div class="flex flex-none h-fit">
          <div v-if="listing.reviews.length > 0" class="bg-blue-100 p-4 rounded-lg w-full h-fit min-h-20r">
            <h4 class="font-bold">Recent Review</h4>
            <p class="text-md">
              {{ listing.reviews[0].text }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="h-0 w-full"></div>
  </FreeDrawer>
</template>
