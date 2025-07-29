'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [envVars, setEnvVars] = useState<any>({})
  const [apiTest, setApiTest] = useState<string>('')

  useEffect(() => {
    // 환경변수 확인
    setEnvVars({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음'
    })
  }, [])

  const testApi = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lag-production-f11f.up.railway.app'
      setApiTest('테스트 중...')
      
      const response = await fetch(`${apiUrl}/words/`)
      if (response.ok) {
        const data = await response.json()
        setApiTest(`✅ 성공: ${data.length}개 단어`)
      } else {
        setApiTest(`❌ 실패: ${response.status}`)
      }
    } catch (error) {
      setApiTest(`❌ 오류: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🧪 환경변수 테스트</h1>
        
        <div className="grid gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">환경변수 확인</h2>
            <div className="space-y-2">
              <div>
                <strong>NEXT_PUBLIC_API_URL:</strong> {envVars.NEXT_PUBLIC_API_URL || '설정되지 않음'}
              </div>
              <div>
                <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envVars.NEXT_PUBLIC_SUPABASE_URL || '설정되지 않음'}
              </div>
              <div>
                <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || '설정되지 않음'}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">API 테스트</h2>
            <button
              onClick={testApi}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              API 연결 테스트
            </button>
            {apiTest && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                {apiTest}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">직접 URL 테스트</h2>
            <button
              onClick={async () => {
                try {
                  setApiTest('직접 테스트 중...')
                  const response = await fetch('https://lag-production-f11f.up.railway.app/words/')
                  if (response.ok) {
                    const data = await response.json()
                    setApiTest(`✅ 직접 테스트 성공: ${data.length}개 단어`)
                  } else {
                    setApiTest(`❌ 직접 테스트 실패: ${response.status}`)
                  }
                } catch (error) {
                  setApiTest(`❌ 직접 테스트 오류: ${error}`)
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              직접 URL 테스트
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 