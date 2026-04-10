import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Building2, Clock3, Network } from 'lucide-react'

export function BigDataCenterContent() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[14px] border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">AUMC Big Data Center</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            아주대학교병원
            <br />
            의료빅데이터센터 소개
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
            <p>
              아주대학교병원 의료빅데이터센터는 병원 내 데이터 자원을 연구와 운영에 활용할 수 있도록 관련 절차와 지원 체계를 정비하는 역할을 수행합니다.
            </p>
            <p>
              센터는 데이터 자산의 구조를 정리하고, 연구 목적에 맞는 활용 절차를 설계하며, 요청 접수부터 검토, 처리, 제공까지의 흐름을
              일관된 기준에 따라 운영하는 것을 목표로 합니다.
            </p>
            <p>
              또한 연구 지원 실무와 운영 고도화를 병행하여 데이터 기반 연구, 각종 과제 수행, 서비스 운영에 필요한 지원 역량을 지속적으로 확장하고 있습니다.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/bigdata-center/history">
              <Button className="w-full sm:w-auto">
                연혁 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/data-catalog">
              <Button variant="outline" className="w-full sm:w-auto">
                제공 데이터 살펴보기
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-100/80 p-5 text-slate-500 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Image Space</p>
          <div className="mt-4 flex min-h-[320px] items-center justify-center rounded-[10px] border border-dashed border-slate-300 bg-white/70 text-center text-sm leading-6">
            센터 소개 대표 이미지,
            <br />
            조직도 또는 주요 지원 기능
            <br />
            안내 비주얼이 배치될 영역
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[12px]">
          <CardHeader>
            <Building2 className="h-6 w-6 text-blue-700" />
            <CardTitle className="mt-3">센터 역할</CardTitle>
            <CardDescription>데이터 서비스 운영의 기준과 접점을 정리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-gray-600">
            데이터 요청 접수, 서비스 범위 검토, 전달 체계 정리, 운영 기준 수립 등 센터 운영의 기본 역할을 담당합니다.
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardHeader>
            <Network className="h-6 w-6 text-violet-700" />
            <CardTitle className="mt-3">연구 지원</CardTitle>
            <CardDescription>데이터 기반 연구 수행을 위한 실무 협업을 지원합니다.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-gray-600">
            진단, 처방, 검사, 수술, 병리 등 주요 데이터 자산을 카탈로그 기반으로 정리하고 연구 과제 수행에 필요한 활용 절차를 지원합니다.
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardHeader>
            <Clock3 className="h-6 w-6 text-amber-700" />
            <CardTitle className="mt-3">운영 고도화</CardTitle>
            <CardDescription>반복 업무를 줄이고 운영 효율을 높이는 방향으로 개선합니다.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-gray-600">
            신청 현황, 처리 시간, 서비스 수요를 바탕으로 운영 절차를 고도화하고 자동화 서비스 확장을 위한 기반을 마련합니다.
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
