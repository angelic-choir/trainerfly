<script setup lang="js">
import Map from '@/components/map-ui/Map.vue'
import MapSearch from '@/components/map-ui/MapSearch.vue'
import MobileBrowsePanel from '@/components/map-ui/MobileBrowsePanel.vue'
import Header from "@/components/Header.vue";
import { useScreenBreakpoints } from '@/composables/useScreenBreakpoints'
import { useRouter } from 'vue-router'

const { isMobile } = useScreenBreakpoints()
const router = useRouter()

</script>

<template>
  <div class="size-full flex">
    <div class="flex flex-col size-full">
      <!-- Desktop Header with Search -->
      <Header v-if="!isMobile">
        <template #center>
          <MapSearch />
        </template>
      </Header>
      
      <!-- Mobile Header (logo + hamburger only) -->
      <Header v-else />
      
      <!-- Map Component (contains mobile overlay) -->
      <Map>
        <template #mobile-overlay>
          <MapSearch v-if="isMobile" :mobile="true" />
          <MobileBrowsePanel v-if="isMobile" />
        </template>
      </Map>
    </div>
  </div>
</template>
