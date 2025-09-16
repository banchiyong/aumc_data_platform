'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

type SortField = 'project_name' | 'irb_number' | 'status' | 'submitted_at' | 'created_at'
type SortDirection = 'asc' | 'desc'

interface Application {
  id: string
  project_name: string
  irb_number: string
  status: string
  submitted_at: string | null
  created_at: string
  reviewed_at: string | null
  completed_at: string | null
  rejected_at: string | null
  principal_investigator?: string
  pi_department?: string
}

interface ApplicationsTableProps {
  applications: Application[]
}

export default function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications.filter(app => {
      const matchesSearch = searchQuery === '' || 
        app.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.irb_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.principal_investigator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.pi_department?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // 정렬
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // 날짜 필드 처리
      if (sortField === 'submitted_at' || sortField === 'created_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [applications, searchQuery, statusFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />
  }

  const statusOptions = [
    { value: 'all', label: '모든 상태' },
    { value: 'DRAFT', label: '작성 중' },
    { value: 'SUBMITTED', label: '제출됨' },
    { value: 'UNDER_REVIEW', label: '검토 중' },
    { value: 'APPROVED', label: '승인됨' },
    { value: 'REJECTED', label: '반려됨' },
    { value: 'REVISION_REQUESTED', label: '수정 요청' },
    { value: 'PROCESSING', label: '처리 중' },
    { value: 'COMPLETED', label: '완료' },
  ]

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="프로젝트명, IRB 번호, 책임연구자, 책임자 소속으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 결과 통계 */}
      <div className="text-sm text-gray-600">
        총 {applications.length}건 중 {filteredAndSortedApplications.length}건 표시
      </div>

      {/* 테이블 */}
      {filteredAndSortedApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {applications.length === 0 
              ? '아직 신청 내역이 없습니다' 
              : '검색 조건에 맞는 신청서가 없습니다'
            }
          </p>
          {applications.length === 0 && (
            <Link href="/researcher/applications/new">
              <Button>첫 신청서 작성하기</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('project_name')}
                    className="flex items-center hover:text-blue-600 font-medium"
                  >
                    프로젝트명
                    {getSortIcon('project_name')}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('irb_number')}
                    className="flex items-center hover:text-blue-600 font-medium"
                  >
                    IRB 번호
                    {getSortIcon('irb_number')}
                  </button>
                </th>
                <th className="text-left py-3 px-4">책임자</th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-blue-600 font-medium"
                  >
                    상태
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('submitted_at')}
                    className="flex items-center hover:text-blue-600 font-medium"
                  >
                    제출일
                    {getSortIcon('submitted_at')}
                  </button>
                </th>
                <th className="text-left py-3 px-4">완료/반려일</th>
                <th className="text-left py-3 px-4">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedApplications.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link
                      href={`/researcher/applications/${app.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {app.project_name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{app.irb_number || '-'}</td>
                  <td className="py-3 px-4">
                    {app.principal_investigator ? (
                      <div>
                        <div>{app.principal_investigator}</div>
                        {app.pi_department && (
                          <div className="text-xs text-gray-500 mt-1">
                            ({app.pi_department})
                          </div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-3 px-4">
                    {app.submitted_at
                      ? new Date(app.submitted_at).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {app.status === 'COMPLETED' && app.completed_at
                      ? new Date(app.completed_at).toLocaleDateString('ko-KR')
                      : app.status === 'REJECTED' && app.rejected_at
                      ? new Date(app.rejected_at).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/researcher/applications/${app.id}`}>
                      <Button size="sm" variant="outline">
                        상세보기
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    DRAFT: { label: '작성 중', className: 'bg-gray-100 text-gray-800' },
    SUBMITTED: { label: '제출됨', className: 'bg-blue-100 text-blue-800' },
    UNDER_REVIEW: { label: '검토 중', className: 'bg-yellow-100 text-yellow-800' },
    APPROVED: { label: '승인됨', className: 'bg-green-100 text-green-800' },
    REJECTED: { label: '반려됨', className: 'bg-red-100 text-red-800' },
    REVISION_REQUESTED: { label: '수정 요청', className: 'bg-orange-100 text-orange-800' },
    PROCESSING: { label: '처리 중', className: 'bg-purple-100 text-purple-800' },
    COMPLETED: { label: '완료', className: 'bg-indigo-100 text-indigo-800' },
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}