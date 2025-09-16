import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { Users, FileText, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const statsResponse = await api.admin.statistics()
  const stats = statsResponse.data || {
    total_users: 0,
    active_users: 0,
    total_applications: 0,
    recent_applications: 0,
    approval_rate: 0,
    pending_review: 0,
    status_breakdown: {}
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground">
              활성: {stats.active_users}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 신청</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_applications}</div>
            <p className="text-xs text-muted-foreground">
              최근 30일: {stats.recent_applications}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_review}</div>
            <p className="text-xs text-muted-foreground">
              검토 필요
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인율</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approval_rate}%</div>
            <p className="text-xs text-muted-foreground">
              전체 기간
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인됨</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.status_breakdown?.APPROVED || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              전체 신청 중
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">처리 중</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.status_breakdown?.PROCESSING || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              데이터 가공 중
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>신청 상태 분포</CardTitle>
            <CardDescription>
              전체 신청서의 현재 상태별 분포입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.status_breakdown || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                  </div>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>
              자주 사용하는 관리 기능에 빠르게 접근하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/applications"
                className="p-4 border rounded-lg hover:bg-gray-50 text-center"
              >
                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">신청 관리</p>
              </a>
              <a
                href="/admin/users"
                className="p-4 border rounded-lg hover:bg-gray-50 text-center"
              >
                <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">사용자 관리</p>
              </a>
              <a
                href="/admin/statistics"
                className="p-4 border rounded-lg hover:bg-gray-50 text-center"
              >
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">통계 보기</p>
              </a>
              <a
                href="/admin/applications?status=SUBMITTED"
                className="p-4 border rounded-lg hover:bg-gray-50 text-center"
              >
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-medium">대기 중 검토</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    DRAFT: { label: '작성 중', className: 'bg-gray-100 text-gray-800' },
    SUBMITTED: { label: '제출됨', className: 'bg-blue-100 text-blue-800' },
    UNDER_REVIEW: { label: '검토 중', className: 'bg-yellow-100 text-yellow-800' },
    APPROVED: { label: '승인됨', className: 'bg-green-100 text-green-800' },
    REJECTED: { label: '반려됨', className: 'bg-red-100 text-red-800' },
    REVISION_REQUESTED: { label: '수정 요청', className: 'bg-orange-100 text-orange-800' },
    PROCESSING: { label: '처리 중', className: 'bg-purple-100 text-purple-800' },
    COMPLETED: { label: '완료', className: 'bg-indigo-100 text-indigo-800' },
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}