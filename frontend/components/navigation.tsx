'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/lib/actions'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Bot,
  ChevronDown,
  ClipboardCheck,
  Database,
  FolderOpen,
  Home,
  Info,
  LogOut,
  Menu,
  MessageSquareMore,
  PanelsTopLeft,
  PlusCircle,
  Users,
  X,
} from 'lucide-react'

interface NavSubItem {
  href: string
  label: string
  icon: React.ElementType
  description: string
  exact?: boolean
  excludes?: string[]
}

interface NavGroup {
  label: string
  href: string
  items: NavSubItem[]
}

interface NavigationProps {
  userRole: 'RESEARCHER' | 'ADMIN'
  userName: string
}

const researcherGroups: NavGroup[] = [
  {
    label: '빅데이터센터 소개',
    href: '/bigdata-center',
    items: [
      {
        href: '/bigdata-center',
        label: '센터 소개',
        icon: Home,
        description: '센터 역할, 지원 범위, 추진 방향 안내',
        exact: true,
      },
      {
        href: '/bigdata-center/history',
        label: '연혁',
        icon: BarChart3,
        description: '센터 운영과 서비스 확장 이력',
      },
    ],
  },
  {
    label: '데이터 서비스',
    href: '/researcher/applications/new',
    items: [
      {
        href: '/researcher/dashboard',
        label: '대시보드',
        icon: Home,
        description: '신청 현황과 최근 내역 확인',
        exact: true,
      },
      {
        href: '/data-catalog',
        label: '데이터 카탈로그',
        icon: Database,
        description: '제공 데이터 항목 안내',
      },
      {
        href: '/researcher/applications/new',
        label: '데이터 서비스 신청',
        icon: PlusCircle,
        description: '새 데이터 서비스 신청',
        exact: true,
      },
      {
        href: '/pricing',
        label: '이용요금',
        icon: Info,
        description: '서비스 요금 및 산정 기준',
      },
    ],
  },
  {
    label: '자동화 서비스',
    href: '/automation-services',
    items: [
      {
        href: '/researcher/automation-services',
        label: '대시보드',
        icon: Home,
        description: '신청 현황과 최근 요청 확인',
        exact: true,
      },
      {
        href: '/automation-services',
        label: '서비스 안내',
        icon: Bot,
        description: '자동화 서비스 범위와 지원 항목 안내',
        exact: true,
      },
      {
        href: '/researcher/automation-services/new',
        label: '자동화 서비스 신청',
        icon: PlusCircle,
        description: '새 자동화 서비스 요청 접수',
        exact: true,
      },
    ],
  },
]

const adminGroups: NavGroup[] = [
  {
    label: '빅데이터센터 소개',
    href: '/bigdata-center',
    items: [
      {
        href: '/bigdata-center',
        label: '센터 소개',
        icon: Home,
        description: '센터 역할, 지원 범위, 추진 방향 안내',
        exact: true,
      },
      {
        href: '/bigdata-center/history',
        label: '연혁',
        icon: BarChart3,
        description: '센터 운영과 서비스 확장 이력',
      },
    ],
  },
  {
    label: '데이터 서비스',
    href: '/admin/applications',
    items: [
      {
        href: '/admin/dashboard',
        label: '대시보드',
        icon: Home,
        description: '운영 현황과 핵심 지표 확인',
        exact: true,
      },
      {
        href: '/data-catalog',
        label: '데이터 카탈로그',
        icon: Database,
        description: '제공 데이터 항목 안내',
      },
      {
        href: '/admin/applications',
        label: '신청 관리',
        icon: ClipboardCheck,
        description: '신청 검토 및 처리',
      },
      {
        href: '/pricing',
        label: '이용요금',
        icon: Info,
        description: '서비스 요금 및 산정 기준',
      },
    ],
  },
  {
    label: '자동화 서비스',
    href: '/automation-services',
    items: [
      {
        href: '/admin/automation-services',
        label: '대시보드',
        icon: Home,
        description: '요청 현황과 최근 접수 확인',
        exact: true,
      },
      {
        href: '/admin/automation-services/manage',
        label: '신청 관리',
        icon: FolderOpen,
        description: '검색, 필터, 정렬 기반 신청 관리',
      },
      {
        href: '/automation-services',
        label: '서비스 안내',
        icon: Bot,
        description: '자동화 서비스 범위와 운영 방향 안내',
        exact: true,
      },
    ],
  },
  {
    label: '관리 기능',
    href: '/admin/users',
    items: [
      {
        href: '/admin/users',
        label: '사용자 관리',
        icon: Users,
        description: '계정 및 권한 관리',
      },
      {
        href: '/admin/statistics',
        label: '운영 통계',
        icon: BarChart3,
        description: '상태 분포 및 처리 통계',
      },
      {
        href: '/admin/notices',
        label: '공지사항 관리',
        icon: MessageSquareMore,
        description: '메인 화면 공지사항 작성 및 관리',
      },
      {
        href: '/admin/swagger',
        label: 'API 문서',
        icon: PanelsTopLeft,
        description: 'FastAPI Swagger 문서 확인',
      },
    ],
  },
]

