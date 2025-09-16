'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Loader2, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StatusUpdateFormProps {
  applicationId: string
  currentStatus: string
}

export default function StatusUpdateForm({ applicationId, currentStatus }: StatusUpdateFormProps) {
  const [newStatus, setNewStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 현재 상태에 따라 변경 가능한 상태들 정의
  const getAvailableStatuses = () => {
    switch (currentStatus) {
      case 'APPROVED':
        return [
          { value: 'PROCESSING', label: '처리 중', description: '데이터 추출/가공 작업을 시작합니다' },
          { value: 'COMPLETED', label: '완료', description: '모든 작업이 완료되었습니다' }
        ]
      case 'PROCESSING':
        return [
          { value: 'COMPLETED', label: '완료', description: '모든 작업이 완료되었습니다' }
        ]
      default:
        return []
    }
  }

  const availableStatuses = getAvailableStatuses()

  const handleStatusUpdate = async () => {
    if (!newStatus) return

    setLoading(true)

    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.text()
        alert('상태 변경 중 오류가 발생했습니다: ' + error)
      } else {
        alert('상태가 성공적으로 변경되었습니다.')
        router.refresh()
        setNewStatus('')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return <Settings className="h-4 w-4 text-purple-600" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-indigo-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return 'text-purple-600'
      case 'COMPLETED':
        return 'text-indigo-600'
      default:
        return 'text-gray-600'
    }
  }

  // 변경 가능한 상태가 없으면 컴포넌트를 렌더링하지 않음
  if (availableStatuses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          상태 변경
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            현재 상태에서 변경할 수 있는 상태를 선택해주세요:
          </p>
          
          <div className="space-y-3">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="변경할 상태 선택" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.value)}
                      <div>
                        <div className={`font-medium ${getStatusColor(status.value)}`}>
                          {status.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {status.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {newStatus && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  {getStatusIcon(newStatus)}
                  <div>
                    <p className={`text-sm font-medium ${getStatusColor(newStatus)}`}>
                      {availableStatuses.find(s => s.value === newStatus)?.label}로 변경
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {availableStatuses.find(s => s.value === newStatus)?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleStatusUpdate}
                disabled={!newStatus || loading}
                className="flex-1"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                상태 변경
              </Button>
              
              {newStatus && (
                <Button
                  onClick={() => setNewStatus('')}
                  variant="outline"
                >
                  취소
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500">
            💡 상태 변경은 되돌릴 수 없습니다. 신중히 선택해주세요.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}