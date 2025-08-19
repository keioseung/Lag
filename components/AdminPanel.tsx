'use client'

import { useState, useEffect } from 'react'

// 4개 언어 학습을 위한 타입 정의
interface MultiLanguageWord {
  id: string
  korean: string
  english: string
  japanese: string
  chinese: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  createdDate: string
  isFavorite: boolean
}

interface AdminPanelProps {
  onBackToLearning: () => void
  onAddWord: (newWord: Omit<MultiLanguageWord, 'id' | 'createdDate'>) => void
  words: MultiLanguageWord[]
}

export default function AdminPanel({ onBackToLearning, onAddWord, words }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'bulk'>('add')
  const [newWord, setNewWord] = useState({
    korean: '',
    english: '',
    japanese: '',
    chinese: '',
    category: '인사말',
    difficulty: 'easy' as const
  })
  const [bulkInput, setBulkInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [parsedWords, setParsedWords] = useState<any[]>([])

  const categories = [
    '인사말', '숫자', '색깔', '음식', '가족', '동물', '기본', '비즈니스', '여행', '취미'
  ]

  const difficulties = [
    { value: 'easy', label: '쉬움', color: 'text-green-600' },
    { value: 'medium', label: '보통', color: 'text-yellow-600' },
    { value: 'hard', label: '어려움', color: 'text-red-600' }
  ]

  const handleInputChange = (field: keyof typeof newWord, value: string) => {
    setNewWord((prev: typeof newWord) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // 유효성 검사
    if (!newWord.korean || !newWord.english || !newWord.japanese || !newWord.chinese) {
      alert('모든 언어의 단어를 입력해주세요.')
      return
    }

    setIsSaving(true)
    try {
      onAddWord(newWord)
      
      // 폼 초기화
      setNewWord({
        korean: '',
        english: '',
        japanese: '',
        chinese: '',
        category: '인사말',
        difficulty: 'easy'
      })
      
      alert('단어가 성공적으로 추가되었습니다!')
    } catch (error) {
      console.error('단어 추가 오류:', error)
      alert('단어 추가 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const parseBulkInput = (input: string) => {
    const lines = input.trim().split('\n').filter(line => line.trim())
    const parsed: any[] = []
    
    for (const line of lines) {
      if (line.includes('|')) {
        const parts = line.split('|').map(part => part.trim()).filter(part => part)
        
        if (parts.length >= 4) {
          parsed.push({
            korean: parts[0],
            english: parts[1],
            japanese: parts[2],
            chinese: parts[3],
            category: parts[4] || '기본',
            difficulty: parts[5] || 'easy'
          })
        }
      }
    }
    
    setParsedWords(parsed)
    setShowPreview(true)
  }

  const handleBulkAdd = () => {
    if (parsedWords.length === 0) {
      alert('파싱된 단어가 없습니다.')
      return
    }

    setIsSaving(true)
    try {
      parsedWords.forEach((word: any) => {
        onAddWord(word)
      })
      
      setBulkInput('')
      setParsedWords([])
      setShowPreview(false)
      alert(`${parsedWords.length}개의 단어가 성공적으로 추가되었습니다!`)
    } catch (error) {
      console.error('일괄 추가 오류:', error)
      alert('일괄 추가 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움'
      case 'medium': return '보통'
      case 'hard': return '어려움'
      default: return '알 수 없음'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">📚 4개 언어 학습 관리자</h1>
            <button
              onClick={onBackToLearning}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span>학습 모드로 돌아가기</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            ✏️ 개별 추가
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'bulk'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            📝 일괄 추가
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            📋 단어 목록 ({words.length})
          </button>
        </div>

        {/* 개별 추가 탭 */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">새로운 단어 추가</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 4개 언어 입력 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇰🇷 한국어
                    </label>
                    <input
                      type="text"
                      value={newWord.korean}
                      onChange={(e) => handleInputChange('korean', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="안녕하세요"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇺🇸 English
                    </label>
                    <input
                      type="text"
                      value={newWord.english}
                      onChange={(e) => handleInputChange('english', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Hello"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇯🇵 日本語
                    </label>
                    <input
                      type="text"
                      value={newWord.japanese}
                      onChange={(e) => handleInputChange('japanese', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="こんにちは"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇨🇳 中文
                    </label>
                    <input
                      type="text"
                      value={newWord.chinese}
                      onChange={(e) => handleInputChange('chinese', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="你好"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 카테고리와 난이도 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📂 카테고리
                  </label>
                  <select
                    value={newWord.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⭐ 난이도
                  </label>
                  <select
                    value={newWord.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>저장 중...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>단어 저장</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 일괄 추가 탭 */}
        {activeTab === 'bulk' && (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">일괄 단어 추가</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 일괄 입력 (파이프 | 로 구분)
                </label>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={`한국어|English|日本語|中文|카테고리|난이도

예시:
안녕하세요|Hello|こんにちは|你好|인사말|easy
감사합니다|Thank you|ありがとうございます|谢谢|인사말|easy`}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => parseBulkInput(bulkInput)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  🔍 파싱하기
                </button>
                
                {showPreview && parsedWords.length > 0 && (
                  <button
                    onClick={handleBulkAdd}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? '저장 중...' : `💾 ${parsedWords.length}개 단어 저장`}
                  </button>
                )}
              </div>

              {/* 미리보기 */}
              {showPreview && parsedWords.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-3">파싱된 단어 미리보기:</h3>
                  <div className="space-y-2">
                    {parsedWords.map((word, index) => (
                      <div key={index} className="flex items-center space-x-4 text-sm">
                        <span className="w-20 text-gray-600">🇰🇷 {word.korean}</span>
                        <span className="w-20 text-gray-600">🇺🇸 {word.english}</span>
                        <span className="w-20 text-gray-600">🇯🇵 {word.japanese}</span>
                        <span className="w-20 text-gray-600">🇨🇳 {word.chinese}</span>
                        <span className="w-16 text-gray-600">{word.category}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(word.difficulty)}`}>
                          {getDifficultyLabel(word.difficulty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 단어 목록 탭 */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">등록된 단어 목록</h2>
            
            {words.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg">등록된 단어가 없습니다.</p>
                <p className="text-gray-400">개별 추가 또는 일괄 추가 탭에서 단어를 등록해주세요.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        🇰🇷 한국어
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        🇺🇸 English
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        🇯🇵 日本語
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        🇨🇳 中文
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        📂 카테고리
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ⭐ 난이도
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        📅 등록일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {words.map((word) => (
                      <tr key={word.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {word.korean}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {word.english}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {word.japanese}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {word.chinese}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {word.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(word.difficulty)}`}>
                            {getDifficultyLabel(word.difficulty)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(word.createdDate).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 