import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AutomationDownloadButton from '@/app/researcher/automation-services/AutomationDownloadButton'
import AutomationReviewForm from './AutomationReviewForm'
import AutomationStatusUpdateForm from './AutomationStatusUpdateForm'
import AutomationRoiCalculator from './AutomationRoiCalculator'
import { HistoryTimeline } from '@/components/history-timeline'

interface AdminAutomationRequestDetailPageProps {
  params: Promise<{
    id: string
  }>
}

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

export default async function AdminAutomationRequestDetailPage({ params }: AdminAutomationRequestDetailPageProps) {
  const { id } = await params
  const response = await api.automationRequests.get(id)
  const historyResponse = await api.automationRequests.history(id)

  if (response.error || !response.data) {
    return (
      <div className="space-y-6">
        <Link href="/admin/automation-services">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </Link>
        <Card>
          <CardContent className="p-6 text-center text-red-600">
            자동화 서비스 요청을 불러올 수 없습니다.
          </CardContent>
        </Card>
      </div>
    )
  }

  const request = response.data
  const historyItems = historyResponse.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/automation-services">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">자동화 서비스 신청 관리</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>신청 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">요청 제목</p>
                <p className="mt-1 text-lg font-semibold">{request.title}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">신청자명</p>
                  <p className="mt-1">{request.requester_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">신청자 구분</p>
                  <p className="mt-1">{request.requester_type === 'STAFF' ? '직원' : '연구자'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">소속</p>
                  <p className="mt-1">{request.requester_department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">서비스 유형</p>
                  <p className="mt-1">{getServiceTypeLabel(request.service_type)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>기능 요구 및 ROI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">기존 업무 프로세스</p>
                <p className="mt-1 whitespace-pre-wrap">{request.current_process_summary}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">기능 요구사항</p>
                <p className="mt-1 whitespace-pre-wrap">{request.functional_requirements}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">특이사항</p>
                <p className="mt-1 whitespace-pre-wrap text-red-700">{request.special_notes || '-'}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">기존 작업 투입 인력</p>
                  <p className="mt-1">{request.current_manpower_count}명</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">작업자 평균 연봉</p>
                  <p className="mt-1">
                    {request.current_worker_annual_salary
                      ? `${Number(request.current_worker_annual_salary).toLocaleString('ko-KR')}원`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">기존 작업 빈도(월 기준 횟수)</p>
                  <p className="mt-1">{request.current_execution_frequency}회</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">기존 작업 소요 시간</p>
                  <p className="mt-1">{request.current_time_minutes}분</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">자동화 후 예상 시간</p>
                  <p className="mt-1">{request.expected_time_minutes ? `${request.expected_time_minutes}분` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">기존 운영시 기타 잡비</p>
                  <p className="mt-1">{Number(request.current_misc_operating_cost || 0).toLocaleString('ko-KR')}원</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ROI 및 기대 효과</p>
                <p className="mt-1 whitespace-pre-wrap">{request.expected_roi_summary}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>자동화 서비스 관리 이력</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoryTimeline items={historyItems} emptyMessage="등록된 자동화 서비스 이력이 없습니다." />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>처리 상태</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-700">
                {getStatusLabel(request.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">신청일</span>
                <span>{new Date(request.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              {request.review_reason && (
                <div>
                  <p className="text-sm font-medium text-gray-500">반려 사유</p>
                  <p className="mt-1 whitespace-pre-wrap">{request.review_reason}</p>
                </div>
              )}
              {request.revision_request_reason && (
                <div>
                  <p className="text-sm font-medium text-gray-500">수정 요청 사유</p>
                  <p className="mt-1 whitespace-pre-wrap">{request.revision_request_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {request.special_notes && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">검토 시 확인할 특이사항</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-red-700">
                  {request.special_notes}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>첨부자료</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">기존 업무 프로세스 자료</p>
                  <p className="text-xs text-gray-500">{request.process_document_original_name || '미첨부'}</p>
                </div>
                {request.process_document_path && (
                  <AutomationDownloadButton requestId={id} fileType="process-document" label="다운로드" />
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">참고자료</p>
                  <p className="text-xs text-gray-500">{request.reference_document_original_name || '미첨부'}</p>
                </div>
                {request.reference_document_path && (
                  <AutomationDownloadButton requestId={id} fileType="reference-document" label="다운로드" />
                )}
              </div>
            </CardContent>
          </Card>

          {(request.status === 'SUBMITTED' || request.status === 'UNDER_REVIEW') && (
            <AutomationRoiCalculator
              requestId={id}
              currentManpowerCount={request.current_manpower_count}
              currentWorkerAnnualSalary={request.current_worker_annual_salary}
              currentExecutionFrequency={request.current_execution_frequency}
              currentTimeMinutes={request.current_time_minutes}
              expectedTimeMinutes={request.expected_time_minutes}
              savedRoiBasisJson={request.roi_basis_json}
              savedRoiAt={request.roi_saved_at}
            />
          )}

          {(request.status === 'SUBMITTED' || request.status === 'UNDER_REVIEW') && (
            <AutomationReviewForm requestId={id} />
          )}

          {(request.status === 'APPROVED' || request.status === 'IN_PROGRESS') && (
            <AutomationStatusUpdateForm requestId={id} currentStatus={request.status} />
          )}
        </div>
      </div>
    </div>
  )
}
