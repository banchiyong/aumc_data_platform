'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createApplicationAction } from '@/lib/actions'
import { 
  Save, 
  Send, 
  AlertCircle, 
  FileText, 
  Upload,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react'

const serviceTypes = [
  { id: 'STRUCTURED_EXTRACTION', label: '정형 추출' },
  { id: 'UNSTRUCTURED_EXTRACTION', label: '비정형 추출' },
  { id: 'PSEUDONYMIZATION', label: '가명화' },
  { id: 'EXTERNAL_LINKAGE', label: '타기관 결합' },
]

interface MultiStepApplicationFormProps {
  userData: {
    name: string
    email: string
    phone?: string
    department?: string
  } | null
}

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { number: 1, title: '기본 정보', description: '연구자 및 프로젝트 정보' },
  { number: 2, title: '데이터 요청', description: '서비스 유형 및 데이터 세부사항' },
  { number: 3, title: '첨부파일', description: 'IRB 통지서 및 연구계획서' },
  { number: 4, title: '검토 및 제출', description: '입력 내용 확인' },
]

export default function MultiStepApplicationForm({ userData }: MultiStepApplicationFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showSaveModal, setShowSaveModal] = useState(false)
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    project_name: '',
    applicant_name: userData?.name || '',
    applicant_email: userData?.email || '',
    applicant_phone: userData?.phone || '',
    applicant_department: userData?.department || '',
    principal_investigator: '',
    pi_department: '',
    irb_number: '',
    desired_completion_date: '',
    service_types: [] as string[],
    unstructured_data_type: '',
    target_patients: '',
    request_details: '',
  })

  const [files, setFiles] = useState({
    irb_document: null as File | null,
    research_plan: null as File | null,
  })

  // 자동 저장 기능
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (autoSaveStatus === 'idle') {
        saveToLocalStorage()
      }
    }, 2000)

    return () => clearTimeout(saveTimer)
  }, [formData, autoSaveStatus])

  // 로컬 스토리지에서 데이터 복원
  useEffect(() => {
    const savedData = localStorage.getItem('application_draft')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to restore saved data:', error)
      }
    }
  }, [])

  const saveToLocalStorage = () => {
    setAutoSaveStatus('saving')
    try {
      localStorage.setItem('application_draft', JSON.stringify(formData))
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    } catch (error) {
      setAutoSaveStatus('error')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1) as Step)
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(1, prev - 1) as Step)
  }

  const validateStep = (step: Step): boolean => {
    setError('')
    switch (step) {
      case 1:
        if (!formData.project_name || !formData.applicant_name || !formData.applicant_email || 
            !formData.principal_investigator || !formData.pi_department || !formData.irb_number) {
          setError('모든 필수 정보를 입력해주세요')
          return false
        }
        break
      case 2:
        if (formData.service_types.length === 0) {
          setError('최소 1개 이상의 서비스 유형을 선택해주세요')
          return false
        }
        if (formData.service_types.includes('UNSTRUCTURED_EXTRACTION') && !formData.unstructured_data_type) {
          setError('비정형 추출 선택 시 비정형 데이터 유형을 입력해주세요')
          return false
        }
        if (!formData.target_patients || formData.target_patients.length < 10) {
          setError('대상환자는 최소 10자 이상 입력해주세요')
          return false
        }
        if (!formData.request_details || formData.request_details.length < 20) {
          setError('요청 상세 내용은 최소 20자 이상 입력해주세요')
          return false
        }
        break
      case 3:
        // 첨부파일은 선택사항이므로 검증하지 않음
        break
    }
    return true
  }

  const validateAllSteps = (): boolean => {
    // 제출 시에는 1, 2단계만 필수 검증 (3단계 첨부파일은 선택사항)
    return validateStep(1) && validateStep(2)
  }

  const handleServiceTypeChange = (typeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      service_types: checked 
        ? [...prev.service_types, typeId]
        : prev.service_types.filter(t => t !== typeId)
    }))
  }

  const handleFileChange = (type: 'irb_document' | 'research_plan', file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }))
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    if (isDraft) {
      // 임시저장은 localStorage만 사용
      saveToLocalStorage()
      setError('')
      // 임시저장 성공 피드백 (상단 상태바)
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
      // 모달 표시
      setShowSaveModal(true)
      return
    }

    if (!validateAllSteps()) return
    
    setLoading(true)
    setError('')

    try {
      const submitFormData = new FormData()
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'service_types') {
          submitFormData.append(key, JSON.stringify(value))
        } else {
          submitFormData.append(key, value as string)
        }
      })

      if (files.irb_document) {
        submitFormData.append('irb_document', files.irb_document)
      }
      if (files.research_plan) {
        submitFormData.append('research_plan', files.research_plan)
      }

      const result = await createApplicationAction(submitFormData)
      
      if (result?.error) {
        setError(result.error)
      } else {
        // 성공 시 임시 저장 데이터 삭제
        localStorage.removeItem('application_draft')
        router.push('/researcher/applications')
      }
    } catch (err: any) {
      setError('신청서 제출 중 오류가 발생했습니다')
    }
    
    setLoading(false)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} setFormData={setFormData} />
      case 2:
        return <DataRequestStep formData={formData} setFormData={setFormData} handleServiceTypeChange={handleServiceTypeChange} />
      case 3:
        return <AttachmentsStep files={files} handleFileChange={handleFileChange} />
      case 4:
        return <ReviewStep formData={formData} files={files} />
    }
  }

  return (
    <div className="space-y-6">
      {/* 진행률 표시 */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">신청서 작성</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {autoSaveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    자동 저장 중...
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    자동 저장됨
                  </>
                )}
              </div>
            </div>
            
            <Progress value={(currentStep / 4) * 100} className="w-full" />
            
            <div className="flex justify-between text-xs text-gray-600">
              {STEPS.map((step, index) => (
                <div 
                  key={step.number}
                  className={`text-center ${currentStep >= step.number ? 'text-blue-600 font-medium' : ''}`}
                >
                  <div className="mb-1">{step.title}</div>
                  <div className="text-gray-400">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 단계별 내용 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {currentStep}
            </span>
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrev}
          disabled={currentStep === 1 || loading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          이전
        </Button>

        <div className="flex gap-2">
          {/* 임시저장 버튼 (마지막 단계가 아닐 때만) */}
          {currentStep < 4 && (
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              임시저장
            </Button>
          )}

          {/* 다음/제출 버튼 */}
          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={loading}>
              다음
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => handleSubmit(false)} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  제출 중...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  신청서 제출
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 임시저장 완료 모달 */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              임시저장 완료
            </DialogTitle>
            <DialogDescription>
              입력하신 내용이 임시저장되었습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p>• 페이지를 새로고침하거나 나중에 다시 방문해도 작성 내용이 유지됩니다</p>
              <p>• 자동저장 기능이 활성화되어 있어 2초마다 자동으로 저장됩니다</p>
              <p>• 신청서를 최종 제출하면 임시저장 데이터는 삭제됩니다</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowSaveModal(false)}>
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 단계별 컴포넌트들
function BasicInfoStep({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="project_name">연구과제명 *</Label>
          <Input
            id="project_name"
            value={formData.project_name}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, project_name: e.target.value }))}
            placeholder="연구과제명을 입력하세요"
          />
        </div>
        <div>
          <Label htmlFor="irb_number">IRB 승인번호 *</Label>
          <Input
            id="irb_number"
            value={formData.irb_number}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, irb_number: e.target.value }))}
            placeholder="예: AJIRB-MED-2024-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="applicant_name">신청자명 *</Label>
          <Input
            id="applicant_name"
            value={formData.applicant_name}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, applicant_name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="applicant_department">신청자 소속</Label>
          <Input
            id="applicant_department"
            value={formData.applicant_department}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, applicant_department: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="principal_investigator">책임연구자 *</Label>
          <Input
            id="principal_investigator"
            value={formData.principal_investigator}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, principal_investigator: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="pi_department">책임연구자 소속 *</Label>
          <Input
            id="pi_department"
            value={formData.pi_department}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, pi_department: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="desired_completion_date">희망 완료일자</Label>
        <Input
          id="desired_completion_date"
          type="date"
          value={formData.desired_completion_date}
          onChange={(e) => {
            const selectedDate = e.target.value;
            setFormData((prev: any) => ({ ...prev, desired_completion_date: selectedDate }));
            
            // 선택 시점에 유효성 검사
            if (selectedDate) {
              const selected = new Date(selectedDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const minDate = new Date(today);
              minDate.setMonth(minDate.getMonth() + 1); // 1개월 후
              
              if (selected <= today) {
                alert('희망 완료일자는 오늘 이후여야 합니다.');
                setFormData((prev: any) => ({ ...prev, desired_completion_date: '' }));
              } else if (selected < minDate) {
                alert('희망 완료일자는 신청일로부터 최소 1개월 이후여야 합니다.');
                setFormData((prev: any) => ({ ...prev, desired_completion_date: '' }));
              }
            }
          }}
          min={(() => {
            const minDate = new Date();
            minDate.setMonth(minDate.getMonth() + 1);
            return minDate.toISOString().split('T')[0];
          })()}
        />
        <p className="text-xs text-gray-500 mt-1">신청일로부터 최소 1개월 이후 날짜를 선택해주세요</p>
      </div>
    </div>
  )
}

