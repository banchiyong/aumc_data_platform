import { redirect } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { PortalIntroContent } from '@/components/portal-intro-content'
import { api } from '@/lib/api'

export default async function MainPage() {
  const userResponse = await api.auth.me()

  if (!userResponse.data) {
    redirect('/login')
  }

  const user = userResponse.data

  if (user.role === 'ADMIN') {
    redirect('/admin')
  }

  const noticesResponse = await api.notices.list()
  const notices = noticesResponse.data || []
  const dataServicesResponse = await api.applications.list()
  const automationServicesResponse = await api.automationRequests.list()
  const dataServiceItems = (dataServicesResponse.data || []).slice(0, 4)
  const automationServiceItems = (automationServicesResponse.data || []).slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole={user.role} userName={user.name} />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <PortalIntroContent
          userRole="RESEARCHER"
          notices={notices}
          dataServiceItems={dataServiceItems}
          automationServiceItems={automationServiceItems}
        />
      </main>
    </div>
  )
}
