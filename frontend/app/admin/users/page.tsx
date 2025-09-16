import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { UserTable } from './user-table'

export default async function AdminUsersPage() {
  const response = await api.admin.users.list()
  const users = response.data || []
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>
            시스템에 등록된 모든 사용자를 관리합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center py-12 text-gray-500">
              등록된 사용자가 없습니다
            </p>
          ) : (
            <UserTable users={users} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}