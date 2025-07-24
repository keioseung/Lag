'use client'

import { useState } from 'react'

export default function TestPage() {
  const [status, setStatus] = useState<string>('테스트 중...')
  const [apiResponse, setApiResponse] = useState<any>(null)

  const testBackend = async () => {
    try {
      setStatus('백엔드 연결 테스트 중...')
      
      const response = await fetch('https://product2-production.up.railway.app/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setApiResponse(data)
        setStatus('✅ 백엔드 연결 성공!')
      } else {
        setStatus(`❌ 백엔드 오류: ${response.status}`)
      }
    } catch (error) {
      setStatus(`❌ 연결 실패: ${error}`)
    }
  }

  const testSupabase = async () => {
    try {
      setStatus('Supabase 연결 테스트 중...')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        setStatus('❌ Supabase 환경 변수가 설정되지 않음')
        return
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/words?select=count`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setStatus('✅ Supabase 연결 성공!')
      } else {
        setStatus(`❌ Supabase 오류: ${response.status}`)
      }
    } catch (error) {
      setStatus(`❌ Supabase 연결 실패: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🔧 연결 테스트</h1>
        
        <div className="grid gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">백엔드 API 테스트</h2>
            <button
              onClick={testBackend}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              백엔드 연결 테스트
            </button>
            {apiResponse && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Supabase 테스트</h2>
            <button
              onClick={testSupabase}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Supabase 연결 테스트
            </button>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">환경 변수 확인</h2>
            <div className="space-y-2">
              <div>
                <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || '설정되지 않음'}
              </div>
              <div>
                <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '설정되지 않음'}
              </div>
              <div>
                <strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음'}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">상태</h2>
            <div className="p-4 bg-gray-100 rounded-lg">
              {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 