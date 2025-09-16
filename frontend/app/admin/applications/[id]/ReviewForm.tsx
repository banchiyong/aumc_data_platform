'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Edit, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  applicationId: string
}

type ReviewAction = 'approve' | 'reject' | 'request_revision'

export default function ReviewForm({ applicationId }: ReviewFormProps) {
  const [action, setAction] = useState<ReviewAction | null>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!action) return

    if ((action === 'reject' || action === 'request_revision') && !reason.trim()) {
      alert(action === 'reject' ? '반려 사유를 입력해주세요.' : '수정 요청 사유를 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      // Map action to status
      let status = ''
      if (action === 'approve') {
        status = 'APPROVED'
      } else if (action === 'reject') {
        status = 'REJECTED'
      } else if (action === 'request_revision') {
        status = 'REVISION_REQUESTED'
      }

      const reviewData: any = { 
        status,
        reason: (action === 'reject' || action === 'request_revision') ? reason : undefined
      }

      const response = await fetch(`/api/applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        const error = await response.text()
        alert('검토 처리 중 오류가 발생했습니다: ' + error)
      } else {
        alert('검토가 완료되었습니다.')
        router.refresh()
      }
    } catch (error) {
      console.error('Review error:', error)
      alert('검토 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAction(null)
    setReason('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>검토 결과</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!action ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">검토 결과를 선택해주세요:</p>
            
            <div className="space-y-2">
              <Button 
                onClick={() => setAction('approve')} 
                className="w-full justify-start"
                variant="outline"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                승인
              </Button>
              
              <Button 
                onClick={() => setAction('request_revision')} 
                className="w-full justify-start"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2 text-orange-600" />
                수정 요청
              </Button>
              
              <Button 
                onClick={() => setAction('reject')} 
                className="w-full justify-start"
                variant="outline"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                반려
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {action === 'approve' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {action === 'request_revision' && <Edit className="h-5 w-5 text-orange-600" />}
                {action === 'reject' && <XCircle className="h-5 w-5 text-red-600" />}
                <span className="font-medium">
                  {action === 'approve' && '승인'}
                  {action === 'request_revision' && '수정 요청'}
                  {action === 'reject' && '반려'}
                </span>
              </div>
              
              <Button onClick={resetForm} variant="ghost" size="sm">
                변경
              </Button>
            </div>

            {(action === 'reject' || action === 'request_revision') && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  {action === 'reject' ? '반려 사유' : '수정 요청 사유'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={action === 'reject' 
                    ? '반려 사유를 상세히 입력해주세요...'
                    : '수정이 필요한 부분을 상세히 입력해주세요...'
                  }
                  rows={4}
                  className="resize-none"
                />
              </div>
            )}

            {action === 'approve' && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  이 신청서를 승인하시겠습니까? 승인 후에는 신청자에게 알림이 발송되며, 데이터 처리 작업이 시작됩니다.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1"
                variant={action === 'approve' ? 'default' : action === 'reject' ? 'destructive' : 'default'}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {action === 'approve' && '승인 처리'}
                {action === 'request_revision' && '수정 요청'}
                {action === 'reject' && '반려 처리'}
              </Button>
              
              <Button onClick={resetForm} variant="outline">
                취소
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}