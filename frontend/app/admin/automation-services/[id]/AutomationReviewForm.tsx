'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Edit, Loader2, XCircle } from 'lucide-react'

interface AutomationReviewFormProps {
  requestId: string
}

type ReviewAction = 'approve' | 'reject' | 'request_revision'

export default function AutomationReviewForm({ requestId }: AutomationReviewFormProps) {
  const router = useRouter()
  const [action, setAction] = useState<ReviewAction | null>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!action) return

    if ((action === 'reject' || action === 'request_revision') && !reason.trim()) {
      alert(action === 'reject' ? '반려 사유를 입력해주세요.' : '수정 요청 사유를 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const status =
        action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'REVISION_REQUESTED'

      const response = await fetch(`/api/automation-requests/${requestId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reason: action === 'approve' ? undefined : reason,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        alert(`검토 처리 중 오류가 발생했습니다: ${error}`)
      } else {
        alert('검토가 완료되었습니다.')
        router.refresh()
      }
    } catch (error) {
      console.error('Automation review error:', error)
      alert('검토 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>검토 결과</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!action ? (
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => setAction('approve')}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              승인
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setAction('request_revision')}>
              <Edit className="mr-2 h-4 w-4 text-orange-600" />
              수정 요청
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setAction('reject')}>
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              반려
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {(action === 'reject' || action === 'request_revision') && (
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={action === 'reject' ? '반려 사유를 입력해주세요' : '수정 요청 사유를 입력해주세요'}
                rows={4}
              />
            )}

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {action === 'approve' ? '승인 처리' : action === 'reject' ? '반려 처리' : '수정 요청'}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)} disabled={loading}>
                취소
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
