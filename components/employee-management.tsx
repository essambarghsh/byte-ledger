'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmployeeCard } from '@/components/employee-card'
import { Employee } from '@/types'
import { toast } from 'sonner'
import { Plus, User, Save, X } from 'lucide-react'

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingNew, setCreatingNew] = useState(false)
  const [newEmployeeName, setNewEmployeeName] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      } else {
        toast.error('خطأ في تحميل قائمة الموظفين')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeUpdate = (updatedEmployee: Employee) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      )
    )
  }

  const createNewEmployee = async () => {
    if (!newEmployeeName.trim()) {
      toast.error('اسم الموظف مطلوب')
      return
    }

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newEmployeeName.trim(),
          avatar: '/avatars/default-1.png',
          isActive: true,
        }),
      })

      if (response.ok) {
        const newEmployee = await response.json()
        setEmployees(prev => [...prev, newEmployee])
        toast.success('تم إضافة الموظف بنجاح')
        setCreatingNew(false)
        setNewEmployeeName('')
      } else {
        const data = await response.json()
        toast.error(data.error || 'خطأ في إضافة الموظف')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    }
  }


  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">إدارة الموظفين</h2>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة الموظفين وصورهم الشخصية في مكان واحد
          </p>
        </div>
        <Button 
          onClick={() => setCreatingNew(true)}
          disabled={creatingNew}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موظف</span>
        </Button>
      </div>

      {/* New Employee Form */}
      {creatingNew && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة موظف جديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newEmployeeName">اسم الموظف</Label>
              <Input
                id="newEmployeeName"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                placeholder="أدخل اسم الموظف"
                className="mt-1"
              />
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button onClick={createNewEmployee}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCreatingNew(false)
                  setNewEmployeeName('')
                }}
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onEmployeeUpdate={handleEmployeeUpdate}
          />
        ))}
      </div>

      {employees.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا يوجد موظفون حالياً</p>
            <p className="text-sm text-muted-foreground mt-1">
              اضغط على &quot;إضافة موظف&quot; لإضافة موظف جديد
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
