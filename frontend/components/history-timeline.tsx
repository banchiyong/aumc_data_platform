interface HistoryTimelineItem {
  id: string
  action: string
  created_at: string
  user_name?: string | null
  reason?: string | null
  details?: {
    changes?: Record<string, { before: unknown; after: unknown }>
    created_fields?: Record<string, unknown>
  } | null
}

interface HistoryTimelineProps {
  items: HistoryTimelineItem[]
  emptyMessage: string
}

const actionLabels: Record<string, string> = {
  CREATED: '생성',
  UPDATED: '수정',
  SUBMITTED: '제출',
  APPROVED: '승인',
  REJECTED: '반려',
  REVISION_REQUESTED: '수정 요청',
  PROCESSING: '처리 중',
  COMPLETED: '완료',
  DELETED: '삭제',
  IN_PROGRESS: '진행 중',
  DOWNLOADED: '다운로드',
}

const fieldLabels: Record<string, string> = {
  project_name: '연구과제명',
  applicant_phone: '신청자 연락처',
  principal_investigator: '책임연구자',
  pi_department: '책임연구자 소속',
  irb_number: 'IRB 승인번호',
  desired_completion_date: '희망 완료일자',
  service_types: '서비스 유형',
  unstructured_data_type: '비정형 데이터 유형',
  target_patients: '대상환자',
  request_details: '요청 상세 내용',
  irb_document_original_name: 'IRB 통지서',
  research_plan_original_name: '연구계획서',
  status: '상태',
  title: '요청 제목',
  requester_type: '신청자 구분',
  requester_phone: '연락처',
  service_type: '서비스 유형',
  related_system: '관련 시스템/업무 영역',
  current_process_summary: '기존 업무 프로세스',
  functional_requirements: '기능 요구사항',
  expected_users: '주요 사용 대상',
  current_manpower_count: '기존 작업 투입 인력',
  current_execution_frequency: '기존 작업 빈도(월 기준 횟수)',
  current_time_minutes: '기존 작업 소요 시간',
  expected_time_minutes: '자동화 후 예상 소요 시간',
  expected_roi_summary: 'ROI 및 기대 효과',
  process_document_original_name: '기존 업무 프로세스 자료',
  reference_document_original_name: '참고자료',
  review_reason: '반려 사유',
  revision_request_reason: '수정 요청 사유',
}

export function HistoryTimeline({ items, emptyMessage }: HistoryTimelineProps) {
  if (!items.length) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="border-l-2 border-slate-200 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {actionLabels[item.action] || item.action}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(item.created_at).toLocaleString('ko-KR')}
            </span>
            {item.user_name && <span className="text-xs text-gray-500">by {item.user_name}</span>}
          </div>
          {item.reason && <p className="mt-2 text-sm whitespace-pre-wrap text-gray-700">{item.reason}</p>}
          {item.details?.changes && Object.keys(item.details.changes).length > 0 && (
            <div className="mt-3 space-y-2 rounded-md bg-slate-50 p-3 text-sm text-gray-700">
              {Object.entries(item.details.changes).map(([field, values]) => (
                <div key={field}>
                  <p className="font-medium text-slate-800">{fieldLabels[field] || field}</p>
                  <p className="text-xs text-slate-500">이전: {formatHistoryValue(values.before)}</p>
                  <p className="text-xs text-slate-500">변경: {formatHistoryValue(values.after)}</p>
                </div>
              ))}
            </div>
          )}
          {item.details?.created_fields && Object.keys(item.details.created_fields).length > 0 && (
            <div className="mt-3 space-y-1 rounded-md bg-slate-50 p-3 text-sm text-gray-700">
              {Object.entries(item.details.created_fields).map(([field, value]) => (
                <div key={field}>
                  <span className="font-medium text-slate-800">{fieldLabels[field] || field}</span>
                  <span className="ml-2 text-xs text-slate-500">{formatHistoryValue(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function formatHistoryValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
