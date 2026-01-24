import axios, {AxiosResponse} from 'axios'

const {baseAPIURL, nonce} = localized

export function useAPI() {
  const api = axios.create({
    baseURL: baseAPIURL,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
  })

  const get = async (endpoint: string, params?: Record<string, any>) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/361e7f73-dad7-45cc-96f6-5ef1e3fc3064',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAPI.ts:14',message:'API GET start',data:{endpoint,paramsKeys:Object.keys(params ?? {})},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    try {
      const response: AxiosResponse<any> = await api.get(endpoint, {params})
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/361e7f73-dad7-45cc-96f6-5ef1e3fc3064',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAPI.ts:17',message:'API GET success',data:{endpoint,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      return response.data
    } catch (error) {
      const isAxiosError = axios.isAxiosError(error)
      const status = isAxiosError ? error.response?.status : undefined
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/361e7f73-dad7-45cc-96f6-5ef1e3fc3064',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAPI.ts:20',message:'API GET error',data:{endpoint,status,isAxiosError},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      console.error('Error fetching data:', error)
      throw error
    }
  }

  return {get}
}
