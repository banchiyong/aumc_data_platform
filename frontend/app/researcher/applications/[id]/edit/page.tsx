import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import MultiStepEditForm from './MultiStepEditForm'

interface ApplicationEditPageProps {
  params: {
    id: string
  }
}

export default async function ApplicationEditPage({ params }: ApplicationEditPageProps) {
  const response = await api.applications.get(params.id)
  
  if (response.error) {
    redirect('/researcher/applications')
  }

  const application = response.data
  
  // 수정 가능한 상태가 아니면 상세 페이지로 리다이렉트
  if (application.status !== 'DRAFT' && application.status !== 'REVISION_REQUESTED') {
    redirect(`/researcher/applications/${params.id}`)
  }

  // 사용자 정보 가져오기
  const userData = await api.auth.me()
  
  if (!userData.data) {
    redirect('/login')
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/researcher/applications/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">신청서 수정</h1>
      </div>

      {application.status === 'REVISION_REQUESTED' && application.revision_request_reason && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">수정 요청 사유</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{application.revision_request_reason}</p>
          </CardContent>
        </Card>
      )}

      <MultiStepEditForm application={application} userData={userData.data} />
    </div>
  )
}