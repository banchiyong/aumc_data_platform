import { api } from '@/lib/api'
import AdminApplicationsTable from './AdminApplicationsTable'

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: { status?: string; includeDeleted?: string }
}) {
  const includeDeleted = searchParams.includeDeleted === 'true'
  const response = await api.applications.list({ include_deleted: includeDeleted })
  const applications = response.data || []
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">신청 관리</h1>
      
      <AdminApplicationsTable 
        applications={applications} 
        initialStatus={searchParams.status || ''}
        initialIncludeDeleted={includeDeleted}
      />
    </div>
  )
}