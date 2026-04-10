'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, Info, Settings, Wrench, Pin } from 'lucide-react'
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
}

interface NoticeCardProps {
  notices: Notice[]
  embedded?: boolean
}

export default function NoticeCard({ notices, embedded = false }: NoticeCardProps) {
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'IMPORTANT':
        return <AlertTriangle className="h-4 w-4" />
      case 'SYSTEM':
        return <Settings className="h-4 w-4" />
      case 'MAINTENANCE':
        return <Wrench className="h-4 w-4" />
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

  const activeNotices = notices.filter((notice) => notice.is_active)

  // 고정 공지를 상단에 표시
  const sortedNotices = [...activeNotices].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const totalPages = Math.max(1, Math.ceil(sortedNotices.length / itemsPerPage))
  const paginatedNotices = sortedNotices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const selectedNotice = sortedNotices.find((notice) => notice.id === selectedNoticeId) ?? null

  if (sortedNotices.length === 0) {
    if (embedded) {
      return (
        <div className="py-8 text-center text-sm text-gray-500">
          등록된 공지사항이 없습니다.
        </div>
      )
    }
    return null
  }

  const content = (
    <div className="space-y-4">
      {paginatedNotices.map((notice) => {
        const typeInfo = getNoticeTypeInfo(notice.notice_type)
        
        return (
          <button
            key={notice.id}
            type="button"
            onClick={() => setSelectedNoticeId(notice.id)}
            className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  {notice.is_pinned && (
                    <Pin className="h-4 w-4 text-blue-600" />
                  )}
                  {getNoticeIcon(notice.notice_type)}
                  <Badge variant={typeInfo.variant} className="inline-flex w-12 justify-center">
                    {typeInfo.label}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <span className="text-sm text-gray-500">
                    by {notice.author_name}
                  </span>
                </div>
                <h4 className="mb-2 font-medium text-gray-900">
                  {notice.title}
                </h4>
                <div className="line-clamp-2 text-sm text-gray-600">
                  {notice.content.length > 100
                    ? `${notice.content.substring(0, 100)}...`
                    : notice.content
                  }
                </div>
              </div>
            </div>
          </button>
        )
      })}

      {sortedNotices.length > itemsPerPage && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )

  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="divide-y divide-slate-200">
          {paginatedNotices.map((notice) => {
            const typeInfo = getNoticeTypeInfo(notice.notice_type)

            return (
              <button
                key={notice.id}
                type="button"
                onClick={() => setSelectedNoticeId(notice.id)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-0 py-3 text-left text-slate-600"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={typeInfo.variant} className="inline-flex w-14 justify-center">
                      {typeInfo.label}
                    </Badge>
                    {notice.is_pinned && <Pin className="h-3.5 w-3.5 text-blue-600" />}
                    <span className="truncate text-left text-sm font-medium">{notice.title}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  <span>{new Date(notice.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </button>
            )
          })}
        </div>

        {sortedNotices.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              다음
            </Button>
          </div>
        )}

        <NoticeDialog notice={selectedNotice} onOpenChange={(open) => !open && setSelectedNoticeId(null)} />
      </div>
    )
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
        {content}
        <NoticeDialog notice={selectedNotice} onOpenChange={(open) => !open && setSelectedNoticeId(null)} />
      </CardContent>
    </Card>
  )
}

function NoticeDialog({
  notice,
  onOpenChange,
}: {
  notice: Notice | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={!!notice} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {notice && (
          <>
            <DialogHeader>
              <div className="mb-2 flex items-center gap-2">
                {notice.is_pinned && <Pin className="h-4 w-4 text-blue-600" />}
                <span className="text-xs text-gray-500">
                  {new Date(notice.created_at).toLocaleString('ko-KR')}
                </span>
                <span className="text-xs text-gray-500">by {notice.author_name}</span>
              </div>
              <DialogTitle>{notice.title}</DialogTitle>
            </DialogHeader>
            <div className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {notice.content}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
