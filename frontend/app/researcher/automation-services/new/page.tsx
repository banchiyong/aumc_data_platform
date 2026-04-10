import { redirect } from 'next/navigation'
import { api } from '@/lib/api'
import MultiStepAutomationRequestForm from './MultiStepAutomationRequestForm'

export default async function NewAutomationRequestPage() {
  const userResponse = await api.auth.me()

  if (!userResponse.data) {
    redirect('/login')
  }

  const user = userResponse.data

  if (user.role === 'ADMIN') {
    redirect('/admin/automation-services')
  }

  return <MultiStepAutomationRequestForm userData={user} />
}
