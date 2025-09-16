'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Info, Settings, Tool, ChevronDown, ChevronUp, Pin } from 'lucide-react'
import { useState } from 'react'

interface Notice {
  id: string
  title: string
  content: string
  notice_type: 'GENERAL' | 'IMPORTANT' | 'SYSTEM' | 'MAINTENANCE'
  is_pinned: boolean
  is_active: boolean
  created_at: string
  author_name: string
  start_date?: string
  end_date?: string
}

interface NoticeCardProps {
  notices: Notice[]
}

export default function NoticeCard({ notices }: NoticeCardProps) {
  const [expandedNotices, setExpandedNotices] = useState<Set<string>>(new Set())

  const toggleExpanded = (noticeId: string) => {
    const newExpanded = new Set(expandedNotices)
    if (newExpanded.has(noticeId)) {
      newExpanded.delete(noticeId)
    } else {
      newExpanded.add(noticeId)
    }
    setExpandedNotices(newExpanded)
  }

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'IMPORTANT':
        return <AlertTriangle className="h-4 w-4" />
      case 'SYSTEM':
        return <Settings className="h-4 w-4" />
      case 'MAINTENANCE':
        return <Tool className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getNoticeTypeInfo = (type: string) => {
    switch (type) {
      case 'IMPORTANT':
        return { label: '중요', variant: 'destructive' as const }
      case 'SYSTEM':
        return { label: '시스템', variant: 'secondary' as const }
      case 'MAINTENANCE':
        return { label: '점검', variant: 'outline' as const }
      default:
        return { label: '일반', variant: 'default' as const }
    }
  }

  const activeNotices = notices.filter(notice => {
    if (!notice.is_active) return false
    
    const now = new Date()
    const startDate = notice.start_date ? new Date(notice.start_date) : null
    const endDate = notice.end_date ? new Date(notice.end_date) : null
    
    if (startDate && now < startDate) return false
    if (endDate && now > endDate) return false
    
    return true
  })

  // 고정 공지를 상단에 표시
  const sortedNotices = [...activeNotices].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  if (sortedNotices.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          공지사항
        </CardTitle>
        <CardDescription>
          중요한 안내사항을 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedNotices.map((notice) => {
            const isExpanded = expandedNotices.has(notice.id)
            const typeInfo = getNoticeTypeInfo(notice.notice_type)
            
            return (
              <div
                key={notice.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {notice.is_pinned && (
                        <Pin className="h-4 w-4 text-blue-600" />
                      )}
                      {getNoticeIcon(notice.notice_type)}
                      <Badge variant={typeInfo.variant}>
                        {typeInfo.label}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="text-sm text-gray-500">
                        by {notice.author_name}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {notice.title}
                    </h4>
                    
                    {isExpanded ? (
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {notice.content}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {notice.content.length > 100
                          ? `${notice.content.substring(0, 100)}...`
                          : notice.content
                        }
                      </div>
                    )}
                  </div>
                  
                  {notice.content.length > 100 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(notice.id)}
                      className="ml-2"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}