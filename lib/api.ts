const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lag-production-f11f.up.railway.app'

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log('API 요청 URL:', url)
      console.log('API 요청 옵션:', options)
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      console.log('API 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 응답 에러:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('API 응답 데이터:', data)
      return { data }
    } catch (error) {
      console.error('API 요청 오류:', error)
      return { error: error instanceof Error ? error.message : '알 수 없는 오류' }
    }
  }

  // 단어 관련 API
  async getWords() {
    return this.request<any[]>('/words')
  }

  async getWord(id: number) {
    return this.request<any>(`/words/${id}`)
  }

  async createWord(wordData: any) {
    return this.request<any>('/words', {
      method: 'POST',
      body: JSON.stringify(wordData),
    })
  }

  async updateWord(id: number, wordData: any) {
    return this.request<any>(`/words/${id}`, {
      method: 'PUT',
      body: JSON.stringify(wordData),
    })
  }

  async deleteWord(id: number) {
    return this.request<any>(`/words/${id}`, {
      method: 'DELETE',
    })
  }

  // 날짜별 단어 조회 API
  async getWordsByDate(studyDate: string) {
    return this.request<any[]>(`/words/date/${studyDate}`)
  }

  async getAvailableDates() {
    return this.request<{dates: string[]}>('/words/dates/available')
  }

  // 학습 통계 관련 API
  async getStudyStats() {
    return this.request<any>('/study-stats')
  }

  async updateStudyStats(statsData: any) {
    return this.request<any>('/study-stats', {
      method: 'PUT',
      body: JSON.stringify(statsData),
    })
  }

  // 학습 세션 관련 API
  async startStudySession() {
    return this.request<any>('/study-session/start', {
      method: 'POST',
    })
  }

  async submitAnswer(sessionId: string, wordId: number, isCorrect: boolean) {
    return this.request<any>('/study-session/answer', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        word_id: wordId,
        is_correct: isCorrect,
      }),
    })
  }

  async endStudySession(sessionId: string) {
    return this.request<any>(`/study-session/${sessionId}/end`, {
      method: 'POST',
    })
  }

  // 사용자 관련 API
  async getUserProfile() {
    return this.request<any>('/user/profile')
  }

  async updateUserProfile(profileData: any) {
    return this.request<any>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // 사용자 로그 관련 API
  async getUserLogs() {
    return this.request<any[]>('/user-logs')
  }

  async createUserLog(logData: any) {
    return this.request<any>('/user-logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL) 