function isSubItemActive(pathname: string, item: NavSubItem) {
  if (item.excludes?.some((excludePath) => pathname.startsWith(excludePath))) {
    return false
  }

  if (item.exact) {
    return pathname === item.href
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function Navigation({ userRole, userName }: NavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const groups = useMemo(
    () => (userRole === 'ADMIN' ? adminGroups : researcherGroups),
    [userRole]
  )

  const activeGroupLabel = useMemo(() => {
    return groups.find((group) => group.items.some((item) => isSubItemActive(pathname, item)))?.label ?? groups[0]?.label
  }, [groups, pathname])

  const [openDesktopGroup, setOpenDesktopGroup] = useState('')
  const [openMobileGroup, setOpenMobileGroup] = useState(activeGroupLabel)

  useEffect(() => {
    setOpenMobileGroup(activeGroupLabel)
    setIsMobileMenuOpen(false)
  }, [activeGroupLabel, pathname])

  const activeDesktopGroup = groups.find((group) => group.label === openDesktopGroup)

  return (
    <nav className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-[4.25rem] items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <Link href={userRole === 'ADMIN' ? '/admin' : '/main'} className="block">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">AUMC Data Portal</p>
              <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">아주대학교병원 데이터 포털</h1>
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-gray-100 p-1">
              {groups.map((group) => {
                const isOpenGroup = openDesktopGroup === group.label

                return (
                  <button
                    key={group.label}
                    type="button"
                    onClick={() =>
                      setOpenDesktopGroup((currentGroup) =>
                        currentGroup === group.label ? '' : group.label
                      )
                    }
                    className={cn(
                      'inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                      isOpenGroup
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900',
                    )}
                  >
                    {group.label}
                    <ChevronDown className={cn('ml-2 h-4 w-4 transition-transform', isOpenGroup ? 'rotate-180' : '')} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole === 'ADMIN' ? '관리자' : '연구자'}</p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </form>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
              aria-label="메뉴 열기"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {activeDesktopGroup && (
          <div className="hidden border-t border-gray-100 py-3 md:block">
            <div className="flex flex-wrap justify-center gap-2">
              {activeDesktopGroup.items.map((item) => {
                const isActive = isSubItemActive(pathname, item)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenDesktopGroup('')}
                    className={cn(
                      'w-[220px] rounded-xl px-3 py-2 transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-900'
                        : 'bg-white hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="mx-auto max-w-7xl space-y-3 px-3 py-4 sm:px-6">
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole === 'ADMIN' ? '관리자' : '연구자'}</p>
            </div>

            {groups.map((group) => {
              const isOpen = openMobileGroup === group.label
              const isActiveGroup = activeGroupLabel === group.label

              return (
                <div key={group.label} className="overflow-hidden rounded-2xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setOpenMobileGroup(isOpen ? '' : group.label)}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-3 text-left',
                      isActiveGroup ? 'bg-blue-50 text-blue-900' : 'bg-white text-gray-900'
                    )}
                  >
                    <span className="font-semibold">{group.label}</span>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : '')} />
                  </button>

                  {isOpen && (
                    <div className="space-y-1 border-t border-gray-100 bg-white p-2">
                      {group.items.map((item) => {
                        const isActive = isSubItemActive(pathname, item)

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              setOpenMobileGroup('')
                              setIsMobileMenuOpen(false)
                            }}
                            className={cn(
                              'flex items-start gap-3 rounded-xl px-3 py-3',
                              isActive ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'
                            )}
                          >
                            {/* <div className={cn('rounded-full p-2', isActive ? 'bg-blue-100' : 'bg-gray-100')}>
                              <Icon className={cn('h-4 w-4', isActive ? 'text-blue-700' : 'text-gray-600')} />
                            </div> */}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{item.label}</p>
                              <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            <form action={logoutAction}>
              <Button type="submit" variant="outline" className="w-full justify-center rounded-xl">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}
