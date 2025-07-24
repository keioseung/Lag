'use client'

import { useState } from 'react'
import type { Word } from '@/lib/supabase'
import { Search, Trash2, Download, Upload } from 'lucide-react'
import ChineseWordInput from './ChineseWordInput'

interface AdminPanelProps {
  words: Word[]
  onAddWord: (wordData: Omit<Word, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: any }>
  onDeleteWord: (id: number) => Promise<{ success: boolean; error?: any }>
  onUpdateWord: (id: number, updates: Partial<Word>) => Promise<{ success: boolean; error?: any }>
}

export default function AdminPanel({ words, onAddWord, onDeleteWord, onUpdateWord }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')



  const handleDelete = async (id: number) => {
    if (confirm('이 단어를 삭제하시겠습니까?')) {
      await onDeleteWord(id)
    }
  }

  const categories = ['all', ...Array.from(new Set(words.map(word => word.category)))]

  const filteredWords = words.filter(word => {
    const matchesSearch = word.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.pronunciation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const exportCSV = () => {
    const csvContent = [
      ['원언어', '발음', '의미', '카테고리', '우선순위', '숙련도'],
      ...words.map(word => [
        word.original,
        word.pronunciation,
        word.meaning,
        word.category,
        word.priority,
        word.mastery_level
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `언어학습_단어장_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="card">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        <span className="text-2xl mr-2">📚</span>
        중국어 단어 관리
      </h2>
      
      {/* Chinese Word Input Section */}
      <ChineseWordInput onAddWord={onAddWord} />
      
      {/* Import/Export Section */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
        >
          <Download size={16} />
          CSV 내보내기
        </button>
        <label className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors cursor-pointer">
          <Upload size={16} />
          CSV 가져오기
          <input type="file" accept=".csv" className="hidden" />
        </label>
      </div>



      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="단어 검색..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              {category === 'all' ? '전체' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Word List */}
      <div className="space-y-4">
        {filteredWords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <h3 className="text-xl font-semibold mb-2">표시할 단어가 없습니다</h3>
            <p>검색어를 확인하거나 새 단어를 추가해보세요.</p>
          </div>
        ) : (
          filteredWords.map(word => (
            <div key={word.id} className="bg-gray-50 rounded-xl p-6 flex justify-between items-center">
              <div className="flex-1">
                <div className="text-xl font-bold text-gray-800 mb-1">{word.original}</div>
                <div className="text-primary-600 italic mb-1">{word.pronunciation}</div>
                <div className="text-gray-600 mb-2">{word.meaning}</div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {word.category}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < word.mastery_level ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(word.id)}
                className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 