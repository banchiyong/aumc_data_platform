'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Bot, CheckCircle, ChevronLeft, ChevronRight, Loader2, Send, Upload } from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5

const STEPS = [
  { number: 1, title: '기본 정보', description: '신청자 및 요청 개요' },
  { number: 2, title: '대상 업무', description: '현재 업무와 기능 요구사항' },
  { number: 3, title: 'ROI 정보', description: '기존 투입과 예상 효과' },
  { number: 4, title: '첨부자료', description: '기존 업무 프로세스 및 참고자료' },
  { number: 5, title: '검토 및 제출', description: '입력 내용 확인' },
] as const

interface MultiStepAutomationRequestFormProps {
  userData: {
    name: string
    email: string
    phone?: string
    department?: string
  } | null
  mode?: 'create' | 'edit'
  requestId?: string
  initialData?: any
}

const serviceTypes = [
  { value: 'FORM_DRAFT', label: '서식지 초안 생성' },
  { value: 'ROUTINE_AUTOMATION', label: '루틴 업무 자동화' },
  { value: 'CONSULTING', label: '상담 요청' },
]

const requesterTypes = [
  { value: 'RESEARCHER', label: '연구자' },
  { value: 'STAFF', label: '직원' },
]

export default function MultiStepAutomationRequestForm({
  userData,
  mode = 'create',
  requestId,
  initialData,
}: MultiStepAutomationRequestFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const logDevError = (message: string, detail?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[automation-request] ${message}`, detail)
    }
  }

  const extractErrorMessage = (payload: unknown, fallback: string) => {
    if (!payload) return fallback
    if (typeof payload === 'string') return payload
    if (Array.isArray(payload)) {
      return payload
        .map((item) => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object' && 'msg' in item) return String(item.msg)
          return JSON.stringify(item)
        })
        .join(', ')
    }
    if (typeof payload === 'object') {
      const detail = 'detail' in payload ? (payload as { detail?: unknown }).detail : undefined
      return extractErrorMessage(detail, fallback)
    }
    return fallback
  }

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    requester_type: initialData?.requester_type || 'RESEARCHER',
    requester_phone: initialData?.requester_phone || userData?.phone || '',
    service_type: initialData?.service_type || '',
    related_system: initialData?.related_system || '',
    current_process_summary: initialData?.current_process_summary || '',
    functional_requirements: initialData?.functional_requirements || '',
    expected_users: initialData?.expected_users || '',
    special_notes: initialData?.special_notes || '',
    current_manpower_count: initialData?.current_manpower_count ? String(initialData.current_manpower_count) : '',
    current_worker_annual_salary: initialData?.current_worker_annual_salary ? String(initialData.current_worker_annual_salary) : '60000000',
    current_misc_operating_cost: initialData?.current_misc_operating_cost ? String(initialData.current_misc_operating_cost) : '0',
    current_execution_frequency: initialData?.current_execution_frequency ? String(initialData.current_execution_frequency) : '',
    current_time_minutes: initialData?.current_time_minutes ? String(initialData.current_time_minutes) : '',
    expected_time_minutes: initialData?.expected_time_minutes ? String(initialData.expected_time_minutes) : '',
    expected_roi_summary: initialData?.expected_roi_summary || '',
  })

  const [files, setFiles] = useState({
    process_document: null as File | null,
    reference_document: null as File | null,
  })

  const getStepValidationMessage = (step: Step): string | null => {
    switch (step) {
      case 1:
        if (!formData.title || !formData.requester_phone || !formData.requester_type || !formData.service_type) {
          return '기본 정보의 필수 항목을 모두 입력해주세요'
        }
        return null
      case 2:
        if (!formData.current_process_summary || formData.current_process_summary.length < 20) {
          return '기존 업무 프로세스를 20자 이상 입력해주세요'
        }
        if (!formData.functional_requirements || formData.functional_requirements.length < 20) {
          return '기능 요구사항을 20자 이상 입력해주세요'
        }
        return null
      case 3:
        if (!formData.current_manpower_count || Number(formData.current_manpower_count) < 1) {
          return '기존 작업에 투입된 인력을 입력해주세요'
        }
        if (!formData.current_worker_annual_salary || Number(formData.current_worker_annual_salary) < 1) {
          return '작업자 평균 연봉을 입력해주세요'
        }
        if (!formData.current_execution_frequency || Number(formData.current_execution_frequency) < 1) {
          return '기존 작업 빈도(월 기준 횟수)를 입력해주세요'
        }
        if (!formData.current_time_minutes || Number(formData.current_time_minutes) < 1) {
          return '기존 작업 소요 시간을 입력해주세요'
        }
        if (!formData.expected_roi_summary || formData.expected_roi_summary.length < 10) {
          return 'ROI 및 기대 효과를 10자 이상 입력해주세요'
        }
        return null
      case 4:
        if (!files.process_document && !initialData?.process_document_path) {
          return '기존 업무 프로세스 첨부파일을 업로드해주세요'
        }
        return null
      case 5:
        return null
      default:
        return null
    }
  }

  const handleNext = () => {
    const message = getStepValidationMessage(currentStep)
    if (message) {
      setError(message)
      return
    }

    setError('')
    setCurrentStep((prev) => Math.min(5, prev + 1) as Step)
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as Step)
  }

  const handleSubmit = async () => {
    for (const step of [1, 2, 3, 4] as Step[]) {
      const message = getStepValidationMessage(step)
      if (message) {
        setError(message)
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const submitFormData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitFormData.append(key, value)
        }
      })
      submitFormData.append('status', 'SUBMITTED')

      if (files.process_document) {
        submitFormData.append('process_document', files.process_document)
      }
      if (files.reference_document) {
        submitFormData.append('reference_document', files.reference_document)
      }

      const response = await fetch(
        mode === 'edit' && requestId
          ? `/api/automation-requests/${requestId}`
          : '/api/automation-requests',
        {
          method: mode === 'edit' && requestId ? 'PUT' : 'POST',
          body: submitFormData,
        }
      )

      const responseText = await response.text()
      let parsed: unknown = null
      if (responseText) {
        try {
          parsed = JSON.parse(responseText)
        } catch {
          parsed = responseText
        }
      }

      if (!response.ok) {
        const message = extractErrorMessage(
          parsed,
          mode === 'edit' ? '자동화 서비스 수정에 실패했습니다' : '자동화 서비스 신청에 실패했습니다'
        )
        logDevError(mode === 'edit' ? '자동화 서비스 수정 실패' : '자동화 서비스 신청 실패', {
          status: response.status,
          body: parsed,
        })
        setError(message)
      } else {
        router.push('/researcher/automation-services')
      }
    } catch (error) {
      logDevError(mode === 'edit' ? '자동화 서비스 수정 중 예외 발생' : '자동화 서비스 신청 중 예외 발생', error)
      setError('자동화 서비스 신청 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">요청 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="예: 외래 예약 확인 업무 자동화"
                />
              </div>
              <div>
                <Label>신청자 구분 *</Label>
                <Select
                  value={formData.requester_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, requester_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {requesterTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>신청자명</Label>
                <Input value={userData?.name || ''} disabled />
              </div>
              <div>
                <Label>신청자 소속</Label>
                <Input value={userData?.department || ''} disabled />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="requester_phone">연락처 *</Label>
                <Input
                  id="requester_phone"
                  value={formData.requester_phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, requester_phone: e.target.value }))}
                  placeholder="연락 가능한 번호를 입력하세요"
                />
              </div>
              <div>
                <Label>신청자 이메일</Label>
                <Input value={userData?.email || ''} disabled />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>서비스 유형 *</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, service_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="자동화 서비스 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="related_system">관련 시스템/업무 영역</Label>
                <Input
                  id="related_system"
                  value={formData.related_system}
                  onChange={(e) => setFormData((prev) => ({ ...prev, related_system: e.target.value }))}
                  placeholder="예: 데이터 신청 검토 프로세스"
                />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="current_process_summary">기존 업무 프로세스 *</Label>
              <Textarea
                id="current_process_summary"
                rows={5}
                value={formData.current_process_summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, current_process_summary: e.target.value }))}
                placeholder="현재 업무가 어떤 순서로 진행되는지 구체적으로 설명해주세요"
              />
            </div>
            <div>
              <Label htmlFor="functional_requirements">기능 요구사항 *</Label>
              <Textarea
                id="functional_requirements"
                rows={6}
                value={formData.functional_requirements}
                onChange={(e) => setFormData((prev) => ({ ...prev, functional_requirements: e.target.value }))}
                placeholder="자동화 서비스에서 필요한 기능 요구사항을 구체적으로 작성해주세요"
              />
            </div>
            <div>
              <Label htmlFor="expected_users">주요 사용 대상</Label>
              <Input
                id="expected_users"
                value={formData.expected_users}
                onChange={(e) => setFormData((prev) => ({ ...prev, expected_users: e.target.value }))}
                placeholder="예: 연구지원 담당자 3명, 행정 실무자 2명"
              />
            </div>
            <div>
              <Label htmlFor="special_notes">특이사항</Label>
              <Textarea
                id="special_notes"
                rows={4}
                value={formData.special_notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, special_notes: e.target.value }))}
                placeholder="긴급한 요청이거나 꼭 필요한 이유가 있으면 작성해주세요"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="current_manpower_count">기존 작업 투입 인력 *</Label>
                <Input
                  id="current_manpower_count"
                  type="number"
                  min="1"
                  value={formData.current_manpower_count}
                  onChange={(e) => setFormData((prev) => ({ ...prev, current_manpower_count: e.target.value }))}
                  placeholder="예: 2"
                />
              </div>
              <div>
                <Label htmlFor="current_worker_annual_salary">작업자 평균 연봉(원) *</Label>
                <Input
                  id="current_worker_annual_salary"
                  type="number"
                  min="1"
                  value={formData.current_worker_annual_salary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, current_worker_annual_salary: e.target.value }))}
                  placeholder="예: 60000000"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="current_execution_frequency">기존 작업 빈도(월 기준 횟수) *</Label>
                <Input
                  id="current_execution_frequency"
                  type="number"
                  min="1"
                  value={formData.current_execution_frequency}
                  onChange={(e) => setFormData((prev) => ({ ...prev, current_execution_frequency: e.target.value }))}
                  placeholder="예: 20"
                />
              </div>
              <div>
                <Label htmlFor="current_misc_operating_cost">기존 운영시 기타 잡비(원)</Label>
                <Input
                  id="current_misc_operating_cost"
                  type="number"
                  min="0"
                  value={formData.current_misc_operating_cost}
                  onChange={(e) => setFormData((prev) => ({ ...prev, current_misc_operating_cost: e.target.value }))}
                  placeholder="예: 0"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="current_time_minutes">기존 작업 소요 시간(분) *</Label>
                <Input
                  id="current_time_minutes"
                  type="number"
                  min="1"
                  value={formData.current_time_minutes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, current_time_minutes: e.target.value }))}
                  placeholder="예: 120"
                />
              </div>
              <div>
                <Label htmlFor="expected_time_minutes">자동화 후 예상 소요 시간(분)</Label>
                <Input
                  id="expected_time_minutes"
                  type="number"
                  min="0"
                  value={formData.expected_time_minutes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expected_time_minutes: e.target.value }))}
                  placeholder="예: 20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expected_roi_summary">ROI 및 기대 효과 *</Label>
              <Textarea
                id="expected_roi_summary"
                rows={5}
                value={formData.expected_roi_summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, expected_roi_summary: e.target.value }))}
                placeholder="절감 가능한 시간, 투입 인력 감소, 처리 품질 향상 등 ROI 관점에서 기대 효과를 작성해주세요"
              />
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block text-base font-medium">기존 업무 프로세스 첨부파일 *</Label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <input
                  id="process_document"
                  type="file"
                  accept=".pdf,.doc,.docx,.hwp,.ppt,.pptx,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) => setFiles((prev) => ({ ...prev, process_document: e.target.files?.[0] || null }))}
                />
                <label htmlFor="process_document" className="cursor-pointer">
                  <span className="text-blue-600 hover:underline">파일 선택</span>
                  <span className="text-gray-500"> 또는 드래그 앤 드롭</span>
                </label>
                {files.process_document && (
                  <p className="mt-2 text-sm text-gray-600">선택된 파일: {files.process_document.name}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-3 block text-base font-medium">참고자료 첨부파일</Label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <input
                  id="reference_document"
                  type="file"
                  accept=".pdf,.doc,.docx,.hwp,.ppt,.pptx,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) => setFiles((prev) => ({ ...prev, reference_document: e.target.files?.[0] || null }))}
                />
                <label htmlFor="reference_document" className="cursor-pointer">
                  <span className="text-blue-600 hover:underline">파일 선택</span>
                  <span className="text-gray-500"> 또는 드래그 앤 드롭</span>
                </label>
                {files.reference_document && (
                  <p className="mt-2 text-sm text-gray-600">선택된 파일: {files.reference_document.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-500">
              <p>• 기존 업무 프로세스 자료는 필수 첨부 항목입니다</p>
              {initialData?.process_document_original_name && (
                <p>• 현재 등록된 업무 프로세스 자료: {initialData.process_document_original_name}</p>
              )}
              {initialData?.reference_document_original_name && (
                <p>• 현재 등록된 참고자료: {initialData.reference_document_original_name}</p>
              )}
              <p>• 지원 파일 형식: PDF, DOC, DOCX, HWP, PPT, PPTX, XLS, XLSX</p>
              <p>• 최대 파일 크기: 10MB</p>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <Label className="font-medium text-gray-700">요청 제목</Label>
                  <p>{formData.title}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">서비스 유형</Label>
                  <p>{serviceTypes.find((type) => type.value === formData.service_type)?.label || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">기존 작업 투입 인력</Label>
                  <p>{formData.current_manpower_count || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">작업자 평균 연봉</Label>
                  <p>{formData.current_worker_annual_salary ? `${Number(formData.current_worker_annual_salary).toLocaleString('ko-KR')}원` : '-'}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">기존 작업 빈도(월 기준 횟수)</Label>
                  <p>{formData.current_execution_frequency ? `${formData.current_execution_frequency}회` : '-'}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">기존 작업 소요 시간</Label>
                  <p>{formData.current_time_minutes ? `${formData.current_time_minutes}분` : '-'}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">기존 운영시 기타 잡비</Label>
                  <p>{formData.current_misc_operating_cost ? `${Number(formData.current_misc_operating_cost).toLocaleString('ko-KR')}원` : '0원'}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">특이사항</Label>
                  <p className="whitespace-pre-wrap">{formData.special_notes || '-'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="font-medium text-gray-700">기존 업무 프로세스 첨부</Label>
                <p>{files.process_document?.name || initialData?.process_document_original_name || '미첨부'}</p>
              </div>
              <div>
                <Label className="font-medium text-gray-700">참고자료 첨부</Label>
                <p>{files.reference_document?.name || initialData?.reference_document_original_name || '미첨부'}</p>
              </div>
                <div>
                  <Label className="font-medium text-gray-700">ROI 및 기대 효과</Label>
                  <p className="whitespace-pre-wrap">{formData.expected_roi_summary || '-'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-900">제출 전 확인사항</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• 기능 요구사항, ROI 정보, 기존 투입 인력 정보가 모두 입력되었는지 확인하세요</li>
                <li>• 기존 업무 프로세스 자료가 첨부되어야 검토가 가능합니다</li>
                <li>• 검토 결과는 포털 내 상태와 담당자 의견으로 확인할 수 있습니다</li>
              </ul>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {mode === 'edit' ? '자동화 서비스 신청 수정' : '자동화 서비스 신청'}
              </h2>
              <div className="text-sm text-gray-500">
                {currentStep} / {STEPS.length}
              </div>
            </div>

            <Progress value={(currentStep / STEPS.length) * 100} className="w-full" />

            <div className="grid gap-2 md:grid-cols-5">
              {STEPS.map((step) => {
                const isActive = currentStep === step.number
                const hasError = getStepValidationMessage(step.number as Step)
                return (
                  <button
                    key={step.number}
                    type="button"
                    className={`rounded-md border px-3 py-2 text-left ${
                      hasError ? 'border-red-200 bg-red-50 text-red-700' : isActive ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => setCurrentStep(step.number as Step)}
                  >
                    <p className="text-xs font-semibold">{step.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{step.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1 || loading}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          이전
        </Button>

        {currentStep < 5 ? (
          <Button onClick={handleNext} disabled={loading}>
            다음
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                제출 중...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                신청서 제출
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
