import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import Link from 'next/link'
import { BarChart3, Bot, CheckCircle2, Clock3, FileText, PieChart } from 'lucide-react'

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

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    SUBMITTED: 'bg-blue-500',
    UNDER_REVIEW: 'bg-yellow-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    REVISION_REQUESTED: 'bg-orange-500',
    IN_PROGRESS: 'bg-purple-500',
    COMPLETED: 'bg-indigo-500',
  }
  return colors[status] || 'bg-slate-400'
}

function getServiceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    FORM_DRAFT: '서식지 초안 생성',
    ROUTINE_AUTOMATION: '루틴 업무 자동화',
    CONSULTING: '상담 요청',
  }
  return labels[type] || type
}

export default async function AdminAutomationServicesDashboardPage() {
  const response = await api.automationRequests.list()
  const requests = response.data || []

  const stats = {
    total: requests.length,
    pending: requests.filter((request: any) => ['SUBMITTED', 'UNDER_REVIEW'].includes(request.status)).length,
    approved: requests.filter((request: any) => request.status === 'APPROVED').length,
    completed: requests.filter((request: any) => request.status === 'COMPLETED').length,
  }

  const recentRequests = requests.slice(0, 5)
  const totalRequests = Math.max(requests.length, 1)

  const statusBreakdown = requests.reduce((acc: Record<string, number>, request: any) => {
    acc[request.status] = (acc[request.status] || 0) + 1
    return acc
  }, {})

  const serviceTypeBreakdown = requests.reduce((acc: Record<string, number>, request: any) => {
    acc[request.service_type] = (acc[request.service_type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">자동화 서비스 대시보드</h1>
        <Link href="/admin/automation-services/manage" className="text-sm font-medium text-blue-700 hover:underline">
          신청 관리로 이동
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              자동화 서비스 상태 분포
            </CardTitle>
            <CardDescription>접수된 자동화 서비스 요청의 현재 상태를 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(statusBreakdown).length === 0 ? (
              <p className="text-sm text-gray-500">시각화할 요청 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(statusBreakdown).map(([status, count]) => {
                  const percentage = ((count / totalRequests) * 100).toFixed(1)
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${getStatusColor(status)}`} />
                          <span className="font-medium">{getStatusLabel(status)}</span>
                        </div>
                        <span className="text-gray-600">{count}건 ({percentage}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${getStatusColor(status)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              서비스 유형 분포
            </CardTitle>
            <CardDescription>어떤 자동화 서비스 수요가 많은지 유형별로 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(serviceTypeBreakdown).length === 0 ? (
              <p className="text-sm text-gray-500">시각화할 요청 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(serviceTypeBreakdown).map(([type, count]) => {
                  const percentage = ((count / totalRequests) * 100).toFixed(1)
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{getServiceTypeLabel(type)}</span>
                        <span className="text-gray-600">{count}건 ({percentage}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-slate-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 자동화 서비스 요청</CardTitle>
          <CardDescription>최근 접수된 자동화 서비스 요청과 상태를 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="py-12 text-center text-gray-500">등록된 자동화 서비스 신청이 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request: any) => (
                <div key={request.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <Link href={`/admin/automation-services/${request.id}`} className="font-semibold text-blue-700 hover:underline">
                        {request.title}
                      </Link>
                      <p className="text-sm text-slate-600">{request.requester_name} · {request.requester_department}</p>
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
