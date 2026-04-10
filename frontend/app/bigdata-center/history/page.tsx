import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

const historyItems = [
  {
    year: '2021',
    title: '센터 운영 기반 정비',
    description: '의료 데이터 연구 지원 체계와 운영 프로세스 정비를 시작하고 데이터 요청 흐름을 표준화했습니다.',
  },
  {
    year: '2022',
    title: '데이터 서비스 범위 확대',
    description: '진단, 처방, 검사, 수술, 병리 등 연구 수요가 높은 데이터 영역을 중심으로 제공 범위를 넓혔습니다.',
  },
  {
    year: '2023',
    title: '연구 지원 포털 고도화',
    description: '신청, 검토, 승인, 다운로드 흐름을 포털 기반으로 재구성하고 이력 관리를 체계화했습니다.',
  },
  {
    year: '2024',
    title: '운영 자동화 준비',
    description: '상태 통계, 사용자 관리, 첨부파일 추적 등 반복 업무를 줄이기 위한 자동화 기반을 확장했습니다.',
  },
  {
    year: '2025',
    title: '통합 데이터 포털 전환',
    description: '빅데이터센터 소개, 데이터 서비스, 업무 자동화 서비스를 하나의 포털 정보구조로 통합하는 작업을 진행했습니다.',
  },
]

export default async function BigDataCenterHistoryPage() {
  const userResponse = await api.auth.me()
  const user = userResponse.data

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation userRole={user.role} userName={user.name} />}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Card className="rounded-[14px]">
              <CardHeader>
                <CardTitle className="text-3xl">빅데이터센터 연혁</CardTitle>
                <CardDescription>
                  데이터 서비스 체계와 운영 포털이 확장되어 온 과정을 임시 내용으로 정리했습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {historyItems.map((item) => (
                  <div key={item.year} className="grid gap-3 border-b border-gray-100 pb-5 last:border-b-0 last:pb-0 md:grid-cols-[100px_minmax(0,1fr)]">
                    <div className="text-sm font-semibold text-blue-700">{item.year}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-100/80 p-5 text-slate-500 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Image Space</p>
              <div className="mt-4 flex min-h-[320px] items-center justify-center rounded-[10px] border border-dashed border-slate-300 bg-white/70 text-center text-sm leading-6">
                연혁 대표 이미지,
                <br />
                타임라인 인포그래픽,
                <br />
                주요 성과 비주얼이 들어갈 영역
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
