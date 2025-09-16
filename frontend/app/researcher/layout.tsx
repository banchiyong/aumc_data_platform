import { Navigation } from '@/components/navigation'
import { api } from '@/lib/api'
import { redirect } from 'next/navigation'

export default async function ResearcherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userResponse = await api.auth.me()
  
  if (!userResponse.data) {
    redirect('/login')
  }
  
  const user = userResponse.data
  
  if (user.role === 'ADMIN') {
    redirect('/admin')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole={user.role} userName={user.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}