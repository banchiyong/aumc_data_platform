import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Check if user is logged in
  const userResponse = await api.auth.me()
  if (userResponse.data) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = userResponse.data.role === 'ADMIN' ? '/admin' : '/researcher'
    redirect(redirectPath)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          아주대학교병원 의료빅데이터센터
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          연구용 데이터 추출·가공 서비스 신청 및 관리 시스템
        </p>
        
        <div className="space-y-4 mb-12">
          <p className="text-gray-700">
            임상 및 의료 빅데이터를 활용한 연구를 위해 데이터 추출·가공을 신청하고,
            안전하게 데이터를 제공받을 수 있는 플랫폼입니다.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-900 mb-2">서비스 이용 안내</p>
            <ul className="text-blue-800 space-y-1">
              <li>• 아주대학교병원 연구자 전용 서비스입니다</li>
              <li>• 병원 메일(@aumc.ac.kr)로 회원가입이 가능합니다</li>
              <li>• 서비스 처리 결과는 병원 메일로 안내됩니다</li>
            </ul>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">로그인</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">회원가입</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}