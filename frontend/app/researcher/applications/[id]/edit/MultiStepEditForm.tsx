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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Save, 
  Send, 
  AlertCircle, 
  FileText, 
  Upload,
  User,
  Database,
  Paperclip,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  X,
  Clock
} from 'lucide-react'

const serviceTypes = [
  { id: 'STRUCTURED_EXTRACTION', label: '정형 추출' },
  { id: 'UNSTRUCTURED_EXTRACTION', label: '비정형 추출' },
  { id: 'PSEUDONYMIZATION', label: '가명화' },
  { id: 'EXTERNAL_LINKAGE', label: '타기관 결합' },
]

const steps = [
  {
    id: 1,
    title: '기본 정보',
    description: '연구과제 및 신청자 정보',
    icon: User
  },
  {
    id: 2,
    title: '데이터 요청',
    description: '필요한 데이터 및 처리 방법',
    icon: Database
  },
  {
    id: 3,
    title: '첨부파일',
    description: 'IRB 통지서 및 연구계획서',
    icon: Paperclip
  },
  {
    id: 4,
    title: '검토 및 제출',
    description: '입력 내용 확인 및 최종 제출',
    icon: CheckCircle
  }
]

interface MultiStepEditFormProps {
  application: any
  userData: any
}

export default function MultiStepEditForm({ application, userData }: MultiStepEditFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null)

  // 기존 데이터로 초기화
  const [formData, setFormData] = useState(() => {
    // localStorage에서 임시 저장된 데이터가 있는지 확인
    const savedData = localStorage.getItem(`application_edit_${application.id}`)
    if (savedData) {
      try {
        return JSON.parse(savedData)
      } catch (e) {
        console.error('Failed to parse saved data:', e)
      }
    }
    
    // 기본값으로 기존 신청서 데이터 사용
    return {
      project_name: application.project_name || '',
      applicant_name: application.applicant_name || '',
      applicant_email: application.applicant_email || '',
      applicant_phone: application.applicant_phone || '',
      applicant_department: application.applicant_department || '',
      principal_investigator: application.principal_investigator || '',
      pi_department: application.pi_department || '',
      irb_number: application.irb_number || '',
      desired_completion_date: application.desired_completion_date?.split('T')[0] || '',
      service_types: application.service_types || [],
      unstructured_data_type: application.unstructured_data_type || '',
      target_patients: application.target_patients || '',
      request_details: application.request_details || '',
    }
  })

  const [files, setFiles] = useState({
    irb_document: null as File | null,
    research_plan: null as File | null,
  })
  
  // 파일 삭제 상태 관리 (프론트엔드에서만)
  const [deletedFiles, setDeletedFiles] = useState({
    irb_document: false,
    research_plan: false,
  })
  
  const [showUnstructuredType, setShowUnstructuredType] = useState(
    () => formData.service_types?.includes('UNSTRUCTURED_EXTRACTION') || false
  )

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      localStorage.setItem(`application_edit_${application.id}`, JSON.stringify(formData))
      setLastAutoSaveTime(new Date())
    }, 2000) // Auto-save every 2 seconds

    return () => clearInterval(autoSaveInterval)
  }, [formData, application.id])

  const getProgress = () => {
    return (currentStep / steps.length) * 100
  }

  const handleServiceTypeChange = (typeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      service_types: checked 
        ? [...prev.service_types, typeId]
        : prev.service_types.filter(t => t !== typeId)
    }))
    
    if (typeId === 'UNSTRUCTURED_EXTRACTION') {
      setShowUnstructuredType(checked)
      if (!checked) {
        setFormData(prev => ({ ...prev, unstructured_data_type: '' }))
      }
    }
  }

  const getFieldError = (fieldName: string) => {
    if (!touched[fieldName] && !attemptedSubmit) return null
    
    switch(fieldName) {
      case 'project_name':
        return !formData.project_name || formData.project_name.length < 5 ? '연구과제명을 5자 이상 입력해주세요' : null
      case 'applicant_name':
        return !formData.applicant_name ? '신청자명을 입력해주세요' : null
      case 'applicant_email':
        return !formData.applicant_email ? '이메일을 입력해주세요' : null
      case 'applicant_phone':
        return !formData.applicant_phone ? '연락처를 입력해주세요' : null
      case 'principal_investigator':
        return !formData.principal_investigator ? '책임연구자를 입력해주세요' : null
      case 'pi_department':
        return !formData.pi_department ? '책임연구자 소속을 입력해주세요' : null
      case 'irb_number':
        return !formData.irb_number ? 'IRB 승인번호를 입력해주세요' : null
      case 'service_types':
        return formData.service_types.length === 0 ? '서비스 유형을 선택해주세요' : null
      case 'unstructured_data_type':
        return showUnstructuredType && !formData.unstructured_data_type ? '비정형 데이터 유형을 입력해주세요' : null
      case 'target_patients':
        return !formData.target_patients || formData.target_patients.length < 10 ? '대상환자를 10자 이상 입력해주세요' : null
      case 'request_details':
        return !formData.request_details || formData.request_details.length < 20 ? '요청 상세 내용을 20자 이상 입력해주세요' : null
      default:
        return null
    }
  }

  const hasStepErrors = (stepNumber: number) => {
    switch(stepNumber) {
      case 1:
        return ['project_name', 'applicant_name', 'applicant_email', 'applicant_phone', 'principal_investigator', 'pi_department', 'irb_number']
          .some(field => getFieldError(field) !== null)
      case 2:
        const dataFields = ['service_types', 'target_patients', 'request_details']
        if (showUnstructuredType) dataFields.push('unstructured_data_type')
        return dataFields.some(field => getFieldError(field) !== null)
      case 3:
        // 첨부파일 검증 - 최종적으로 파일이 있는지 확인
        const willHaveIrbDocument = 
          (application.irb_document_path && !deletedFiles.irb_document) || 
          files.irb_document
        const willHaveResearchPlan = 
          (application.research_plan_path && !deletedFiles.research_plan) || 
          files.research_plan
        return !willHaveIrbDocument || !willHaveResearchPlan
      default:
        return false
    }
  }

  const canProceedToNextStep = () => {
    return !hasStepErrors(currentStep)
  }

  const handleTemporarySave = async () => {
    setShowSaveModal(true)
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        throw new Error('수정 중 오류가 발생했습니다')
      }
      
      // 임시 저장 데이터 삭제
      localStorage.removeItem(`application_edit_${application.id}`)
      
      router.refresh()
      router.push(`/researcher/applications/${application.id}`)
    } catch (err) {
      setError('수정 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setAttemptedSubmit(true)
    
    // 모든 단계의 검증
    const hasAnyErrors = steps.some((_, index) => hasStepErrors(index + 1))
    
    if (hasAnyErrors) {
      setError('필수 항목을 모두 입력해주세요')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // 먼저 수정사항 저장
      const updateResponse = await fetch(`/api/applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!updateResponse.ok) {
        throw new Error('수정 중 오류가 발생했습니다')
      }
      
      // 파일 처리 (업로드 및 삭제)
      if (deletedFiles.irb_document && application.irb_document_path) {
        await fetch(`/api/applications/${application.id}/delete-file/irb`, {
          method: 'DELETE',
        })
      } else if (files.irb_document) {
        const formDataFile = new FormData()
        formDataFile.append('file', files.irb_document)
        await fetch(`/api/applications/${application.id}/upload/irb`, {
          method: 'POST',
          body: formDataFile,
        })
      }
      
      if (deletedFiles.research_plan && application.research_plan_path) {
        await fetch(`/api/applications/${application.id}/delete-file/research-plan`, {
          method: 'DELETE',
        })
      } else if (files.research_plan) {
        const formDataFile = new FormData()
        formDataFile.append('file', files.research_plan)
        await fetch(`/api/applications/${application.id}/upload/research-plan`, {
          method: 'POST',
          body: formDataFile,
        })
      }
      
      // 제출
      const submitResponse = await fetch(`/api/applications/${application.id}/submit`, {
        method: 'POST',
      })
      
      if (!submitResponse.ok) {
        throw new Error('제출 중 오류가 발생했습니다')
      }
      
      // 임시 저장 데이터 삭제
      localStorage.removeItem(`application_edit_${application.id}`)
      
      router.refresh()
      router.push(`/researcher/applications/${application.id}`)
    } catch (err) {
      setError('제출 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          기본 정보
        </CardTitle>
        <CardDescription>연구과제 및 신청자 정보를 입력해주세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project_name">
              연구과제명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="project_name"
              value={formData.project_name}
              onChange={(e) => setFormData({...formData, project_name: e.target.value})}
              onBlur={() => setTouched({...touched, project_name: true})}
              className={getFieldError('project_name') ? 'border-red-500' : ''}
              placeholder="연구과제명을 입력하세요 (최소 5자)"
            />
            {getFieldError('project_name') && (
              <p className="text-sm text-red-500">{getFieldError('project_name')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="irb_number">
              IRB 승인번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="irb_number"
              value={formData.irb_number}
              onChange={(e) => setFormData({...formData, irb_number: e.target.value})}
              onBlur={() => setTouched({...touched, irb_number: true})}
              className={getFieldError('irb_number') ? 'border-red-500' : ''}
              placeholder="IRB 승인번호를 입력하세요"
            />
            {getFieldError('irb_number') && (
              <p className="text-sm text-red-500">{getFieldError('irb_number')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicant_name">
              신청자명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="applicant_name"
              value={formData.applicant_name}
              onChange={(e) => setFormData({...formData, applicant_name: e.target.value})}
              onBlur={() => setTouched({...touched, applicant_name: true})}
              className={getFieldError('applicant_name') ? 'border-red-500' : ''}
              placeholder="신청자명을 입력하세요"
            />
            {getFieldError('applicant_name') && (
              <p className="text-sm text-red-500">{getFieldError('applicant_name')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicant_department">
              신청자 소속 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="applicant_department"
              value={formData.applicant_department}
              onChange={(e) => setFormData({...formData, applicant_department: e.target.value})}
              placeholder="신청자 소속을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicant_email">
              신청자 이메일 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="applicant_email"
              type="email"
              value={formData.applicant_email}
              onChange={(e) => setFormData({...formData, applicant_email: e.target.value})}
              onBlur={() => setTouched({...touched, applicant_email: true})}
              className={getFieldError('applicant_email') ? 'border-red-500' : ''}
              placeholder="이메일을 입력하세요"
            />
            {getFieldError('applicant_email') && (
              <p className="text-sm text-red-500">{getFieldError('applicant_email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicant_phone">
              신청자 연락처 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="applicant_phone"
              value={formData.applicant_phone}
              onChange={(e) => setFormData({...formData, applicant_phone: e.target.value})}
              onBlur={() => setTouched({...touched, applicant_phone: true})}
              className={getFieldError('applicant_phone') ? 'border-red-500' : ''}
              placeholder="연락처를 입력하세요"
            />
            {getFieldError('applicant_phone') && (
              <p className="text-sm text-red-500">{getFieldError('applicant_phone')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="principal_investigator">
              책임연구자 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="principal_investigator"
              value={formData.principal_investigator}
              onChange={(e) => setFormData({...formData, principal_investigator: e.target.value})}
              onBlur={() => setTouched({...touched, principal_investigator: true})}
              className={getFieldError('principal_investigator') ? 'border-red-500' : ''}
              placeholder="책임연구자명을 입력하세요"
            />
            {getFieldError('principal_investigator') && (
              <p className="text-sm text-red-500">{getFieldError('principal_investigator')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pi_department">
              책임연구자 소속 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pi_department"
              value={formData.pi_department}
              onChange={(e) => setFormData({...formData, pi_department: e.target.value})}
              onBlur={() => setTouched({...touched, pi_department: true})}
              className={getFieldError('pi_department') ? 'border-red-500' : ''}
              placeholder="책임연구자 소속을 입력하세요"
            />
            {getFieldError('pi_department') && (
              <p className="text-sm text-red-500">{getFieldError('pi_department')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired_completion_date">희망 완료일자</Label>
            <Input
              id="desired_completion_date"
              type="date"
              value={formData.desired_completion_date}
              onChange={(e) => {
                const selectedDate = e.target.value;
                setFormData({...formData, desired_completion_date: selectedDate});
                
                // 선택 시점에 유효성 검사
                if (selectedDate) {
                  const selected = new Date(selectedDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const minDate = new Date(today);
                  minDate.setMonth(minDate.getMonth() + 1); // 1개월 후
                  
                  if (selected <= today) {
                    alert('희망 완료일자는 오늘 이후여야 합니다.');
                    setFormData({...formData, desired_completion_date: ''});
                  } else if (selected < minDate) {
                    alert('희망 완료일자는 신청일로부터 최소 1개월 이후여야 합니다.');
                    setFormData({...formData, desired_completion_date: ''});
                  }
                }
              }}
              min={(() => {
                const minDate = new Date();
                minDate.setMonth(minDate.getMonth() + 1);
                return minDate.toISOString().split('T')[0];
              })()}
            />
            <p className="text-xs text-gray-500">신청일로부터 최소 1개월 이후 날짜를 선택해주세요</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderDataRequest = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          데이터 요청
        </CardTitle>
        <CardDescription>필요한 데이터와 처리 방법을 선택해주세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>
            서비스 유형 <span className="text-red-500">*</span>
          </Label>
          <div className={`space-y-2 p-3 border rounded-lg ${getFieldError('service_types') ? 'border-red-500' : ''}`}>
            {serviceTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={formData.service_types.includes(type.id)}
                  onCheckedChange={(checked) => handleServiceTypeChange(type.id, checked as boolean)}
                />
                <Label htmlFor={type.id} className="cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
          {getFieldError('service_types') && (
            <p className="text-sm text-red-500">{getFieldError('service_types')}</p>
          )}
        </div>

        {showUnstructuredType && (
          <div className="space-y-2">
            <Label htmlFor="unstructured_data_type">
              비정형 데이터 유형 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="unstructured_data_type"
              value={formData.unstructured_data_type}
              onChange={(e) => setFormData({...formData, unstructured_data_type: e.target.value})}
              onBlur={() => setTouched({...touched, unstructured_data_type: true})}
              className={getFieldError('unstructured_data_type') ? 'border-red-500' : ''}
              placeholder="예: 의료영상, 의무기록 텍스트 등"
            />
            {getFieldError('unstructured_data_type') && (
              <p className="text-sm text-red-500">{getFieldError('unstructured_data_type')}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="target_patients">
            대상환자 <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="target_patients"
            value={formData.target_patients}
            onChange={(e) => setFormData({...formData, target_patients: e.target.value})}
            onBlur={() => setTouched({...touched, target_patients: true})}
            className={getFieldError('target_patients') ? 'border-red-500' : ''}
            placeholder="대상 환자군의 특성 및 선정기준을 입력하세요 (최소 10자)"
            rows={4}
          />
          {getFieldError('target_patients') && (
            <p className="text-sm text-red-500">{getFieldError('target_patients')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="request_details">
            요청 상세 내용 <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="request_details"
            value={formData.request_details}
            onChange={(e) => setFormData({...formData, request_details: e.target.value})}
            onBlur={() => setTouched({...touched, request_details: true})}
            className={getFieldError('request_details') ? 'border-red-500' : ''}
            placeholder="필요한 데이터 항목, 처리 요구사항 등을 상세히 입력하세요 (최소 20자)"
            rows={6}
          />
          {getFieldError('request_details') && (
            <p className="text-sm text-red-500">{getFieldError('request_details')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderAttachments = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          첨부파일
        </CardTitle>
        <CardDescription>
          필요시 새 파일을 업로드할 수 있습니다. 새 파일을 업로드하면 기존 파일이 대체됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="irb_document">
            IRB 통지서 <span className="text-red-500">*</span>
          </Label>
          {application.irb_document_path && !deletedFiles.irb_document && !files.irb_document && (
            <div className="p-3 bg-gray-50 border rounded-lg mb-2 flex justify-between items-center">
              <p className="text-sm text-gray-600 break-all">
                <FileText className="inline h-4 w-4 mr-1" />
                기존 파일: {application.irb_document_original_name || 'IRB 통지서가 업로드되어 있습니다'}
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDeletedFiles({...deletedFiles, irb_document: true})
                  setFiles({...files, irb_document: null})
                }}
              >
                <X className="h-4 w-4" />
                삭제
              </Button>
            </div>
          )}
          {deletedFiles.irb_document && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2 flex justify-between items-center">
              <p className="text-sm text-red-600">
                기존 파일이 삭제 예정입니다
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setDeletedFiles({...deletedFiles, irb_document: false})}
              >
                취소
              </Button>
            </div>
          )}
          <Input
            id="irb_document"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              setFiles({...files, irb_document: file})
              if (file) {
                setDeletedFiles({...deletedFiles, irb_document: false})
              }
            }}
          />
          {files.irb_document && (
            <p className="text-sm text-blue-600 break-all">
              새 파일 선택됨: {files.irb_document.name}
            </p>
          )}
          <p className="text-xs text-gray-500">PDF, DOC, DOCX 파일만 업로드 가능합니다 (최대 10MB)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="research_plan">
            연구계획서 <span className="text-red-500">*</span>
          </Label>
          {application.research_plan_path && !deletedFiles.research_plan && !files.research_plan && (
            <div className="p-3 bg-gray-50 border rounded-lg mb-2 flex justify-between items-center">
              <p className="text-sm text-gray-600 break-all">
                <FileText className="inline h-4 w-4 mr-1" />
                기존 파일: {application.research_plan_original_name || '연구계획서가 업로드되어 있습니다'}
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDeletedFiles({...deletedFiles, research_plan: true})
                  setFiles({...files, research_plan: null})
                }}
              >
                <X className="h-4 w-4" />
                삭제
              </Button>
            </div>
          )}
          {deletedFiles.research_plan && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2 flex justify-between items-center">
              <p className="text-sm text-red-600">
                기존 파일이 삭제 예정입니다
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setDeletedFiles({...deletedFiles, research_plan: false})}
              >
                취소
              </Button>
            </div>
          )}
          <Input
            id="research_plan"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              setFiles({...files, research_plan: file})
              if (file) {
                setDeletedFiles({...deletedFiles, research_plan: false})
              }
            }}
          />
          {files.research_plan && (
            <p className="text-sm text-blue-600 break-all">
              새 파일 선택됨: {files.research_plan.name}
            </p>
          )}
          <p className="text-xs text-gray-500">PDF, DOC, DOCX 파일만 업로드 가능합니다 (최대 10MB)</p>
        </div>
      </CardContent>
    </Card>
  )

  const renderReview = () => {
    const willHaveIrbDocument = 
      (application.irb_document_path && !deletedFiles.irb_document) || 
      files.irb_document
    const willHaveResearchPlan = 
      (application.research_plan_path && !deletedFiles.research_plan) || 
      files.research_plan

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            검토 및 제출
          </CardTitle>
          <CardDescription>입력하신 내용을 확인한 후 제출해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 정보 요약 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">기본 정보</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium">연구과제명:</span> {formData.project_name}</div>
              <div><span className="font-medium">IRB 승인번호:</span> {formData.irb_number}</div>
              <div><span className="font-medium">신청자:</span> {formData.applicant_name}</div>
              <div><span className="font-medium">소속:</span> {formData.applicant_department}</div>
              <div><span className="font-medium">책임연구자:</span> {formData.principal_investigator}</div>
              <div><span className="font-medium">책임연구자 소속:</span> {formData.pi_department}</div>
            </div>
          </div>

          {/* 데이터 요청 요약 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">데이터 요청</h4>
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">서비스 유형:</span> {' '}
                {formData.service_types.map(id => serviceTypes.find(t => t.id === id)?.label).join(', ')}
              </div>
              {showUnstructuredType && (
                <div><span className="font-medium">비정형 데이터 유형:</span> {formData.unstructured_data_type}</div>
              )}
              <div><span className="font-medium">대상환자:</span> {formData.target_patients.substring(0, 100)}{formData.target_patients.length > 100 ? '...' : ''}</div>
              <div><span className="font-medium">요청 상세:</span> {formData.request_details.substring(0, 100)}{formData.request_details.length > 100 ? '...' : ''}</div>
            </div>
          </div>

          {/* 첨부파일 요약 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">첨부파일</h4>
            <div className="text-sm space-y-2">
              <div className={willHaveIrbDocument ? 'text-green-600' : 'text-red-600'}>
                <span className="font-medium">IRB 통지서:</span> {' '}
                {files.irb_document ? files.irb_document.name : 
                 (application.irb_document_path && !deletedFiles.irb_document) ? 
                 (application.irb_document_original_name || '업로드됨') : '업로드 필요'}
              </div>
              <div className={willHaveResearchPlan ? 'text-green-600' : 'text-red-600'}>
                <span className="font-medium">연구계획서:</span> {' '}
                {files.research_plan ? files.research_plan.name : 
                 (application.research_plan_path && !deletedFiles.research_plan) ? 
                 (application.research_plan_original_name || '업로드됨') : '업로드 필요'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo()
      case 2:
        return renderDataRequest()
      case 3:
        return renderAttachments()
      case 4:
        return renderReview()
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>단계 {currentStep} / {steps.length}</span>
          <span>{Math.round(getProgress())}% 완료</span>
        </div>
        <Progress value={getProgress()} className="w-full" />
      </div>

      {/* Steps Navigation */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          const hasErrors = hasStepErrors(step.id)

          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
                isCompleted ? 'text-green-600' : 
                hasErrors ? 'text-red-600' : 'text-gray-400'
              }`} onClick={() => setCurrentStep(step.id)}>
                <div className={`p-1 rounded-full ${
                  isActive ? 'bg-blue-100' : 
                  isCompleted ? 'bg-green-100' : 
                  hasErrors ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="hidden md:block text-sm font-medium">{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
            </div>
          )
        })}
      </div>

      {/* Auto-save indicator */}
      {lastAutoSaveTime && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          임시 저장됨: {lastAutoSaveTime.toLocaleTimeString()}
        </div>
      )}

      {/* Current Step Content */}
      {renderCurrentStep()}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              이전
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleTemporarySave}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            임시 저장
          </Button>

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNextStep()}
            >
              다음
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || hasStepErrors(currentStep)}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              제출하기
            </Button>
          )}
        </div>
      </div>

      {/* Temporary Save Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>임시 저장</DialogTitle>
            <DialogDescription>
              현재까지 작성된 내용을 임시 저장하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              취소
            </Button>
            <Button onClick={() => {
              setShowSaveModal(false)
              handleSaveDraft()
            }}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}