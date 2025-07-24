'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<string>('테스트 중...')
  const [supabaseStatus, setSupabaseStatus] = useState<string>('테스트 중...')
  const [apiData, setApiData] = useState<any>(null)

  useEffect(() => {
    testConnections()
  }, [])

  const testConnections = async () => {
    // 백엔드 API 테스트
    try {
      const response = await fetch('https://product2-production.up.railway.app/')
      if (response.ok) {
        const data = await response.json()
        setApiData(data)
        setApiStatus('✅ 백엔드 연결 성공')
      } else {
        setApiStatus(`❌ 백엔드 오류: ${response.status}`)
      }
    } catch (error) {
      setApiStatus(`❌ 백엔드 연결 실패: ${error}`)
    }

    // Supabase 테스트
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || supabaseKey === 'your_supabase_anon_key_here') {
        setSupabaseStatus('❌ Supabase 환경 변수 미설정')
        return
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/words?select=count`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      })

      if (response.ok) {
        setSupabaseStatus('✅ Supabase 연결 성공')
      } else {
        setSupabaseStatus(`❌ Supabase 오류: ${response.status}`)
      }
    } catch (error) {
      setSupabaseStatus(`❌ Supabase 연결 실패: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🔧 디버그 페이지</h1>
        
        <div className="grid gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">백엔드 API 상태</h2>
            <div className="p-4 bg-gray-100 rounded-lg">
              {apiStatus}
            </div>
            {apiData && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <pre>{JSON.stringify(apiData, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Supabase 상태</h2>
            <div className="p-4 bg-gray-100 rounded-lg">
              {supabaseStatus}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">환경 변수</h2>
            <div className="space-y-2">
              <div>
                <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || '설정되지 않음'}
              </div>
              <div>
                <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '설정되지 않음'}
              </div>
              <div>
                <strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here' ? 
                    '기본값 (실제 키 필요)' : '설정됨') : '설정되지 않음'}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">API 엔드포인트 테스트</h2>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('https://product2-production.up.railway.app/words/')
                  if (response.ok) {
                    const data = await response.json()
                    alert(`단어 목록 조회 성공: ${data.length}개 단어`)
                  } else {
                    alert(`단어 목록 조회 실패: ${response.status}`)
                  }
                } catch (error) {
                  alert(`단어 목록 조회 오류: ${error}`)
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              단어 목록 조회 테스트
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 