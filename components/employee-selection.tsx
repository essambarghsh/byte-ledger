'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDictionary, t } from '@/lib/i18n'
import { Employee } from '@/types'
import { toast } from 'sonner'
import { EmployeeAvatar } from '@/components/employee-avatar'

export function EmployeeSelection() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(false)
  const router = useRouter()
  const dict = getDictionary()

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.filter((emp: Employee) => emp.isActive))
      } else {
        toast.error('خطأ في تحميل قائمة الموظفين')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const selectEmployee = async (employee: Employee) => {
    if (selecting) return
    
    setSelecting(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employee.id,
          employeeName: employee.name,
          employeeAvatar: employee.avatar,
        }),
      })

      if (response.ok) {
        toast.success(`${t('auth.welcome', dict)} ${employee.name}`)
        router.push('/dashboard')
        router.refresh()
      } else {
        toast.error('خطأ في تسجيل الدخول')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setSelecting(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">{t('common.loading', dict)}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t('app.name', dict)}</CardTitle>
        <CardDescription>
          {t('auth.selectEmployee', dict)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {employees.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">لا يوجد موظفون نشطون</p>
          </div>
        ) : (
          employees.map((employee) => (
            <Button
              key={employee.id}
              variant="outline"
              className="w-full h-auto p-4 justify-start"
              onClick={() => selectEmployee(employee)}
              disabled={selecting}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <EmployeeAvatar 
                  name={employee.name}
                  avatar={employee.avatar}
                  size="lg"
                  updatedAt={employee.updatedAt}
                />
                <div className="text-right rtl:text-right">
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">موظف</p>
                </div>
              </div>
            </Button>
          ))
        )}
      </CardContent>
    </Card>
  )
}
