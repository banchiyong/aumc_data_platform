import { PortalIntroContent } from '@/components/portal-intro-content'
import { api } from '@/lib/api'

export default async function AdminHomePage() {
  const noticesResponse = await api.notices.list()
  const notices = noticesResponse.data || []
  const dataServicesResponse = await api.applications.list()
  const automationServicesResponse = await api.automationRequests.list()
  const dataServiceItems = (dataServicesResponse.data || []).slice(0, 4)
  const automationServiceItems = (automationServicesResponse.data || []).slice(0, 4)

  return (
    <PortalIntroContent
      userRole="ADMIN"
      notices={notices}
      dataServiceItems={dataServiceItems}
      automationServiceItems={automationServiceItems}
    />
  )
}
