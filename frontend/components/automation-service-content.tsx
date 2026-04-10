import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Bot, LucidePenLine, MessageSquareMore, Workflow } from 'lucide-react'

interface AutomationServiceContentProps {
  userRole: 'RESEARCHER' | 'ADMIN'
}

export function AutomationServiceContent({ userRole }: AutomationServiceContentProps) {
  const requestHref = userRole === 'ADMIN' ? '/admin/automation-services/manage' : '/researcher/automation-services/new'

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[12px] border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Automation Service Guide</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            자동화 서비스 안내
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
            <p>
              자동화 서비스는 의료빅데이터센터 운영 과정에서 반복적으로 수행되는 업무를 표준화하고,
              요청 접수부터 검토와 후속 지원까지의 절차를 보다 효율적으로 운영하기 위한 지원 서비스입니다.
            </p>
            <p>
              현재는 서식지 초안 생성, 루틴 업무 자동화, 상담 요청 접수 등을 중심으로 서비스 범위를 정의하고 있으며,
              향후 운영 수요에 맞추어 적용 범위를 단계적으로 확장할 예정입니다.
            </p>
          </div>
          <div className="mt-8">
            <Link href={requestHref}>
              <Button>
                자동화 서비스 신청
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-100/80 p-5 text-slate-500 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Image Space</p>
          <div className="mt-4 flex min-h-[300px] items-center justify-center rounded-[8px] border border-dashed border-slate-300 bg-white/70 text-center text-sm leading-6">
            자동화 서비스 개념도,
            <br />
            업무 흐름 예시,
            <br />
            서비스 소개 이미지가 들어갈 영역
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[9px]">
          <CardHeader>
            <LucidePenLine className="h-6 w-6 text-blue-700" />
            <CardTitle className="mt-3">서식지 초안 생성</CardTitle>
            <CardDescription>반복 작성이 필요한 문서 초안을 빠르게 준비합니다.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-gray-600">
            신청서, 검토서, 내부 협의 문서 등 정형화된 문서의 초안 생성을 지원하여 초기 작성 시간을 줄이는 것을 목표로 합니다.
          </CardContent>
        </Card>

        <Card className="rounded-[9px]">
          <CardHeader>
            <Workflow className="h-6 w-6 text-emerald-700" />
            <CardTitle className="mt-3">루틴 업무 자동화</CardTitle>
            <CardDescription>상태 확인, 자료 정리, 반복 입력 업무를 체계화합니다.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-gray-600">
            반복 조회, 정리, 전달, 상태 추적이 필요한 업무를 자동화 후보로 정의하고 운영 과정에 맞는 절차를 설계합니다.
          </CardContent>
        </Card>

        <Card className="rounded-[9px]">
          <CardHeader>
            <MessageSquareMore className="h-6 w-6 text-amber-700" />
            <CardTitle className="mt-3">상담 요청</CardTitle>
            <CardDescription>업무 개선과 자동화 수요를 상담 형태로 접수합니다.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-gray-600">
            현업에서 반복되는 작업, 개선이 필요한 운영 절차, 자동화 요청 사항을 정리하여 상담 요청 형태로 접수할 수 있도록 안내합니다.
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[10px]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 p-2">
              <Bot className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <CardTitle>운영 방향</CardTitle>
              <CardDescription>자동화 서비스는 운영 효율과 지원 품질 개선을 목적으로 합니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-slate-600">
          자동화 서비스는 단순한 기능 추가보다 실제 운영 과정에서 반복적으로 발생하는 업무를 정리하고,
          실무자가 체감할 수 있는 개선 효과를 우선순위로 두고 설계하는 것을 기본 원칙으로 합니다.
        </CardContent>
      </Card>
    </div>
  )
}
