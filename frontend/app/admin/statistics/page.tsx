import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

export default async function StatisticsPage() {
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
  
  // 월별 신청 추이 데이터
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const monthlyStatistics = stats.monthly_statistics || []
  const monthlyData = monthlyStatistics.map((item: any) => ({
    month: monthNames[item.month - 1],
    count: item.count
  }))
  const maxMonthlyCount = Math.max(...monthlyData.map((d: any) => d.count), 1)
  
  // 상태별 통계 계산
  const statusBreakdown = stats.status_breakdown || {}
  const totalByStatus = Object.values(statusBreakdown).reduce((sum: number, count: any) => sum + count, 0)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">통계 대시보드</h1>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </div>
      </div>
      
      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground">
              활성 사용자: {stats.active_users}명 ({((stats.active_users / stats.total_users) * 100).toFixed(1)}%)
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
              최근 30일: {stats.recent_applications}건
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
              전체 기간 기준
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">검토 대기</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_review}</div>
            <p className="text-xs text-muted-foreground">
              즉시 처리 필요
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* 상세 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 신청 상태 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              신청 상태 분포
            </CardTitle>
            <CardDescription>
              전체 신청서의 현재 상태별 분포
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(statusBreakdown).map(([status, count]) => {
                const percentage = totalByStatus > 0 
                  ? ((count as number / totalByStatus) * 100).toFixed(1)
                  : '0';
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={status} />
                        <span className="text-sm font-medium">{getStatusLabel(status)}</span>
                      </div>
                      <span className="text-sm font-bold">{count as number}건 ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(status)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* 월별 신청 추이 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              월별 신청 추이
            </CardTitle>
            <CardDescription>
              최근 6개월간 신청 건수 추이
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium">{data.month}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className="h-6 rounded-full bg-blue-500 flex items-center justify-end pr-2"
                        style={{ width: `${(data.count / maxMonthlyCount) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">{data.count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* 사용자 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              사용자 통계
            </CardTitle>
            <CardDescription>
              사용자 계정 현황
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">전체 사용자</span>
                <span className="font-bold">{stats.total_users}명</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">활성 사용자</span>
                <span className="font-bold text-green-600">{stats.active_users}명</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">비활성 사용자</span>
                <span className="font-bold text-gray-500">
                  {stats.total_users - stats.active_users}명
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">활성화율</span>
                <span className="font-bold">
                  {stats.total_users > 0 
                    ? ((stats.active_users / stats.total_users) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 처리 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              처리 현황
            </CardTitle>
            <CardDescription>
              신청서 처리 상태
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  승인됨
                </span>
                <span className="font-bold text-green-600">
                  {statusBreakdown.APPROVED || 0}건
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  반려됨
                </span>
                <span className="font-bold text-red-600">
                  {statusBreakdown.REJECTED || 0}건
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  검토 중
                </span>
                <span className="font-bold text-yellow-600">
                  {(statusBreakdown.SUBMITTED || 0) + (statusBreakdown.UNDER_REVIEW || 0)}건
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">승인율</span>
                <span className="font-bold text-blue-600">
                  {stats.approval_rate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 요약 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-600 mb-1">일평균 신청</div>
              <div className="text-2xl font-bold">
                {stats.recent_applications > 0 
                  ? (stats.recent_applications / 30).toFixed(1)
                  : '0'}건
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-600 mb-1">평균 처리 시간</div>
              <div className="text-2xl font-bold">
                {stats.average_processing_days || 0}일
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-600 mb-1">완료율</div>
              <div className="text-2xl font-bold">
                {totalByStatus > 0 
                  ? (((statusBreakdown.COMPLETED || 0) / totalByStatus) * 100).toFixed(1)
                  : '0'}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'DRAFT':
      return <div className="w-3 h-3 rounded-full bg-gray-500" />
    case 'SUBMITTED':
      return <div className="w-3 h-3 rounded-full bg-blue-500" />
    case 'UNDER_REVIEW':
      return <div className="w-3 h-3 rounded-full bg-yellow-500" />
    case 'APPROVED':
      return <div className="w-3 h-3 rounded-full bg-green-500" />
    case 'REJECTED':
      return <div className="w-3 h-3 rounded-full bg-red-500" />
    case 'REVISION_REQUESTED':
      return <div className="w-3 h-3 rounded-full bg-orange-500" />
    case 'PROCESSING':
      return <div className="w-3 h-3 rounded-full bg-purple-500" />
    case 'COMPLETED':
      return <div className="w-3 h-3 rounded-full bg-indigo-500" />
    default:
      return <div className="w-3 h-3 rounded-full bg-gray-400" />
  }
}

function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    DRAFT: '작성 중',
    SUBMITTED: '제출됨',
    UNDER_REVIEW: '검토 중',
    APPROVED: '승인됨',
    REJECTED: '반려됨',
    REVISION_REQUESTED: '수정 요청',
    PROCESSING: '처리 중',
    COMPLETED: '완료',
  }
  return labels[status] || status
}

function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    DRAFT: 'bg-gray-500',
    SUBMITTED: 'bg-blue-500',
    UNDER_REVIEW: 'bg-yellow-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    REVISION_REQUESTED: 'bg-orange-500',
    PROCESSING: 'bg-purple-500',
    COMPLETED: 'bg-indigo-500',
  }
  return colors[status] || 'bg-gray-400'
}