function DataRequestStep({ formData, setFormData, handleServiceTypeChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">서비스 유형 *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {serviceTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={type.id}
                checked={formData.service_types.includes(type.id)}
                onCheckedChange={(checked) => handleServiceTypeChange(type.id, checked)}
              />
              <Label htmlFor={type.id}>{type.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {formData.service_types.includes('UNSTRUCTURED_EXTRACTION') && (
        <div>
          <Label htmlFor="unstructured_data_type">비정형 데이터 유형 *</Label>
          <Input
            id="unstructured_data_type"
            value={formData.unstructured_data_type}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, unstructured_data_type: e.target.value }))}
            placeholder="예: 영상의학과 판독소견, 병리 보고서 등"
          />
        </div>
      )}

      <div>
        <Label htmlFor="target_patients">대상환자 * (최소 10자)</Label>
        <Textarea
          id="target_patients"
          value={formData.target_patients}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, target_patients: e.target.value }))}
          placeholder="연구 대상이 되는 환자의 조건을 상세히 기술해주세요 (예: 2020년 1월부터 2023년 12월까지 본원 응급실을 내원한 18세 이상 성인 환자 중 급성 심근경색으로 진단받은 환자)"
          rows={4}
        />
        <div className="text-xs text-gray-500 mt-1">
          {formData.target_patients.length}/10자 이상 필요
        </div>
      </div>

      <div>
        <Label htmlFor="request_details">요청 상세 내용 * (최소 20자)</Label>
        <Textarea
          id="request_details"
          value={formData.request_details}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, request_details: e.target.value }))}
          placeholder="필요한 데이터와 가공 요구사항을 구체적으로 설명해주세요 (예: 환자의 인구학적 정보, 진단명, 검사결과, 처방 정보 등이 필요하며, 개인정보는 가명화 처리하여 제공 요청함)"
          rows={6}
        />
        <div className="text-xs text-gray-500 mt-1">
          {formData.request_details.length}/20자 이상 필요
        </div>
      </div>
    </div>
  )
}

