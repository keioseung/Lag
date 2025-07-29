'use client'

import { useState } from 'react'

interface HeaderProps {
  debugInfo?: string
}

export default function Header({ debugInfo }: HeaderProps) {
  const [showDebug, setShowDebug] = useState(false)

  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">🇨🇳 중국어 학습</h1>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded"
            >
              DEBUG
            </button>
          </div>
          
          {showDebug && debugInfo && (
            <div className="text-xs text-yellow-300 bg-black/50 p-2 rounded">
              {debugInfo}
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 