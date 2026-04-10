import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Edit, FileText, Calendar, User, Phone, Mail, Building, Download } from 'lucide-react'
import DownloadButton from './DownloadButton'

interface ApplicationDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params
  const response = await api.applications.get(id)
  
  if (response.error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/researcher/applications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">신청서를 불러올 수 없습니다</p>
              <p className="text-sm text-gray-500">{response.error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const application = response.data
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/researcher/applications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">신청서 상세</h1>
        </div>
        
        {(application.status === 'DRAFT' || application.status === 'REVISION_REQUESTED') && (
          <Link href={`/researcher/applications/${id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              수정하기
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 기본 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">연구과제명</label>
                <p className="mt-1 text-lg font-semibold">{application.project_name}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">책임연구자</label>
                  <p className="mt-1">{application.principal_investigator}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">책임연구자 소속</label>
                  <p className="mt-1">{application.pi_department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">IRB 승인번호</label>
                  <p className="mt-1">{application.irb_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">희망 완료일자</label>
                  <p className="mt-1">
                    {application.desired_completion_date 
                      ? new Date(application.desired_completion_date).toLocaleDateString('ko-KR')
                      : '-'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 신청자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                신청자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">신청자명</label>
                  <p className="mt-1">{application.applicant_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">소속</label>
                  <p className="mt-1">{application.applicant_department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="mt-1">{application.applicant_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">연락처</label>
                  <p className="mt-1">{application.applicant_phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 데이터 상세 내용 */}
          <Card>
            <CardHeader>
              <CardTitle>데이터 상세 내용</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">서비스 유형</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {application.service_types?.map((type: string) => (
                    <Badge key={type} variant="secondary">
                      {getServiceTypeLabel(type)}
                    </Badge>
                  ))}
                </div>
              </div>

              {application.unstructured_data_type && (
                <div>
                  <label className="text-sm font-medium text-gray-500">비정형 데이터 유형</label>
                  <p className="mt-1">{application.unstructured_data_type}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">대상환자</label>
                <p className="mt-1 whitespace-pre-wrap">{application.target_patients}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">요청 상세 내용</label>
                <p className="mt-1 whitespace-pre-wrap">{application.request_details}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상태 및 진행 정보 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>신청 상태</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <StatusBadge status={application.status} />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">신청일</span>
                  <span>{new Date(application.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                
                {application.submitted_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">제출일</span>
                    <span>{new Date(application.submitted_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}

                {application.reviewed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">검토일</span>
                    <span>{new Date(application.reviewed_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}

                {application.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">완료일</span>
                    <span>{new Date(application.completed_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
              </div>

              {application.reviewer_name && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500">검토자</p>
                  <p className="text-sm font-medium">{application.reviewer_name}</p>
                </div>
              )}

              {(application.rejection_reason || application.revision_request_reason) && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500">
                    {application.rejection_reason ? '반려 사유' : '수정 요청 사유'}
                  </p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {application.rejection_reason || application.revision_request_reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 첨부파일 */}
          <Card>
            <CardHeader>
              <CardTitle>첨부파일</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">IRB 통지서</p>
                  <p className="text-xs text-gray-500">
                    {application.irb_document_path ? (
                      <>
                        <span className="text-green-600">첨부됨</span>
                        {application.irb_document_original_name && (
                          <span className="block text-gray-700 mt-1 font-mono">
                            📄 {application.irb_document_original_name}
                          </span>
                        )}
                      </>
                    ) : '미첨부'}
                  </p>
                </div>
                {application.irb_document_path && (
                  <DownloadButton
                    applicationId={id}
                    fileType="irb"
                    label="다운로드"
                  />
                )}
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">연구계획서</p>
                  <p className="text-xs text-gray-500">
                    {application.research_plan_path ? (
                      <>
                        <span className="text-green-600">첨부됨</span>
                        {application.research_plan_original_name && (
                          <span className="block text-gray-700 mt-1 font-mono">
                            📄 {application.research_plan_original_name}
                          </span>
                        )}
                      </>
                    ) : '미첨부'}
                  </p>
                </div>
                {application.research_plan_path && (
                  <DownloadButton
                    applicationId={id}
                    fileType="research-plan"
                    label="다운로드"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getServiceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'STRUCTURED_EXTRACTION': '정형 추출',
    'UNSTRUCTURED_EXTRACTION': '비정형 추출',
    'PSEUDONYMIZATION': '가명화',
    'EXTERNAL_LINKAGE': '타기관 결합',
  }
  return labels[type] || type
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
    <Badge className={config.className} variant="secondary">
      {config.label}
    </Badge>
  )
}
