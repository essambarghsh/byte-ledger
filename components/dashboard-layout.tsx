'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getDictionary, t } from '@/lib/i18n'
import { SessionData, Employee } from '@/types'
import { LogOut, Settings, History } from 'lucide-react'
import { toast } from 'sonner'
import { EmployeeAvatar } from '@/components/employee-avatar'

interface DashboardLayoutProps {
  children: React.ReactNode
  session: SessionData
}

export function DashboardLayout({ children, session }: DashboardLayoutProps) {
  const router = useRouter()
  const dict = getDictionary()
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    fetchCurrentEmployee()
  }, [session.employeeId])

  const fetchCurrentEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${session.employeeId}`)
      if (response.ok) {
        const employee = await response.json()
        setCurrentEmployee(employee)
      }
    } catch (error) {
      console.error('Failed to fetch current employee:', error)
    }
  }

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
              <EmployeeAvatar 
                name={session.employeeName}
                avatar={currentEmployee ? currentEmployee.avatar : session.employeeAvatar}
                size="md"
                showName={true}
                nameClassName="text-sm font-medium text-gray-700"
                updatedAt={currentEmployee?.updatedAt}
              />
              
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