function AttachmentsStep({ files, handleFileChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">IRB 통지서</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.hwp"
            onChange={(e) => handleFileChange('irb_document', e.target.files?.[0] || null)}
            className="hidden"
            id="irb_document"
          />
          <label htmlFor="irb_document" className="cursor-pointer">
            <span className="text-blue-600 hover:underline">파일 선택</span>
            <span className="text-gray-500"> 또는 드래그 앤 드롭</span>
          </label>
          {files.irb_document && (
            <p className="mt-2 text-sm text-gray-600">선택된 파일: {files.irb_document.name}</p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">연구계획서</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.hwp"
            onChange={(e) => handleFileChange('research_plan', e.target.files?.[0] || null)}
            className="hidden"
            id="research_plan"
          />
          <label htmlFor="research_plan" className="cursor-pointer">
            <span className="text-blue-600 hover:underline">파일 선택</span>
            <span className="text-gray-500"> 또는 드래그 앤 드롭</span>
          </label>
          {files.research_plan && (
            <p className="mt-2 text-sm text-gray-600">선택된 파일: {files.research_plan.name}</p>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <p>• 지원 파일 형식: PDF, DOC, DOCX, HWP</p>
        <p>• 최대 파일 크기: 10MB</p>
        <p>• 첨부파일은 선택사항입니다</p>
      </div>
    </div>
  )
}

function ReviewStep({ formData, files }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">입력 정보 확인</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <Label className="font-medium text-gray-700">연구과제명</Label>
              <p className="text-gray-900">{formData.project_name}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-700">IRB 승인번호</Label>
              <p className="text-gray-900">{formData.irb_number}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-700">책임연구자</Label>
              <p className="text-gray-900">{formData.principal_investigator}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label className="font-medium text-gray-700">서비스 유형</Label>
              <div className="space-y-1">
                {formData.service_types.map((type: string) => (
                  <p key={type} className="text-gray-900">
                    • {serviceTypes.find(st => st.id === type)?.label}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <Label className="font-medium text-gray-700">첨부파일</Label>
              <div className="space-y-1">
                {files.irb_document && (
                  <p className="text-gray-900">• IRB 통지서: {files.irb_document.name}</p>
                )}
                {files.research_plan && (
                  <p className="text-gray-900">• 연구계획서: {files.research_plan.name}</p>
                )}
                {!files.irb_document && !files.research_plan && (
                  <p className="text-gray-500">첨부된 파일이 없습니다</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">제출 전 확인사항</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 입력한 모든 정보가 정확한지 확인하세요</li>
          <li>• 제출 후에는 관리자 승인 전까지 수정이 제한됩니다</li>
          <li>• 검토 결과는 이메일로 통보됩니다</li>
        </ul>
      </div>
    </div>
  )
}