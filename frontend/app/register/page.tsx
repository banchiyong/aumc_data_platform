'use client'

import { useState } from 'react'
import { registerAction } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { Info, Mail, AlertCircle, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    
    try {
      const result = await registerAction(formData)
      
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err: any) {
      setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>
            아주대학교병원 의료빅데이터센터 데이터 신청 서비스
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-semibold">회원가입 안내</p>
              <ul className="text-sm space-y-1">
                <li>• 아주대학교병원 메일(@aumc.ac.kr)로만 가입 가능합니다</li>
                <li>• 서비스 처리 결과는 가입하신 병원 메일로 발송됩니다</li>
                <li>• 연구 목적 외 사용은 금지되어 있습니다</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                병원 이메일 *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@aumc.ac.kr"
                pattern=".*@aumc\.ac\.kr$"
                title="아주대학교병원 메일(@aumc.ac.kr)을 입력해주세요"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                반드시 @aumc.ac.kr 도메인 이메일을 사용해주세요
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">소속</Label>
              <Input
                id="department"
                name="department"
                type="text"
                placeholder="예: 내과"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">직위</Label>
              <Input
                id="position"
                name="position"
                type="text"
                placeholder="예: 교수, 연구원"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="010-0000-0000"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  회원가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary hover:underline">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}