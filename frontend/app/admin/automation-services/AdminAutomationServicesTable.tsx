'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react'

interface AutomationRequest {
  id: string
  title: string
  requester_name: string
  requester_department: string
  service_type: string
  status: string
  created_at: string
  current_manpower_count: number
  current_execution_frequency: number
  current_time_minutes: number
  roi_amount_with_dev?: number | null
  roi_amount_without_dev?: number | null
}

type SortField =
  | 'title'
  | 'requester_name'
  | 'status'
  | 'created_at'
  | 'roi_amount_with_dev'
  | 'roi_amount_without_dev'
type SortDirection = 'asc' | 'desc'

const statusOptions = [
  { value: 'ALL', label: '전체' },
  { value: 'SUBMITTED', label: '제출됨' },
  { value: 'UNDER_REVIEW', label: '검토 중' },
  { value: 'APPROVED', label: '승인됨' },
  { value: 'REJECTED', label: '반려됨' },
  { value: 'REVISION_REQUESTED', label: '수정 요청' },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'COMPLETED', label: '완료' },
]

function getServiceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    FORM_DRAFT: '서식지 초안 생성',
    ROUTINE_AUTOMATION: '루틴 업무 자동화',
    CONSULTING: '상담 요청',
  }
  return labels[type] || type
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: '작성 중',
    SUBMITTED: '제출됨',
    UNDER_REVIEW: '검토 중',
    APPROVED: '승인됨',
    REJECTED: '반려됨',
    REVISION_REQUESTED: '수정 요청',
    IN_PROGRESS: '진행 중',
    COMPLETED: '완료',
  }
  return labels[status] || status
}

export default function AdminAutomationServicesTable({ requests }: { requests: AutomationRequest[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (statusFilter !== 'ALL' && request.status !== statusFilter) return false

      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return (
        request.title.toLowerCase().includes(term) ||
        request.requester_name.toLowerCase().includes(term) ||
        request.requester_department?.toLowerCase().includes(term) ||
        getServiceTypeLabel(request.service_type).toLowerCase().includes(term)
      )
    })
  }, [requests, searchTerm, statusFilter])

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      if (sortField === 'created_at') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredRequests, sortField, sortDirection])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / itemsPerPage))
  const paginatedRequests = sortedRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h2 className="font-semibold">검색 및 필터</h2>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="요청 제목, 신청자명, 소속, 서비스 유형으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('ALL')
              setSortField('created_at')
              setSortDirection('desc')
            }}
          >
            초기화
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">전체 {requests.length}건 중 {sortedRequests.length}건 표시</p>
        <p className="text-sm text-gray-600">{currentPage} / {totalPages} 페이지</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {sortedRequests.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            검색 조건에 맞는 자동화 서비스 신청이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">
                    <button className="flex items-center gap-1 hover:text-blue-600" onClick={() => handleSort('title')}>
                      요청 제목 {getSortIcon('title')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button className="flex items-center gap-1 hover:text-blue-600" onClick={() => handleSort('requester_name')}>
                      신청자 {getSortIcon('requester_name')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button className="flex items-center gap-1 hover:text-blue-600" onClick={() => handleSort('roi_amount_with_dev')}>
                      ROI 금액(포함) {getSortIcon('roi_amount_with_dev')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button className="flex items-center gap-1 hover:text-blue-600" onClick={() => handleSort('roi_amount_without_dev')}>
                      ROI 금액(제외) {getSortIcon('roi_amount_without_dev')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button className="flex items-center gap-1 hover:text-blue-600" onClick={() => handleSort('status')}>
                      상태 {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button className="flex items-center gap-1 hover:text-blue-600" onClick={() => handleSort('created_at')}>
                      신청일 {getSortIcon('created_at')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">작업</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/automation-services/${request.id}`} className="font-medium text-blue-700 hover:underline">
                        {request.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>{request.requester_name}</div>
                      <div className="text-xs text-gray-500">{request.requester_department}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {request.roi_amount_with_dev !== null && request.roi_amount_with_dev !== undefined
                        ? `${Number(request.roi_amount_with_dev).toLocaleString('ko-KR')}만원`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {request.roi_amount_without_dev !== null && request.roi_amount_without_dev !== undefined
                        ? `${Number(request.roi_amount_without_dev).toLocaleString('ko-KR')}만원`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(request.created_at).toLocaleDateString('ko-KR')}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/automation-services/${request.id}`}>
                        <Button size="sm" variant="outline">검토</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {sortedRequests.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
            이전
          </Button>
          <span className="text-sm text-gray-600">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
            다음
          </Button>
        </div>
      )}
    </div>
  )
}
