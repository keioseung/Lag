import { apiClient } from './api'

export interface ApiStatus {
  isOnline: boolean
  responseTime: number
  lastChecked: Date
  error?: string
}

let apiStatusCache: ApiStatus | null = null
let lastCheckTime = 0
const CACHE_DURATION = 30000 // 30초

export async function checkApiStatus(): Promise<ApiStatus> {
  const now = Date.now()
  
  // 캐시된 상태가 있고 30초 이내라면 캐시된 값 반환
  if (apiStatusCache && (now - lastCheckTime) < CACHE_DURATION) {
    return apiStatusCache
  }

  const startTime = Date.now()
  
  try {
    // 간단한 헬스체크 엔드포인트 호출
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://product2-production.up.railway.app'
    const response = await fetch(`${apiUrl}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      const status: ApiStatus = {
        isOnline: true,
        responseTime,
        lastChecked: new Date(),
      }
      
      apiStatusCache = status
      lastCheckTime = now
      return status
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    const status: ApiStatus = {
      isOnline: false,
      responseTime: Date.now() - startTime,
      lastChecked: new Date(),
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    }
    
    apiStatusCache = status
    lastCheckTime = now
    return status
  }
}

export function getApiStatus(): ApiStatus | null {
  return apiStatusCache
}

export function clearApiStatusCache(): void {
  apiStatusCache = null
  lastCheckTime = 0
} 