'use client'

import { useState, useEffect } from 'react'
import { checkApiStatus, type ApiStatus } from '@/lib/api-status'
import { Wifi, WifiOff } from 'lucide-react'

export default function Header() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkApiStatus()
      setApiStatus(status)
    }

    checkStatus()
    
    // 30초마다 상태 확인
    const interval = setInterval(checkStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center text-white mb-8">
      <div className="flex items-center justify-center gap-4 mb-4">
        <h1 className="text-5xl font-bold text-shadow-lg">
        LingoMaster
      </h1>
        {apiStatus && (
          <div className="flex items-center gap-2 text-sm">
            {apiStatus.isOnline ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <span className={apiStatus.isOnline ? 'text-green-400' : 'text-red-400'}>
              {apiStatus.isOnline ? '온라인' : '오프라인'}
            </span>
          </div>
        )}
      </div>
      <p className="text-xl opacity-90">
        스마트한 언어 학습의 시작
      </p>
    </div>
  )
} 