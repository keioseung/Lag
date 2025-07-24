'use client'

import { useState } from 'react'
import type { Word } from '@/lib/supabase'
import { Plus, FileText, X, Check } from 'lucide-react'

interface ChineseWordInputProps {
  onAddWord: (wordData: Omit<Word, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: any }>
}

interface ParsedWord {
  original: string
  pronunciation: string
  meaning: string
  category: string
}

export default function ChineseWordInput({ onAddWord }: ChineseWordInputProps) {
  const [bulkInput, setBulkInput] = useState('')
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [category, setCategory] = useState('중국어')

  // 중국어 단어 입력 파싱 함수
  const parseChineseInput = (input: string): ParsedWord[] => {
    const lines = input.trim().split('\n').filter(line => line.trim())
    const words: ParsedWord[] = []

    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // 빈 줄 건너뛰기
      if (!trimmedLine) continue

      // 문장부호 처리 (특별한 경우)
      if (trimmedLine.includes('(문장부호)')) {
        const parts = trimmedLine.split('\t')
        if (parts.length >= 3) {
          words.push({
            original: parts[0].replace(/"/g, ''),
            pronunciation: parts[1].replace(/"/g, ''),
            meaning: parts[2].replace(/"/g, ''),
            category: '문장부호'
          })
        }
        continue
      }

      // 일반적인 탭으로 구분된 형식
      const parts = trimmedLine.split('\t')
      if (parts.length >= 3) {
        const original = parts[0].replace(/"/g, '').trim()
        const pronunciation = parts[1].replace(/"/g, '').trim()
        const meaning = parts[2].replace(/"/g, '').trim()
        
        // 인명 처리
        let wordCategory = category
        if (meaning.includes('인명') || meaning.includes('사람 이름')) {
          wordCategory = '인명'
        } else if (meaning.includes('문장부호')) {
          wordCategory = '문장부호'
        }

        if (original && pronunciation && meaning) {
          words.push({
            original,
            pronunciation,
            meaning,
            category: wordCategory
          })
        }
      }
    }

    return words
  }

  const handleParse = () => {
    const words = parseChineseInput(bulkInput)
    setParsedWords(words)
    setIsPreviewMode(true)
  }

  const handleSaveAll = async () => {
    for (const word of parsedWords) {
      await onAddWord({
        ...word,
        priority: 0,
        mastery_level: 0,
        times_studied: 0,
        correct_attempts: 0,
        total_attempts: 0,
        added_date: new Date().toLocaleDateString()
      })
    }
    
    setBulkInput('')
    setParsedWords([])
    setIsPreviewMode(false)
    alert(`${parsedWords.length}개의 단어가 성공적으로 추가되었습니다!`)
  }

  const handleRemoveWord = (index: number) => {
    setParsedWords(prev => prev.filter((_, i) => i !== index))
  }

  const handleClear = () => {
    setBulkInput('')
    setParsedWords([])
    setIsPreviewMode(false)
  }

  return (
    <div className="card mb-8">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">
        <span className="text-xl mr-2">🇨🇳</span>
        중국어 단어 일괄 입력
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          입력 형식 예시:
        </label>
        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 font-mono">
          "演讲"	"옌장"	"연설"<br/>
          。	(문장부호)	. (마침표)<br/>
          会议	후이이	회의<br/>
          开始	카이시	시작하다<br/>
          了	르	완료를 나타내는 조사<br/>
          ，	(문장부호)	, (쉼표)<br/>
          轮到	룬다오	차례가 되다<br/>
          李明	리밍	인명(사람 이름)
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카테고리:
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="중국어">중국어</option>
          <option value="문장부호">문장부호</option>
          <option value="인명">인명</option>
          <option value="동사">동사</option>
          <option value="명사">명사</option>
          <option value="형용사">형용사</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          단어 입력 (탭으로 구분):
        </label>
        <textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder={`"演讲"	"옌장"	"연설"
。	(문장부호)	. (마침표)
会议	후이이	회의`}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleParse}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FileText size={16} />
          미리보기
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <X size={16} />
          지우기
        </button>
      </div>

      {isPreviewMode && parsedWords.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              미리보기 ({parsedWords.length}개 단어)
            </h4>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check size={16} />
              모두 저장
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {parsedWords.map((word, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">{word.original}</span>
                    <span className="text-gray-600">[{word.pronunciation}]</span>
                    <span className="text-gray-800">{word.meaning}</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">{word.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveWord(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPreviewMode && parsedWords.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          파싱된 단어가 없습니다. 입력 형식을 확인해주세요.
        </div>
      )}
    </div>
  )
} 