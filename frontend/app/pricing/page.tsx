import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PricingCalculator } from './pricing-calculator'
import { Calculator, Info, FileText, Database, Settings, Tag } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { api } from '@/lib/api'

export default async function PricingPage() {
  const userResponse = await api.auth.me()
  const user = userResponse.data
  
  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation userRole={user.role} userName={user.name} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            서비스 이용요금 안내
          </h1>
          <p className="text-xl text-gray-600">
            아주대학교병원 의료빅데이터센터 데이터 추출·가공 서비스 요금체계
          </p>
        </div>

        {/* 서비스 요금표 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              서비스별 기본료 및 추가비용
            </CardTitle>
            <CardDescription>
              모든 금액은 부가세 별도입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4">서비스 분류</th>
                    <th className="text-left py-3 px-4">서비스명</th>
                    <th className="text-right py-3 px-4">기본료</th>
                    <th className="text-left py-3 px-4">추가비용 (과금 기준)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        데이터 추출
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      단순 추출<sup>1</sup>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      300,000원
                    </td>
                    <td className="py-3 px-4">
                      용량 기준<sup>2</sup>: 1MB당 1,000원 (500MB 초과분부터 과금)
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        데이터 추출
                      </div>
                    </td>
                    <td className="py-3 px-4">서식지 추출</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      500,000원
                    </td>
                    <td className="py-3 px-4">
                      용량 기준<sup>2</sup>: 1MB당 1,000원 (500MB 초과분부터 과금)
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-green-600" />
                        데이터 가공
                      </div>
                    </td>
                    <td className="py-3 px-4">정형 전처리</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      400,000원
                    </td>
                    <td className="py-3 px-4">
                      시간 기준<sup>3</sup>: 시간당 30,000원
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-green-600" />
                        데이터 가공
                      </div>
                    </td>
                    <td className="py-3 px-4">비정형 전처리</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      700,000원
                    </td>
                    <td className="py-3 px-4">
                      시간 기준<sup>3</sup>: 시간당 30,000원
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>표기 단위: 용량(Mega Byte), 시간(Hour)</p>
            </div>
          </CardContent>
        </Card>

        {/* 사용료 계산식 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                데이터 추출 서비스료 계산식
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-mono text-sm">
                  서비스료 = 기본료(500MB까지) + 추가비용
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ※ 500MB 초과분에 한해 1MB당 1,000원
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">예시: 700MB 단순 추출</span>
                  <span className="font-semibold">500,000원</span>
                </div>
                <div className="text-xs text-gray-500">
                  = 300,000원(기본) + 200,000원(200MB × 1,000원)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                데이터 가공 서비스료 계산식
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-mono text-sm">
                  서비스료 = 기본료(정형/비정형) + 추가비용
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ※ 추가 요청이 있을 시, 시간당 30,000원
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">예시: 정형 전처리 + 3시간 추가</span>
                  <span className="font-semibold">490,000원</span>
                </div>
                <div className="text-xs text-gray-500">
                  = 400,000원(기본) + 90,000원(3시간 × 30,000원)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사용료 감면 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Tag className="h-5 w-5" />
              사용료 감면(할인) 안내
            </CardTitle>
            <CardDescription>
              다음 조건에 해당하는 경우 기본료 50% 감면 (중복감면 불가)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h3 className="font-semibold">신진 연구자</h3>
                </div>
                <p className="text-sm text-gray-700">
                  책임연구자 기준 임용 후 2년 이내
                </p>
                <p className="text-xs text-green-700 mt-2 font-semibold">
                  기본료 50% 감면
                </p>
              </div>
              
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h3 className="font-semibold">연구비 없음</h3>
                </div>
                <p className="text-sm text-gray-700">
                  연구비 재원이 없는 경우
                </p>
                <p className="text-xs text-green-700 mt-2 font-semibold">
                  기본료 50% 감면
                </p>
              </div>
              
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h3 className="font-semibold">환자번호 확정</h3>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>데이터 추출</strong> 서비스이며 연구대상 환자번호가 확정된 경우
                </p>
                <p className="text-xs text-green-700 mt-2 font-semibold">
                  기본료 50% 감면
                </p>
                <p className="text-xs text-orange-600 mt-1 font-medium">
                  ※ 데이터 가공 서비스에는 적용되지 않음
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <Info className="h-4 w-4" />
                <strong>주의:</strong> 중복감면 불가 (최대 50% 감면)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 비고/주석 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              비고 및 참고사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-sm font-semibold text-gray-700 min-w-[20px]">1.</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">단순 추출 대상</p>
                  <p className="text-sm text-gray-600">
                    진단이력, 약처방, 수술, 일부 검체 검사(Routine Chemistry, 감수성검사 등)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-sm font-semibold text-gray-700 min-w-[20px]">2.</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">용량 기준</p>
                  <p className="text-sm text-gray-600">
                    압축 전 기준 500MB 이하는 추가비용 없음, 초과 시 MB당 1,000원
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    ※ 참고: 서울대병원 기준은 300MB (500MB 기준 20만원 저렴한 요금제)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-sm font-semibold text-gray-700 min-w-[20px]">3.</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">가공 추가비용 기준</p>
                  <p className="text-sm text-gray-600">
                    기본 논의된 내용 범위에서는 추가금액 없음, 추가요청사항 기준으로 과금
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 요금 계산기 */}
        <PricingCalculator />
      </div>
    </div>
  )
}