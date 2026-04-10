import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Bot, Clock3, CheckCircle2, FileText } from 'lucide-react'

function getServiceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    FORM_DRAFT: '서식지 초안 생성',
    ROUTINE_AUTOMATION: '루틴 업무 자동화',
    CONSULTING: '상담 요청',
  }
  return labels[type] || type
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: '작성 중',
    SUBMITTED: '제출됨',
    UNDER_REVIEW: '검토 중',
    APPROVED: '승인됨',
    REJECTED: '반려됨',
    REVISION_REQUESTED: '수정 요청',
    IN_PROGRESS: '진행 중',
    COMPLETED: '완료',
  }
  return labels[status] || status
}

export default async function AutomationServicesDashboardPage() {
  const response = await api.automationRequests.list()
  const requests = response.data || []

  const stats = {
    total: requests.length,
    pending: requests.filter((request: any) => ['SUBMITTED', 'UNDER_REVIEW'].includes(request.status)).length,
    approved: requests.filter((request: any) => request.status === 'APPROVED').length,
    completed: requests.filter((request: any) => request.status === 'COMPLETED').length,
  }

  const recentRequests = requests.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">자동화 서비스 대시보드</h1>
        <Link href="/researcher/automation-services/new">
          <Button>자동화 서비스 신청</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 요청</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">검토 대기</CardTitle>
            <Clock3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인됨</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료됨</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 자동화 서비스 요청</CardTitle>
          <CardDescription>
            최근 접수한 자동화 서비스 요청과 현재 상태를 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              자동화 서비스 요청 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request: any) => (
                <div key={request.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <Link
                        href={`/researcher/automation-services/${request.id}`}
                        className="text-lg font-semibold text-blue-700 hover:underline"
                      >
                        {request.title}
                      </Link>
                      <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                        <span>{getServiceTypeLabel(request.service_type)}</span>
                        <span>·</span>
                        <span>{request.requester_department}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-slate-600">
                      <p>상태: {getStatusLabel(request.status)}</p>
                      <p>신청일: {new Date(request.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
