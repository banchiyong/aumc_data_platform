'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Loader2
} from 'lucide-react'

const serviceTypes = [
  { id: 'STRUCTURED_EXTRACTION', label: '정형 추출' },
  { id: 'UNSTRUCTURED_EXTRACTION', label: '비정형 추출' },
  { id: 'PSEUDONYMIZATION', label: '가명화' },
  { id: 'EXTERNAL_LINKAGE', label: '타기관 결합' },
]

interface ApplicationFormProps {
  userData: {
    name: string
    email: string
    phone?: string
    department?: string
  } | null
}

export default function ApplicationForm({ userData }: ApplicationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  
  // 폼 데이터 - 사용자 정보만 초기값 설정
  const [formData, setFormData] = useState({
    // 기본 정보
    project_name: '',
    applicant_name: userData?.name || '',  // 사용자 정보에서 자동 입력
    applicant_email: userData?.email || '',  // 사용자 정보에서 자동 입력
    applicant_phone: userData?.phone || '',  // 사용자 정보에서 자동 입력
    applicant_department: userData?.department || '',  // 사용자 정보에서 자동 입력
    principal_investigator: '',
    pi_department: '',
    irb_number: '',
    desired_completion_date: '',
    
    // 데이터 상세 내용
    service_types: [] as string[],
    unstructured_data_type: '',
    target_patients: '',
    request_details: '',
  })

  const [files, setFiles] = useState({
    irb_document: null as File | null,
    research_plan: null as File | null,
  })
  
  const [showUnstructuredType, setShowUnstructuredType] = useState(false)

  const handleServiceTypeChange = (typeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      service_types: checked 
        ? [...prev.service_types, typeId]
        : prev.service_types.filter(t => t !== typeId)
    }))
    
    // 비정형 추출 선택 여부에 따라 추가 입력 필드 표시
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
        return !formData.project_name ? '연구과제명을 입력해주세요' : null
      case 'applicant_name':
        return !formData.applicant_name ? '신청자명을 입력해주세요' : null
      case 'applicant_email':
        return !formData.applicant_email ? '신청자 이메일을 입력해주세요' : null
      case 'applicant_phone':
        return !formData.applicant_phone ? '신청자 연락처를 입력해주세요' : null
      case 'principal_investigator':
        return !formData.principal_investigator ? '책임연구자명을 입력해주세요' : null
      case 'pi_department':
        return !formData.pi_department ? '책임연구자 소속을 입력해주세요' : null
      case 'irb_number':
        return !formData.irb_number ? 'IRB 승인번호를 입력해주세요' : null
      case 'service_types':
        return formData.service_types.length === 0 ? '서비스 유형을 선택해주세요' : null
      case 'target_patients':
        return formData.target_patients.length < 10 ? '대상환자를 10글자 이상 입력해주세요' : null
      case 'request_details':
        return formData.request_details.length < 20 ? '요청 상세 내용을 20글자 이상 입력해주세요' : null
      case 'desired_completion_date':
        if (formData.desired_completion_date) {
          const desiredDate = new Date(formData.desired_completion_date)
          const minDate = new Date()
          minDate.setDate(minDate.getDate() + 7)
          if (desiredDate < minDate) {
            return '희망 완료일자는 신청일로부터 최소 1주일 이후여야 합니다'
          }
        }
        return null
      default:
        return null
    }
  }

  const validateForm = () => {
    // 모든 필수 필드를 터치로 표시
    const requiredFields = [
      'project_name', 'applicant_name', 'applicant_email', 'applicant_phone',
      'principal_investigator', 'pi_department', 'irb_number', 'service_types',
      'target_patients', 'request_details'
    ]
    
    const newTouched: Record<string, boolean> = {}
    requiredFields.forEach(field => {
      newTouched[field] = true
    })
    setTouched(newTouched)
    
    // 각 필드의 에러 확인
    for (const field of requiredFields) {
      const error = getFieldError(field)
      if (error) return error
    }
    
    return null
  }

  const handleSave = async () => {
    setAttemptedSubmit(true)
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      // FormData 생성
      const submitFormData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'service_types') {
          submitFormData.append(key, JSON.stringify(value))
        } else if (value !== null && value !== undefined) {
          submitFormData.append(key, value.toString())
        }
      })
      submitFormData.append('status', 'DRAFT')
      
      // 파일 추가
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
        alert('임시 저장되었습니다.')
        router.push('/researcher/applications')
      }
    } catch (err: any) {
      setError('저장 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setAttemptedSubmit(true)
    
    // 첨부파일 필수 검증
    if (!files.irb_document) {
      setError('IRB 통지서를 첨부해주세요')
      return
    }
    if (!files.research_plan) {
      setError('연구계획서를 첨부해주세요')
      return
    }

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      // FormData 생성
      const submitFormData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'service_types') {
          submitFormData.append(key, JSON.stringify(value))
        } else if (value !== null && value !== undefined) {
          submitFormData.append(key, value.toString())
        }
      })
      submitFormData.append('status', 'SUBMITTED')
      
      // 파일 추가
      submitFormData.append('irb_document', files.irb_document)
      submitFormData.append('research_plan', files.research_plan)
      
      const result = await createApplicationAction(submitFormData)
      
      if (result?.error) {
        setError(result.error)
      } else {
        alert('신청서가 제출되었습니다.')
        router.push('/researcher/applications')
      }
    } catch (err: any) {
      setError('제출 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 최소 날짜 계산 (오늘부터 7일 후)
  const getMinDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">신규 데이터 신청</h1>
        <p className="text-gray-600 mt-2">
          연구용 데이터 추출 및 처리 서비스를 신청합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>신청서 작성</CardTitle>
          <CardDescription>
            * 표시가 있는 항목은 필수 입력 사항입니다
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 기본 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              기본 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_name" className={getFieldError('project_name') ? 'text-red-500' : ''}>연구과제명 *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, project_name: true }))}
                  placeholder="연구과제명을 입력하세요"
                  className={getFieldError('project_name') ? 'border-red-500 focus:ring-red-500' : ''}
                  required
                />
                {getFieldError('project_name') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('project_name')}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="applicant_name" className={getFieldError('applicant_name') ? 'text-red-500' : ''}>신청자명 *</Label>
                <Input
                  id="applicant_name"
                  value={formData.applicant_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant_name: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, applicant_name: true }))}
                  placeholder="신청자 이름"
                  className={getFieldError('applicant_name') ? 'border-red-500 focus:ring-red-500' : ''}
                  required
                />
                {getFieldError('applicant_name') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('applicant_name')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="applicant_email" className={getFieldError('applicant_email') ? 'text-red-500' : ''}>신청자 이메일 *</Label>
                <Input
                  id="applicant_email"
                  type="email"
                  value={formData.applicant_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant_email: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, applicant_email: true }))}
                  placeholder="user@aumc.ac.kr"
                  className={getFieldError('applicant_email') ? 'border-red-500 focus:ring-red-500' : ''}
                  required
                />
                {getFieldError('applicant_email') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('applicant_email')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="applicant_phone" className={getFieldError('applicant_phone') ? 'text-red-500' : ''}>신청자 연락처 *</Label>
                <Input
                  id="applicant_phone"
                  type="tel"
                  value={formData.applicant_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant_phone: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, applicant_phone: true }))}
                  placeholder="010-0000-0000"
                  className={getFieldError('applicant_phone') ? 'border-red-500 focus:ring-red-500' : ''}
                  required
                />
                {getFieldError('applicant_phone') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('applicant_phone')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="principal_investigator" className={getFieldError('principal_investigator') ? 'text-red-500' : ''}>책임연구자명 *</Label>
                <Input
                  id="principal_investigator"
                  value={formData.principal_investigator}
                  onChange={(e) => setFormData(prev => ({ ...prev, principal_investigator: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, principal_investigator: true }))}
                  placeholder="책임연구자 이름"
                  className={getFieldError('principal_investigator') ? 'border-red-500 focus:ring-red-500' : ''}
                  required
                />
                {getFieldError('principal_investigator') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('principal_investigator')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="pi_department" className={getFieldError('pi_department') ? 'text-red-500' : ''}>책임연구자 소속 *</Label>
                <Input
                  id="pi_department"
                  value={formData.pi_department}
                  onChange={(e) => setFormData(prev => ({ ...prev, pi_department: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, pi_department: true }))}
                  placeholder="예: 내과"
                  className={getFieldError('pi_department') ? 'border-red-500 focus:ring-red-500' : ''}
                  required
                />
                {getFieldError('pi_department') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('pi_department')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="irb_number" className={getFieldError('irb_number') ? 'text-red-500' : ''}>IRB 승인번호 *</Label>
                <Input
                  id="irb_number"
                  value={formData.irb_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, irb_number: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, irb_number: true }))}
                  placeholder="예: AJIRB-MED-MDB-23-000"
                  className={getFieldError('irb_number') ? 'border-red-500 focus:ring-red-500' : ''}
                  required
                />
                {getFieldError('irb_number') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('irb_number')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="desired_completion_date">
                  희망 완료일자
                  <span className="text-sm text-gray-500 ml-2">(선택)</span>
                </Label>
                <Input
                  id="desired_completion_date"
                  type="date"
                  value={formData.desired_completion_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, desired_completion_date: e.target.value }))}
                  min={getMinDate()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  최소 신청일로부터 1주일 이후
                </p>
              </div>
            </div>
          </div>

          {/* 데이터 상세 내용 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              데이터 상세 내용
            </h3>

            <div>
              <Label className={getFieldError('service_types') ? 'text-red-500' : ''}>서비스 유형 * (복수 선택 가능)</Label>
              <div className={`space-y-2 mt-2 p-3 border rounded-md ${getFieldError('service_types') ? 'border-red-500' : 'border-gray-200'}`}>
                {serviceTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={formData.service_types.includes(type.id)}
                      onCheckedChange={(checked) => {
                        handleServiceTypeChange(type.id, checked as boolean)
                        setTouched(prev => ({ ...prev, service_types: true }))
                      }}
                    />
                    <Label htmlFor={type.id} className="cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
              {getFieldError('service_types') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('service_types')}</p>
              )}
            </div>

            {showUnstructuredType && (
              <div>
                <Label htmlFor="unstructured_data_type">
                  비정형 데이터 유형
                  <span className="text-sm text-gray-500 ml-2">(비정형 추출 선택시 필수)</span>
                </Label>
                <Input
                  id="unstructured_data_type"
                  value={formData.unstructured_data_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, unstructured_data_type: e.target.value }))}
                  placeholder="예: 영상, 임상노트 등"
                />
              </div>
            )}
          </div>

          {/* 요청 상세 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">요청 상세</h3>

            <div>
              <Label htmlFor="target_patients" className={getFieldError('target_patients') ? 'text-red-500' : ''}>
                대상환자 *
                <span className="text-sm text-gray-500 ml-2">(최소 10글자)</span>
              </Label>
              <Textarea
                id="target_patients"
                value={formData.target_patients}
                onChange={(e) => setFormData(prev => ({ ...prev, target_patients: e.target.value }))}
                onBlur={() => setTouched(prev => ({ ...prev, target_patients: true }))}
                placeholder="대상 환자군에 대한 설명을 입력하세요"
                className={getFieldError('target_patients') ? 'border-red-500 focus:ring-red-500' : ''}
                rows={3}
                required
              />
              <div className="flex justify-between items-center mt-1">
                <p className={`text-xs ${formData.target_patients.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.target_patients.length}/10 글자
                </p>
                {getFieldError('target_patients') && (
                  <p className="text-sm text-red-500">{getFieldError('target_patients')}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="request_details" className={getFieldError('request_details') ? 'text-red-500' : ''}>
                요청 상세 내용 *
                <span className="text-sm text-gray-500 ml-2">(최소 20글자)</span>
              </Label>
              <Textarea
                id="request_details"
                value={formData.request_details}
                onChange={(e) => setFormData(prev => ({ ...prev, request_details: e.target.value }))}
                onBlur={() => setTouched(prev => ({ ...prev, request_details: true }))}
                placeholder="필요한 데이터와 처리 방법에 대해 상세히 설명해주세요"
                className={getFieldError('request_details') ? 'border-red-500 focus:ring-red-500' : ''}
                rows={5}
                required
              />
              <div className="flex justify-between items-center mt-1">
                <p className={`text-xs ${formData.request_details.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.request_details.length}/20 글자
                </p>
                {getFieldError('request_details') && (
                  <p className="text-sm text-red-500">{getFieldError('request_details')}</p>
                )}
              </div>
            </div>
          </div>

          {/* 첨부파일 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="h-5 w-5" />
              첨부파일
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="irb_document">
                  IRB 통지서 *
                  <span className="text-sm text-gray-500 ml-2">(제출시 필수)</span>
                </Label>
                <Input
                  id="irb_document"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFiles(prev => ({ ...prev, irb_document: file }))
                    }
                  }}
                />
                {files.irb_document && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {files.irb_document.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="research_plan">
                  연구계획서 *
                  <span className="text-sm text-gray-500 ml-2">(제출시 필수)</span>
                </Label>
                <Input
                  id="research_plan"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFiles(prev => ({ ...prev, research_plan: file }))
                    }
                  }}
                />
                {files.research_plan && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {files.research_plan.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 버튼 섹션 */}
          <div className="pt-6 border-t">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/researcher/applications')}
                disabled={loading}
              >
                취소
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    임시 저장
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    제출
                  </>
                )}
              </Button>
            </div>
            
            {/* 에러 메시지 표시 */}
            {error && attemptedSubmit && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-semibold">필수 항목 미입력</span>
                  <br />
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}