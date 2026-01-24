import { computed, onMounted } from 'vue';
import { useAPI } from '@/composables/useAPI';
import { useUserStore } from '@/stores/user';
import type { User } from '@/types/user-types';

export function useAuth() {
    const { get } = useAPI();
    const userStore = useUserStore();

    const user = computed((): User | undefined | null => userStore.user);
    const isLoggedIn = computed((): boolean => !!user.value);

    const getCurrentUser = async () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/361e7f73-dad7-45cc-96f6-5ef1e3fc3064',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.ts:13',message:'getCurrentUser start',data:{hasExistingUser:!!userStore.user},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        const data = await get('/user');

        userStore.user = data;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/361e7f73-dad7-45cc-96f6-5ef1e3fc3064',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.ts:16',message:'getCurrentUser complete',data:{hasUser:!!data},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
    }

    const logOut = () => {
        userStore.user = undefined;
        window.location.href = '/#/';
    }

    onMounted(() => {
        getCurrentUser();
    });

    return { user, isLoggedIn, logOut };
}