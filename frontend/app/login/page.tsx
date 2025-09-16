'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Loader2, Mail, Lock } from 'lucide-react'
import { loginAction } from '@/lib/actions'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  useEffect(() => {
    // 회원가입 성공 후 리다이렉트된 경우
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('회원가입이 완료되었습니다. 로그인해주세요.')
    }
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    
    try {
      // 사용자명에 @aumc.ac.kr 자동 추가
      const username = formData.get('username') as string
      const email = `${username}@aumc.ac.kr`
      
      // 새로운 FormData 생성
      const newFormData = new FormData()
      newFormData.append('email', email)
      newFormData.append('password', formData.get('password') as string)
      
      const result = await loginAction(newFormData)
      
      // loginAction이 에러를 throw하지 않고 리턴한 경우 처리
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
      // 성공시 리다이렉트는 loginAction에서 처리됨
    } catch (err: any) {
      // 네트워크 오류 등 예외 처리
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>
            아주대학교병원 의료빅데이터센터 데이터 포털
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                사용자명
              </Label>
              <div className="flex">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="사용자명"
                  required
                  disabled={loading}
                  className="rounded-r-none"
                />
                <div className="flex items-center px-3 bg-gray-100 border border-l-0 rounded-r-md text-gray-600">
                  @aumc.ac.kr
                </div>
              </div>
              <p className="text-xs text-gray-500">
                아주대학교병원 메일의 @ 앞 부분만 입력하세요
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                비밀번호
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
                className="pl-10"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-2">
            <div className="text-center text-sm">
              계정이 없으신가요?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                회원가입
              </Link>
            </div>
            
            <div className="text-center">
              <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-primary">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="text-xs text-gray-500 space-y-1">
              <p>• 병원 메일 계정으로만 로그인 가능합니다</p>
              <p>• 5회 이상 로그인 실패 시 계정이 잠길 수 있습니다</p>
              <p>• 문의: 의료빅데이터센터 (내선 0000)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}