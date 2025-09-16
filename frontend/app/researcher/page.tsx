import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

export default async function ResearcherDashboard() {
  const applicationsResponse = await api.applications.list()
  const applications = applicationsResponse.data || []
  
  const stats = {
    total: applications.length,
    draft: applications.filter((a: any) => a.status === 'DRAFT').length,
    submitted: applications.filter((a: any) => a.status === 'SUBMITTED').length,
    approved: applications.filter((a: any) => a.status === 'APPROVED').length,
    rejected: applications.filter((a: any) => a.status === 'REJECTED').length,
  }
  
  const recentApplications = applications.slice(0, 5)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">연구자 대시보드</h1>
        <Link href="/researcher/applications/new">
          <Button>새 신청서 작성</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 신청</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">작성 중</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인됨</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">반려됨</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>최근 신청 내역</CardTitle>
          <CardDescription>
            최근에 작성하거나 제출한 신청서 목록입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              아직 신청 내역이 없습니다
            </p>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <Link
                      href={`/researcher/applications/${app.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {app.project_name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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