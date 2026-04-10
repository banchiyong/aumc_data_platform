import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { BarChart3, Bot, Database, PieChart, Users } from 'lucide-react'

const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export default async function StatisticsPage() {
  const statsResponse = await api.admin.statistics()
  const stats = statsResponse.data || {}

  const dataServices = stats.data_services || {
    total: 0,
    recent_30d: 0,
    pending_review: 0,
    approval_rate: 0,
    average_processing_days: 0,
    status_breakdown: {},
    monthly_statistics: [],
  }

  const automationServices = stats.automation_services || {
    total: 0,
    recent_30d: 0,
    pending_review: 0,
    approval_rate: 0,
    completed: 0,
    roi_saved: 0,
    status_breakdown: {},
    monthly_statistics: [],
  }

  const userStats = stats.user_statistics || {
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    researchers: 0,
    pending_approval: 0,
    recent_logins_7d: 0,
    recent_logins_30d: 0,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">운영 통계</h1>
        <div className="text-sm text-gray-500">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</div>
      </div>

      <StatisticsSection
        title="데이터 서비스 통계"
        description="데이터 서비스 신청 접수, 검토, 처리 현황입니다."
        icon={<Database className="h-5 w-5" />}
        summaryCards={[
          { label: '전체 신청', value: `${dataServices.total}건` },
          { label: '최근 30일', value: `${dataServices.recent_30d}건` },
          { label: '검토 대기', value: `${dataServices.pending_review}건` },
          { label: '승인율', value: `${dataServices.approval_rate}%` },
          { label: '평균 처리시간', value: `${dataServices.average_processing_days}일` },
        ]}
        statusBreakdown={dataServices.status_breakdown}
        monthlyStatistics={dataServices.monthly_statistics}
      />

      <StatisticsSection
        title="자동화 서비스 통계"
        description="자동화 서비스 요청 접수, ROI 저장, 완료 현황입니다."
        icon={<Bot className="h-5 w-5" />}
        summaryCards={[
          { label: '전체 요청', value: `${automationServices.total}건` },
          { label: '최근 30일', value: `${automationServices.recent_30d}건` },
          { label: '검토 대기', value: `${automationServices.pending_review}건` },
          { label: '승인율', value: `${automationServices.approval_rate}%` },
          { label: 'ROI 저장', value: `${automationServices.roi_saved}건` },
          { label: '완료', value: `${automationServices.completed}건` },
        ]}
        statusBreakdown={automationServices.status_breakdown}
        monthlyStatistics={automationServices.monthly_statistics}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            사용자 통계
          </CardTitle>
          <CardDescription>계정 상태와 최근 로그인 현황입니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatBox label="전체 사용자" value={`${userStats.total}명`} />
          <StatBox label="활성 사용자" value={`${userStats.active}명`} />
          <StatBox label="승인 대기" value={`${userStats.pending_approval}명`} />
          <StatBox label="최근 7일 로그인" value={`${userStats.recent_logins_7d}명`} />
          <StatBox label="최근 30일 로그인" value={`${userStats.recent_logins_30d}명`} />
          <StatBox label="관리자" value={`${userStats.admins}명`} />
          <StatBox label="일반 사용자" value={`${userStats.researchers}명`} />
          <StatBox label="비활성 사용자" value={`${userStats.inactive}명`} />
        </CardContent>
      </Card>
    </div>
  )
}

function StatisticsSection({
  title,
  description,
  icon,
  summaryCards,
  statusBreakdown,
  monthlyStatistics,
}: {
  title: string
  description: string
  icon: ReactNode
  summaryCards: Array<{ label: string; value: string }>
  statusBreakdown: Record<string, number>
  monthlyStatistics: Array<{ year: number; month: number; count: number }>
}) {
  const totalByStatus = Object.values(statusBreakdown || {}).reduce((sum, count) => sum + Number(count), 0)
  const monthlyData = monthlyStatistics.map((item) => ({
    month: monthNames[(item.month || 1) - 1] || `${item.month}월`,
    count: item.count,
  }))
  const maxMonthlyCount = Math.max(...monthlyData.map((item) => item.count), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((item) => (
          <StatBox key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              상태 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(statusBreakdown || {}).length === 0 ? (
              <p className="text-sm text-gray-500">집계할 상태 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(statusBreakdown).map(([status, count]) => {
                  const percentage = totalByStatus > 0 ? ((Number(count) / totalByStatus) * 100).toFixed(1) : '0.0'
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
                        <div className={`h-2 rounded-full ${getStatusColor(status)}`} style={{ width: `${percentage}%` }} />
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
              최근 6개월 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-gray-500">집계할 월별 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {monthlyData.map((item) => (
                  <div key={item.month} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium">{item.month}</div>
                    <div className="flex-1">
                      <div className="h-6 w-full rounded-full bg-gray-200">
                        <div
                          className="flex h-6 items-center justify-end rounded-full bg-slate-700 pr-2"
                          style={{ width: `${(item.count / maxMonthlyCount) * 100}%` }}
                        >
                          <span className="text-xs font-medium text-white">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  )
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: '작성 중',
    SUBMITTED: '제출됨',
    UNDER_REVIEW: '검토 중',
    APPROVED: '승인됨',
    REJECTED: '반려됨',
    REVISION_REQUESTED: '수정 요청',
    PROCESSING: '처리 중',
    IN_PROGRESS: '진행 중',
    COMPLETED: '완료',
  }
  return labels[status] || status
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    SUBMITTED: 'bg-blue-500',
    UNDER_REVIEW: 'bg-yellow-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    REVISION_REQUESTED: 'bg-orange-500',
    PROCESSING: 'bg-purple-500',
    IN_PROGRESS: 'bg-purple-500',
    COMPLETED: 'bg-indigo-500',
  }
  return colors[status] || 'bg-slate-400'
}
