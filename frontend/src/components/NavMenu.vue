<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user';

const props = defineProps<{
  compact?: boolean
}>()

const { isLoggedIn, logOut } = useAuth();
const { baseWebURL } = localized;

const goToLogin = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/361e7f73-dad7-45cc-96f6-5ef1e3fc3064',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NavMenu.vue:13',message:'goToLogin clicked',data:{target:'wp-login.php'},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  window.location.href = 'wp-login.php'
}

const userStore = useUserStore();
const hasNewMsg = computed(() => (userStore.user?.pending_messages_count ?? 0) > 0);

const items = computed(() => {

  const iconClass = 'cursor-pointer text-gray-400 hover:text-gray-500';

  let items = [
    {
      icon: 'hugeicons:account-setting-02',
      class: iconClass,
      onSelect: () => {
        window.location.href = `${baseWebURL}/?hp_route=user_edit_settings_page#/`;
      },
    },
    {
      icon: 'hugeicons:logout-02',
      class: iconClass,
      onSelect: () => {
        logOut();
      },
    }
  ]

  if (userStore.user?.is_vendor ?? false) {
    items = [{
      icon: hasNewMsg.value ? 'hugeicons:message-notification-02' : 'hugeicons:message-01',
      class: iconClass,
      onSelect: () => {
        window.location.href = `${baseWebURL}/?hp_route=messages_thread_page#/`;
      },
    },
    {
      icon: 'hugeicons:user-02',
      class: iconClass,
      onSelect: () => {
        window.location.href = `${baseWebURL}/?hp_route=vendor_dashboard_page#/`;
      },
    },
    ...items];
  }

  return items
});

const goToCreateListing = () => {
  if (!isLoggedIn.value) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/361e7f73-dad7-45cc-96f6-5ef1e3fc3064',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NavMenu.vue:62',message:'goToCreateListing blocked (not logged in)',data:{isLoggedIn:false},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    return
  }
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/361e7f73-dad7-45cc-96f6-5ef1e3fc3064',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NavMenu.vue:62',message:'goToCreateListing clicked',data:{target:`${baseWebURL}/?hp_route=listing_submit_profile_page#/`},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  window.location.href = `${baseWebURL}/?hp_route=listing_submit_profile_page#/`;
}

const rootClass = computed(() => (props.compact ? 'gap-1 text-sm' : 'gap-0'))
const buttonClass = computed(() => (props.compact ? 'uppercase justify-start text-sm text-gray-600 px-2' : 'uppercase justify-end'))
const displayItems = computed(() => {
  if (props.compact) return items.value
  return items.value.map(({ icon, ...rest }) => rest)
})
const navUi = computed(() => ({
  list: props.compact ? 'gap-1 px-0' : 'gap-2',
  item: 'px-0',
  link: props.compact ? 'justify-start px-0 py-2' : 'justify-end px-0 py-1',
  label: props.compact
    ? 'text-left !whitespace-normal !overflow-visible !text-clip !truncate'
    : 'text-right',
  icon: 'text-gray-400'
}))
</script>

<template>
  <div :class="['flex flex-col h-full justify-between items-stretch', rootClass]">
    <UButton
      v-if="!isLoggedIn"
      :class="buttonClass"
      color="primary"
      variant="ghost"
      label="Log in"
      :icon="props.compact ? 'lucide:log-in' : undefined"
      @click="goToLogin"
    />
    <UNavigationMenu v-else :items="displayItems" :ui="navUi" />
    <UButton
      :class="buttonClass"
      color="primary"
      variant="ghost"
      label="Become a Trainer"
      :icon="props.compact ? 'lucide:rocket' : undefined"
      @click="goToCreateListing"
    />
  </div>
</template>