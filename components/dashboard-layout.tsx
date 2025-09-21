'use client'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SessionData } from '@/types'
import { AppHeader } from './app-header'
import { AppFooter } from './app-footer'

interface DashboardLayoutProps {
  children: React.ReactNode
  session: SessionData
  defaultOpen: boolean
}

export function DashboardLayout({ children, session, defaultOpen }: DashboardLayoutProps) {

  return (
      <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar session={session} />
      <SidebarInset className='bg-transparent overflow-hidden'>
        {/* Header */}
        <AppHeader session={session} />

        {/* Main Content */}
        <div className='flex flex-1 flex-col h-16 max-h-[calc(100dvh-(4rem))] min-h-[calc(100dvh-(4rem))] overflow-y-auto overflow-x-hidden'>
          <div className="container py-6 lg:py-14">
            {children}
          </div>
          <div className="mt-auto">
            <AppFooter />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
