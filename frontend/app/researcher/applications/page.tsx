import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import Link from 'next/link'
import { Search, Filter, ArrowUpDown } from 'lucide-react'
import ApplicationsTable from './ApplicationsTable'

export default async function ApplicationsListPage() {
  const response = await api.applications.list()
  const applications = response.data || []
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">내 신청 목록</h1>
        <Link href="/researcher/applications/new">
          <Button>새 신청서 작성</Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>신청 내역</CardTitle>
          <CardDescription>
            데이터 추출·가공 서비스 신청 내역을 확인하고 관리할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationsTable applications={applications} />
        </CardContent>
      </Card>
    </div>
  )
}