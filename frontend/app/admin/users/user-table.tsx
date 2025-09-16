'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserEditDialog } from '@/components/user-edit-dialog'
import { updateUserAction, toggleUserActiveAction } from '@/lib/actions'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  department?: string
  position?: string
  phone?: string
  role: string
  is_active: boolean
  created_at: string
}

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleUpdate = async (userId: string, data: any) => {
    await updateUserAction(userId, data)
    router.refresh()
  }

  const handleToggleActive = async (userId: string) => {
    setIsLoading(userId)
    try {
      await toggleUserActiveAction(userId)
      router.refresh()
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">이름</th>
            <th className="text-left py-3 px-4">이메일</th>
            <th className="text-left py-3 px-4">소속</th>
            <th className="text-left py-3 px-4">역할</th>
            <th className="text-left py-3 px-4">상태</th>
            <th className="text-left py-3 px-4">가입일</th>
            <th className="text-left py-3 px-4">작업</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{user.name}</td>
              <td className="py-3 px-4">{user.email}</td>
              <td className="py-3 px-4">{user.department || '-'}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'ADMIN' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'ADMIN' ? '관리자' : '연구자'}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? '활성' : '비활성'}
                </span>
              </td>
              <td className="py-3 px-4">
                {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <UserEditDialog user={user} onUpdate={handleUpdate} />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleToggleActive(user.id)}
                    disabled={isLoading === user.id}
                  >
                    {isLoading === user.id 
                      ? '처리 중...' 
                      : (user.is_active ? '비활성화' : '활성화')}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}