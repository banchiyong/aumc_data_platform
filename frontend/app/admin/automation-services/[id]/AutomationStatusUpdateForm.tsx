'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface AutomationStatusUpdateFormProps {
  requestId: string
  currentStatus: string
}

const statusOptionsByCurrentStatus: Record<string, { value: string; label: string }[]> = {
  APPROVED: [
    { value: 'IN_PROGRESS', label: '진행 중' },
    { value: 'COMPLETED', label: '완료' },
  ],
  IN_PROGRESS: [{ value: 'COMPLETED', label: '완료' }],
}

export default function AutomationStatusUpdateForm({
  requestId,
  currentStatus,
}: AutomationStatusUpdateFormProps) {
  const router = useRouter()
  const [nextStatus, setNextStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const options = statusOptionsByCurrentStatus[currentStatus] || []

  if (options.length === 0) return null

  const handleSubmit = async () => {
    if (!nextStatus) {
      alert('변경할 상태를 선택해주세요.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/automation-requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) {
        const error = await response.text()
        alert(`상태 변경 중 오류가 발생했습니다: ${error}`)
      } else {
        alert('상태가 변경되었습니다.')
        router.refresh()
      }
    } catch (error) {
      console.error('Automation status update error:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>상태 변경</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={nextStatus} onValueChange={setNextStatus}>
          <SelectTrigger>
            <SelectValue placeholder="변경할 상태를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          상태 변경
        </Button>
      </CardContent>
    </Card>
  )
}
