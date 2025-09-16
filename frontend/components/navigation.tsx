'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/lib/actions'
import { cn } from '@/lib/utils'
import { 
  Home, 
  FileText, 
  Users, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  FolderOpen,
  PlusCircle,
  ClipboardCheck,
  Info,
  Database
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

interface NavigationProps {
  userRole: 'RESEARCHER' | 'ADMIN'
  userName: string
}

export function Navigation({ userRole, userName }: NavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const navItems: NavItem[] = userRole === 'ADMIN' 
    ? [
        { href: '/admin', label: '대시보드', icon: Home },
        { href: '/admin/applications', label: '신청 관리', icon: ClipboardCheck },
        { href: '/admin/users', label: '사용자 관리', icon: Users },
        { href: '/admin/statistics', label: '통계', icon: BarChart3 },
        { href: '/data-catalog', label: '데이터 카탈로그', icon: Database },
        { href: '/pricing', label: '요금 안내', icon: Info },
      ]
    : [
        { href: '/researcher', label: '대시보드', icon: Home },
        { href: '/researcher/applications', label: '내 신청', icon: FolderOpen },
        { href: '/researcher/applications/new', label: '새 신청', icon: PlusCircle },
        { href: '/data-catalog', label: '데이터 카탈로그', icon: Database },
        { href: '/pricing', label: '요금 안내', icon: Info },
      ]
  
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={userRole === 'ADMIN' ? '/admin' : '/researcher'}>
                <h1 className="text-xl font-bold text-gray-900">
                  데이터 포털
                </h1>
              </Link>
            </div>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                      pathname === item.href
                        ? 'border-primary text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-4">
            <span className="text-sm text-gray-700">
              {userName} ({userRole === 'ADMIN' ? '관리자' : '연구자'})
            </span>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </form>
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                    pathname === item.href
                      ? 'bg-blue-50 border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <span className="text-sm font-medium text-gray-800">
                  {userName}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  ({userRole === 'ADMIN' ? '관리자' : '연구자'})
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" className="w-full justify-start">
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}