'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerAction } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { Info, Mail, AlertCircle, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')

    const emailLocalPart = (formData.get('email_local') as string)?.trim()
    const password = formData.get('password') as string

    if (!emailLocalPart) {
      setError('병원 이메일 사용자명을 입력해주세요.')
      setLoading(false)
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호와 비밀번호 재확인이 일치하지 않습니다.')
      setLoading(false)
      return
    }
    
    try {
      const submitFormData = new FormData()
      submitFormData.append('email', `${emailLocalPart}@aumc.ac.kr`)
      submitFormData.append('password', password)
      submitFormData.append('name', formData.get('name') as string)
      submitFormData.append('department', (formData.get('department') as string) || '')
      submitFormData.append('position', (formData.get('position') as string) || '')
      submitFormData.append('phone', (formData.get('phone') as string) || '')

      const result = await registerAction(submitFormData)
      
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else if (result?.success) {
        router.push('/login?registered=true&approval=pending')
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
            아주대학교병원 데이터 포털 서비스
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-semibold">회원가입 안내</p>
              <ul className="text-sm space-y-1">
                <li>• 아주대학교병원 메일 사용자명으로만 가입 가능합니다</li>
                <li>• 서비스 처리 결과는 가입하신 병원 메일로 발송됩니다</li>
                <li>• 회원가입 후 관리자 승인 완료 시 로그인할 수 있습니다</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email_local" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                병원 이메일 *
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="email_local"
                  name="email_local"
                  type="text"
                  placeholder="아이디"
                  required
                  disabled={loading}
                  className="flex-1 pl-10"
                />
                <span className="text-sm whitespace-nowrap text-gray-600">
                  @aumc.ac.kr
                </span>
              </div>
              <p className="text-xs text-gray-500">
                @aumc.ac.kr 은 제외하고 입력해주세요
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirm">비밀번호 재확인 *</Label>
              <Input
                id="password_confirm"
                name="password_confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">소속</Label>
              <Input
                id="department"
                name="department"
                type="text"
                placeholder="예: 내과"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">직위</Label>
              <Input
                id="position"
                name="position"
                type="text"
                placeholder="예: 교수, 연구원"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="010-0000-0000"
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
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
