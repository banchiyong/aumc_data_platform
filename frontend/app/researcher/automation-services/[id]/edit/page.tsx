import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import MultiStepAutomationRequestForm from '../../new/MultiStepAutomationRequestForm'

interface AutomationRequestEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AutomationRequestEditPage({ params }: AutomationRequestEditPageProps) {
  const { id } = await params
  const response = await api.automationRequests.get(id)

  if (response.error || !response.data) {
    redirect('/researcher/automation-services')
  }

  const request = response.data
  if (request.status !== 'DRAFT' && request.status !== 'REVISION_REQUESTED') {
    redirect(`/researcher/automation-services/${id}`)
  }

  const userResponse = await api.auth.me()
  if (!userResponse.data) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/researcher/automation-services/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">자동화 서비스 신청 수정</h1>
      </div>

      {request.revision_request_reason && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">수정 요청 사유</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{request.revision_request_reason}</p>
          </CardContent>
        </Card>
      )}

      <MultiStepAutomationRequestForm
        userData={userResponse.data}
        mode="edit"
        requestId={id}
        initialData={request}
      />
    </div>
  )
}
