'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Trash2 } from 'lucide-react'

interface Application {
  id: string
  project_name: string
  applicant_name: string
  irb_number: string
  status: string
  submitted_at: string
  created_at: string
  reviewed_at?: string
  completed_at?: string
  rejected_at?: string
  deleted_at?: string
  deleted_by?: string
  deletion_reason?: string
  is_deleted?: boolean
  applicant_department?: string
  principal_investigator?: string
  pi_department?: string
}

interface AdminApplicationsTableProps {
  applications: Application[]
  initialStatus?: string
  initialIncludeDeleted?: boolean
}

type SortField = 'project_name' | 'applicant_name' | 'submitted_at' | 'status'
type SortDirection = 'asc' | 'desc'

const statusOptions = [
  { value: 'ALL', label: '전체' },
  { value: 'SUBMITTED', label: '제출됨' },
  { value: 'UNDER_REVIEW', label: '검토 중' },
  { value: 'APPROVED', label: '승인됨' },
  { value: 'REJECTED', label: '반려됨' },
  { value: 'REVISION_REQUESTED', label: '수정 요청' },
  { value: 'PROCESSING', label: '처리 중' },
  { value: 'COMPLETED', label: '완료' },
]

export default function AdminApplicationsTable({ 
  applications, 
  initialStatus = '',
  initialIncludeDeleted = false
}: AdminApplicationsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'ALL')
  const [includeDeleted, setIncludeDeleted] = useState(initialIncludeDeleted)
  const [sortField, setSortField] = useState<SortField>('submitted_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // 삭제된 데이터 토글 핸들러
  const handleIncludeDeletedChange = (checked: boolean) => {
    setIncludeDeleted(checked)
    const params = new URLSearchParams()
    if (statusFilter && statusFilter !== 'ALL') {
      params.set('status', statusFilter)
    }
    if (checked) {
      params.set('includeDeleted', 'true')
    }
    const queryString = params.toString()
    router.push(`/admin/applications${queryString ? `?${queryString}` : ''}`)
  }

  // 필터링 및 검색
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // 상태 필터
      if (statusFilter && statusFilter !== 'ALL' && app.status !== statusFilter) {
        return false
      }

      // 검색어 필터 (프로젝트명, 신청자명, IRB번호, 소속, 책임연구자, 책임자 소속)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          app.project_name?.toLowerCase().includes(searchLower) ||
          app.applicant_name?.toLowerCase().includes(searchLower) ||
          app.irb_number?.toLowerCase().includes(searchLower) ||
          app.applicant_department?.toLowerCase().includes(searchLower) ||
          app.principal_investigator?.toLowerCase().includes(searchLower) ||
          app.pi_department?.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }, [applications, searchTerm, statusFilter])

  // 정렬
  const sortedApplications = useMemo(() => {
    return [...filteredApplications].sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      // 날짜 필드 처리
      if (sortField === 'submitted_at') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      }

      // 문자열 필드 처리
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal?.toLowerCase() || ''
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredApplications, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-600" /> : 
      <ArrowDown className="h-4 w-4 text-blue-600" />
  }

  const handleDelete = async (applicationId: string) => {
    if (!deleteReason.trim()) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: deleteReason }),
      })

      if (response.ok) {
        setDeleteDialogOpen(null)
        setDeleteReason('')
        window.location.reload() // 간단한 새로고침으로 데이터 업데이트
      } else {
        throw new Error('삭제 실패')
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            검색 및 필터
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 삭제된 데이터 표시 토글 */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeDeleted"
              checked={includeDeleted}
              onCheckedChange={handleIncludeDeletedChange}
            />
            <Label 
              htmlFor="includeDeleted" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              삭제된 데이터도 표시
            </Label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="프로젝트명, 신청자명, IRB번호, 소속, 책임연구자, 책임자 소속으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 상태 필터 */}
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
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

            {/* 초기화 버튼 */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('ALL')
                setIncludeDeleted(false)
                setSortField('submitted_at')
                setSortDirection('desc')
                router.push('/admin/applications')
              }}
            >
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 결과 통계 */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          전체 {applications.length}건 중 {sortedApplications.length}건 표시
        </p>
      </div>

      {/* 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>신청 목록</CardTitle>
          <CardDescription>
            모든 데이터 추출·가공 서비스 신청을 관리합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedApplications.length === 0 ? (
            <div className="text-center py-12">
              {applications.length === 0 ? (
                <p className="text-gray-500">신청 내역이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-500">검색 조건에 맞는 신청이 없습니다</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('ALL')
                    }}
                  >
                    검색 조건 초기화
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">
                      <button
                        className="flex items-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort('project_name')}
                      >
                        프로젝트명 {getSortIcon('project_name')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4">
                      <button
                        className="flex items-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort('applicant_name')}
                      >
                        신청자 {getSortIcon('applicant_name')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4">책임자</th>
                    <th className="text-left py-3 px-4">IRB 번호</th>
                    <th className="text-left py-3 px-4 w-32">
                      <button
                        className="flex items-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort('status')}
                      >
                        상태 {getSortIcon('status')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4">
                      <button
                        className="flex items-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort('submitted_at')}
                      >
                        제출일시 {getSortIcon('submitted_at')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4">완료/반려일시</th>
                    <th className="text-left py-3 px-4">비고</th>
                    <th className="text-left py-3 px-4">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedApplications.map((app: Application) => {
                    const isDeleted = app.dcyn === 'Y'
                    return (
                    <tr 
                      key={app.id} 
                      className={`border-b hover:bg-gray-50 ${
                        isDeleted ? 'bg-red-50 opacity-60' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className={`text-blue-600 hover:underline font-medium ${
                            isDeleted ? 'line-through opacity-60' : ''
                          }`}
                        >
                          {app.project_name}
                          {isDeleted && (
                            <span className="ml-2 text-red-500 text-xs font-normal">[삭제됨]</span>
                          )}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        {app.applicant_name || '-'}
                      </td>
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
                      <td className="py-3 px-4 font-mono text-sm">{app.irb_number || '-'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {app.submitted_at
                          ? (() => {
                              const date = new Date(app.submitted_at);
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              const seconds = String(date.getSeconds()).padStart(2, '0');
                              return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                            })()
                          : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {app.status === 'COMPLETED' && app.completed_at
                          ? (() => {
                              const date = new Date(app.completed_at);
                              return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR');
                            })()
                          : app.status === 'REJECTED' && app.rejected_at
                          ? (() => {
                              const date = new Date(app.rejected_at);
                              return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR');
                            })()
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {app.dcyn === 'Y' && app.deletion_reason ? (
                          <div className="text-sm">
                            <span className="text-red-600 font-medium">삭제됨</span>
                            <div className="text-gray-500 text-xs mt-1">{app.deletion_reason}</div>
                          </div>
                        ) : app.status === 'REJECTED' && app.rejection_reason ? (
                          <div className="text-sm">
                            <span className="text-orange-600 font-medium">반려</span>
                            <div className="text-gray-500 text-xs mt-1">{app.rejection_reason}</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/applications/${app.id}`}>
                            <Button size="sm" variant="outline">
                              검토
                            </Button>
                          </Link>
                          {app.dcyn === 'N' && (
                            <Dialog open={deleteDialogOpen === app.id} onOpenChange={(open) => setDeleteDialogOpen(open ? app.id : null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>신청서 삭제</DialogTitle>
                                  <DialogDescription>
                                    '{app.project_name}' 신청서를 삭제하시겠습니까? 삭제된 신청서는 복구할 수 없습니다.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="deleteReason">삭제 사유 *</Label>
                                    <Textarea
                                      id="deleteReason"
                                      placeholder="삭제 사유를 입력하세요..."
                                      value={deleteReason}
                                      onChange={(e) => setDeleteReason(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setDeleteDialogOpen(null)
                                      setDeleteReason('')
                                    }}
                                    disabled={isDeleting}
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(app.id)}
                                    disabled={!deleteReason.trim() || isDeleting}
                                  >
                                    {isDeleting ? '삭제 중...' : '삭제'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
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