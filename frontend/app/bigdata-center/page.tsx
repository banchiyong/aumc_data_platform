import { Navigation } from '@/components/navigation'
import { BigDataCenterContent } from '@/components/bigdata-center-content'
import { api } from '@/lib/api'

export default async function BigDataCenterPage() {
  const userResponse = await api.auth.me()
  const user = userResponse.data

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation userRole={user.role} userName={user.name} />}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <BigDataCenterContent />
      </main>
    </div>
  )
}
