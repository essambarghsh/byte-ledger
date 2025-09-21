'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getDictionary, t } from '@/lib/i18n'
import { SessionData } from '@/types'
import { LogOut, Settings, History } from 'lucide-react'
import { toast } from 'sonner'

interface DashboardLayoutProps {
  children: React.ReactNode
  session: SessionData
}

export function DashboardLayout({ children, session }: DashboardLayoutProps) {
  const router = useRouter()
  const dict = getDictionary()

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
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <h1 className="text-xl font-bold text-gray-900">
                {t('app.name', dict)}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {session.employeeName.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {session.employeeName}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/history')}
                >
                  <History className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  {t('history.title', dict)}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/settings')}
                >
                  <Settings className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  {t('settings.title', dict)}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  {t('auth.logout', dict)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {children}
      </main>
    </div>
  )
}
