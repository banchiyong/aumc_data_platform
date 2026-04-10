export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              AUMC Medical Bigdata Center
            </p>
            <h2 className="text-lg font-semibold text-slate-900">아주대학교병원 의료빅데이터센터</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              데이터 서비스, 자동화 서비스, 연구 지원 운영을 위한 통합 포털입니다.
              연구 수행과 서비스 운영에 필요한 절차를 일관된 기준으로 제공합니다.
            </p>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">서비스 범위</span>
              <br />
              데이터 서비스 신청, 자동화 서비스 신청, 운영 지원
            </p>
            <p>
              <span className="font-semibold text-slate-900">개발</span>
              <br />
              메디움스
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
          © {currentYear} 아주대학교병원 의료빅데이터센터. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
