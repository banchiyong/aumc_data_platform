'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

const emptyForm = {
  title: '',
  content: '',
  notice_type: 'GENERAL',
  is_pinned: false,
  is_active: true,
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isComposerOpen, setIsComposerOpen] = useState(false)

  const loadNotices = async () => {
    const response = await fetch('/api/admin/notices')
    if (response.ok) {
      setNotices(await response.json())
    }
  }

  useEffect(() => {
    loadNotices()
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch(editingId ? `/api/admin/notices/${editingId}` : '/api/admin/notices', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.text()
        alert(`공지사항 저장 중 오류가 발생했습니다: ${error}`)
        return
      }

      setFormData(emptyForm)
      setEditingId(null)
      setIsComposerOpen(false)
      await loadNotices()
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id)
    setIsComposerOpen(true)
    setFormData({
      title: notice.title,
      content: notice.content,
      notice_type: notice.notice_type,
      is_pinned: notice.is_pinned,
      is_active: notice.is_active,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (noticeId: string) => {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return

    const response = await fetch(`/api/admin/notices/${noticeId}`, { method: 'DELETE' })
    if (!response.ok) {
      const error = await response.text()
      alert(`공지사항 삭제 중 오류가 발생했습니다: ${error}`)
      return
    }

    await loadNotices()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">공지사항 관리</h1>
        <Button
          onClick={() => {
            setEditingId(null)
            setFormData(emptyForm)
            setIsComposerOpen(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          공지사항 작성
        </Button>
      </div>

      {isComposerOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? '공지사항 수정' : '공지사항 작성'}</CardTitle>
            <CardDescription>공지사항 작성과 수정은 관리자만 가능합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>제목</Label>
                <Input value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <Label>공지 유형</Label>
                <Select value={formData.notice_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, notice_type: value as Notice['notice_type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">일반</SelectItem>
                    <SelectItem value="IMPORTANT">중요</SelectItem>
                    <SelectItem value="SYSTEM">시스템</SelectItem>
                    <SelectItem value="MAINTENANCE">점검</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>내용</Label>
              <Textarea rows={6} value={formData.content} onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))} />
            </div>

            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_pinned} onChange={(e) => setFormData((prev) => ({ ...prev, is_pinned: e.target.checked }))} />
                상단 고정
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))} />
                활성화
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={loading}>
                {editingId ? '공지사항 수정' : '공지사항 등록'}
              </Button>
              <Button variant="outline" onClick={() => { setEditingId(null); setFormData(emptyForm) }}>
                초기화
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setFormData(emptyForm)
                  setIsComposerOpen(false)
                }}
              >
                닫기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>공지사항 목록</CardTitle>
          <CardDescription>게시판 형태로 등록된 공지사항을 확인하고 수정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-200">
            {notices.map((notice) => (
              <div key={notice.id} className="flex items-start justify-between gap-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{notice.title}</p>
                    {notice.is_pinned && <span className="text-xs text-blue-600">고정</span>}
                    {!notice.is_active && <span className="text-xs text-gray-500">비활성</span>}
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-600 whitespace-pre-wrap">{notice.content}</p>
                  <p className="text-xs text-slate-500">
                    {notice.author_name} · {new Date(notice.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(notice)}>
                    수정
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(notice.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
