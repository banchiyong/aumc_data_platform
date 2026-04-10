import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import NoticeCard from '@/components/NoticeCard'

interface PortalIntroContentProps {
  userRole: 'RESEARCHER' | 'ADMIN'
  notices?: any[]
  dataServiceItems?: any[]
  automationServiceItems?: any[]
}

function getDataServiceStatusLabel(status: string) {
  const labels: Record<string, string> = {
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

function getDataServiceStatusClassName(status: string) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    REVISION_REQUESTED: 'bg-orange-100 text-orange-700',
    PROCESSING: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-indigo-100 text-indigo-700',
  }
  return styles[status] || 'bg-slate-100 text-slate-700'
}

function getAutomationServiceStatusLabel(status: string) {
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

function getAutomationServiceStatusClassName(status: string) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    REVISION_REQUESTED: 'bg-orange-100 text-orange-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-indigo-100 text-indigo-700',
  }
  return styles[status] || 'bg-slate-100 text-slate-700'
}

function getAutomationServiceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    FORM_DRAFT: '서식지 초안 생성',
    ROUTINE_AUTOMATION: '루틴 업무 자동화',
    CONSULTING: '상담 요청',
  }
  return labels[type] || type
}

export function PortalIntroContent({
  userRole,
  notices = [],
  dataServiceItems = [],
  automationServiceItems = [],
}: PortalIntroContentProps) {
  const automationHref = userRole === 'ADMIN' ? '/admin/automation-services/manage' : '/researcher/automation-services/new'
  const dataServiceHref = userRole === 'ADMIN' ? '/admin/applications' : '/researcher/applications/new'

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[16px] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-5 py-7 text-white shadow-lg sm:px-8 sm:py-10">
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            아주대학교병원
            <br />
            데이터 포털 안내
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
            데이터 포털은 아주대학교병원 의료빅데이터센터의 데이터 서비스와 자동화 서비스 운영 절차를
            일관된 흐름으로 제공하기 위한 업무 시스템입니다.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={dataServiceHref}>
              <Button className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100">
                {userRole === 'ADMIN' ? '데이터 서비스 관리' : '데이터 서비스 신청'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={automationHref}>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 sm:w-auto">
                자동화 서비스 신청
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">공지사항</p>
            </div>
            <NoticeCard notices={notices} embedded />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[12px]">
          <CardHeader>
            <CardTitle>기술지원</CardTitle>
            <CardDescription>데이터 활용 연구와 과제 수행을 위한 지원 항목을 제공합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6 text-gray-600">
            <p>데이터 기반 연구, 국가 과제, 기관 협력 과제, 업체 용역 수행 과정에서 필요한 실무 지원과 협업 절차를 안내합니다.</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>연구 설계 단계의 데이터 활용 상담</li>
              <li>과제 수행에 필요한 데이터 서비스 연계</li>
              <li>운영 절차 및 제출 서류 관련 실무 지원</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardHeader>
            <CardTitle>데이터 서비스</CardTitle>
            <CardDescription>데이터 탐색부터 신청, 검토, 제공까지의 절차를 제공합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6 text-gray-600">
            <p>데이터 카탈로그 조회, 데이터 서비스 신청, 신청 상태 확인, 첨부자료 관리, 결과 제공 절차를 체계적으로 제공합니다.</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>정형 추출, 비정형 추출, 가명화, 타기관 결합 신청</li>
              <li>IRB 통지서 및 연구계획서 기반 검토 프로세스</li>
              <li>신청 진행 상태와 결과물 제공 이력 관리</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardHeader>
            <CardTitle>자동화 서비스</CardTitle>
            <CardDescription>반복 업무 지원과 운영 효율화를 위한 서비스를 제공합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6 text-gray-600">
            <p>서식지 초안 생성, 루틴 업무 자동화, 상담 요청 접수 등 운영 지원 기능을 단계적으로 확장할 수 있도록 구성합니다.</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>서식지 및 내부 문서 초안 생성 요청</li>
              <li>반복 업무 자동화 아이디어와 기능 요구 접수</li>
              <li>ROI, 기존 투입 인력, 업무 빈도 기반 검토</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[12px]">
          <CardHeader>
            <CardTitle>최근 데이터 서비스</CardTitle>
          </CardHeader>
          <CardContent>
            {dataServiceItems.length === 0 ? (
              <p className="text-sm text-gray-500">표시할 데이터 서비스가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {dataServiceItems.map((item) => (
                  <div key={item.id} className="rounded-lg bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.project_name}</p>
                      </div>
                      <span className={`inline-flex w-20 justify-center items-center rounded-full px-2 py-1 text-xs font-medium ${getDataServiceStatusClassName(item.status)}`}>
                        {getDataServiceStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardHeader>
            <CardTitle>최근 자동화 서비스</CardTitle>
          </CardHeader>
          <CardContent>
            {automationServiceItems.length === 0 ? (
              <p className="text-sm text-gray-500">표시할 자동화 서비스가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {automationServiceItems.map((item) => (
                  <div key={item.id} className="rounded-lg bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                      </div>
                      <span className={`inline-flex w-20 justify-center items-center rounded-full px-2 py-1 text-xs font-medium ${getAutomationServiceStatusClassName(item.status)}`}>
                        {getAutomationServiceStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
