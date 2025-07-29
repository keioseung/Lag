'use client'

interface HeaderProps {
  debugInfo?: string
}

export default function Header({ debugInfo }: HeaderProps) {
  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">🇨🇳 중국어 학습</h1>
          </div>
        </div>
      </div>
    </header>
  )
} 