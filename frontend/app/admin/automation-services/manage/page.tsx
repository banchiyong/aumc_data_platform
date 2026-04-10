import AdminAutomationServicesTable from '../AdminAutomationServicesTable'
import { api } from '@/lib/api'

export default async function AdminAutomationServicesManagePage() {
  const response = await api.automationRequests.list()
  const requests = response.data || []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">자동화 서비스 신청 관리</h1>
      <AdminAutomationServicesTable requests={requests} />
    </div>
  )
}
