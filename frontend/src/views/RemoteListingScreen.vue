<script setup lang="js">
import { onMounted, watch, computed } from 'vue'
import { useSideMenu } from '@/composables/useSideMenu';
import { useLoading } from '@/composables/useLoading';
import { onBeforeEnter, onEnter } from '@/helpers/animation';
import { useListings } from '@/composables/useListings';
import RemoteSearch from '@/components/remote-ui/RemoteSearch.vue'
import Header from "@/components/Header.vue";
import RemoteScreenLoadingVisual from '@/components/remote-ui/RemoteScreenLoadingVisual.vue';
import MobileResultsPanel from '@/components/map-ui/MobileResultsPanel.vue'
import { useScreenBreakpoints } from '@/composables/useScreenBreakpoints'
import { useRouter } from 'vue-router'

const { displayListings, listings, categories, clearAll, selectedCategory, searchQuery, search, goBack } = useSideMenu()
const { loading, startLoading, loadWatcherCallback } = useLoading()
const { getCategories } = useListings()
const { isMobile } = useScreenBreakpoints()
const router = useRouter()

const showBackButton = computed(() => {
  return displayListings.value || (selectedCategory.value && selectedCategory.value.id !== 0)
})

const handleBackClick = () => {
  startLoading()
  goBack()
}

const goToMap = () => {
  clearAll()
  router.push('/')
}

onMounted(() => {
    getCategories(null, null, null, null, true) // Get the categories with no location data
})

// Loading Triggers
watch(categories, loadWatcherCallback)
watch(listings, loadWatcherCallback)

</script>

<template>
    <div class="flex flex-col size-full">
        <Header v-if="!isMobile">
            <template #center>
                <RemoteSearch />
            </template>
        </Header>
        <Header v-else />
        <div class="flex w-full h-full gap-0 justify-center items-start">
            <div v-if="isMobile" class="relative w-full h-full bg-gray-200">
                <div class="absolute inset-0 flex flex-col justify-between items-stretch gap-0 pointer-events-none">
                    <div class="flex flex-col w-full flex-1 min-h-0 gap-4 items-center pointer-events-none pt-4 pb-4">
                        <MobileResultsPanel :suggestions="[]" :forceVisible="true" />
                    </div>
                    <div class="flex flex-col w-full h-fit gap-4 items-center pointer-events-none">
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
                                        v-model="searchQuery"
                                        placeholder="Search categories"
                                        variant="soft"
                                        color="neutral"
                                        class="flex-1"
                                        size="xl"
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
                                    icon="lucide:map-pin"
                                    label="Search for trainers in person"
                                    @click="goToMap"
                                    color="primary"
                                    variant="ghost"
                                    size="lg"
                                    class="flex-shrink-0 normal-case w-full mb-4"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="w-full h-full flex justify-center items-start bg-gray-200 overflow-y-auto">
                <RemoteScreenLoadingVisual v-if="loading" :isListings="displayListings" />
                <TransitionGroup v-else tag="div" appear
                    :class="['md:w-[600px] lg:w-[800px] xl:w-[1000px] h-fit grid justify-center items-start md:p-4 lg:px-10 lg:py-6', { 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4': !displayListings, 'md:grid-cols-2 lg:grid-cols-3 gap-4': displayListings }]"
                    @before-enter="onBeforeEnter" @enter="onEnter">
                    <ListingCard v-for="(l, i) in listings" :key="l.id" class="w-full h-full" :listing="l"
                        :data-index="i" />
                    <CategoryCard v-for="(c, i) in categories" :key="c.id" :category="c" :data-index="i" :dark="true"
                        :remoteOnly="true" @selectCategory="startLoading" />
                    <NoListingsMessage class="col-span-full" v-if="displayListings && listings.length === 0"
                        :categoryName="selectedCategory?.name || ''" />
                </TransitionGroup>
            </div>
            <VendorDrawer />
        </div>
    </div>
</template>