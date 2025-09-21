'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

import { getDictionary, t } from '@/lib/i18n'
import { SessionData, Employee } from '@/types'
import {
  LogOut,
} from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect, useCallback } from 'react'
import { CustomSidebarTrigger } from './ui/sidebar-trigger'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MageDashboard2Fill } from './icons/MageDashboard2Fill'
import { MageDashboardBarFill } from './icons/MageDashboardBarFill'
import { SolarSettingsBold } from './icons/SolarSettingsBold'

interface AppSidebarProps {
  session: SessionData
}

export function AppSidebar({ session }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const dict = getDictionary()
  const [, setCurrentEmployee] = useState<Employee | null>(null)

  const fetchCurrentEmployee = useCallback(async () => {
    try {
      const response = await fetch(`/api/employees/${session.employeeId}`)
      if (response.ok) {
        const employee = await response.json()
        setCurrentEmployee(employee)
      }
    } catch (error) {
      console.error('Failed to fetch current employee:', error)
    }
  }, [session.employeeId])

  useEffect(() => {
    fetchCurrentEmployee()
  }, [fetchCurrentEmployee])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('تم تسجيل الخروج بنجاح')
        router.push('/')
        router.refresh()
      } else {
        toast.error('خطأ في تسجيل الخروج')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    }
  }

  const navigationItems = [
    {
      title: t('dashboard.title', dict),
      url: '/dashboard',
      icon: MageDashboard2Fill,
    },
    {
      title: t('history.title', dict),
      url: '/history',
      icon: MageDashboardBarFill,
    },
    {
      title: t('settings.title', dict),
      url: '/settings',
      icon: SolarSettingsBold,
    },
  ]

  return (
    <Sidebar
      collapsible="icon"
      side="right"
      className="border-l"
      variant="sidebar"
    >
      <SidebarHeader className='h-16 py-0 px-4 border-b border-gray-300 flex-row items-center overflow-hidden'>
        <div className="flex items-center justify-between w-full">
          <Link href="/dashboard">
            <span className="flex items-center">
              <span className="hidden group-data-[collapsible=icon]:block !max-h-[2rem] !h-[2rem] lg:!h-[2rem] !min-w-[1.6rem] bg-amber-300" />
              <span className="group-data-[collapsible=icon]:hidden !max-h-[2rem] !h-[2rem] lg:!h-[2rem] !min-w-[4.465rem] bg-amber-300" />
            </span>
          </Link>
          <div className="flex items-center group-data-[collapsible=icon]:hidden">
            <span className="hidden md:block">
              <CustomSidebarTrigger className="-ml-2 ltr:ml-0 ltr:-mr-2 text-gray-500" />
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup className="px-0 pt-2">
          <SidebarGroupLabel className={cn("px-4 text-xs font-normal h-7",)}>{t('common.basic', dict)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url ||
                  (item.url === '/dashboard' && pathname === '/dashboard') ||
                  (item.url === '/history' && pathname.startsWith('/history')) ||
                  (item.url === '/settings' && pathname.startsWith('/settings'))

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "cursor-pointer data-[active=true]:bg-transparent data-[active=true]:text-primary data-[state=open]:text-primary data-[state=open]:hover:bg-transparent data-[state=open]:hover:text-primary px-4 py-0 h-11 rounded-none gap-0 hover:bg-transparent active:bg-transparent hover:text-primary active:text-primary text-gray-500 data-[active=true]:font-semibold font-semibold text-xs transition-colors",
                      )}
                      tooltip={item.title}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 w-full"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:truncate">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup className="px-0 pt-2">
          <SidebarGroupLabel className={cn("px-4 text-xs font-normal h-7",)}>{t('common.account', dict)}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={cn(
                  "cursor-pointer data-[active=true]:bg-transparent data-[active=true]:text-primary data-[state=open]:text-primary data-[state=open]:hover:bg-transparent data-[state=open]:hover:text-primary px-4 py-0 h-11 rounded-none gap-0 hover:bg-transparent active:bg-transparent hover:text-primary active:text-primary text-gray-500 font-semibold text-xs transition-colors",
                )}
                asChild
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="justify-end text-right w-full flex flex-row-reverse gap-2"
                >
                  <span>
                    <LogOut className="h-4 w-4 shrink-0 -rotate-180" />
                  </span>
                  <span className="flex-1 text-right">{t('auth.logout', dict)}</span>
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
