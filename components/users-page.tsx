'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmployeeAvatar } from '@/components/employee-avatar'
import { Employee } from '@/types'
import { toast } from 'sonner'
import { Plus, Save, X, Users } from 'lucide-react'

export function UsersPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
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

  const createNewEmployee = async () => {
    if (!newEmployeeName.trim()) {
      toast.error('اسم الموظف مطلوب')
      return
    }

    setCreating(true)
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
        setShowCreateModal(false)
        setNewEmployeeName('')
      } else {
        const data = await response.json()
        toast.error(data.error || 'خطأ في إضافة الموظف')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setCreating(false)
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setNewEmployeeName('')
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
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <p className="text-sm text-muted-foreground mt-1">
            عرض جميع الموظفين وإضافة موظفين جدد
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موظف جديد</span>
        </Button>
      </div>

      {/* Employees Grid */}
      {employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <EmployeeAvatar 
                    name={employee.name}
                    avatar={employee.avatar || ''}
                    size="lg"
                    updatedAt={employee.updatedAt}
                  />
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {employee.id}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2 w-full">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الحالة:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">تاريخ الإنضمام:</span>
                      <span>{new Date(employee.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    
                    {employee.updatedAt !== employee.createdAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">آخر تحديث:</span>
                        <span>{new Date(employee.updatedAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">لا يوجد موظفون حالياً</h3>
            <p className="text-muted-foreground mb-4">
              ابدأ بإضافة أول موظف في النظام
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة موظف جديد
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Employee Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة موظف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newEmployeeName">اسم الموظف *</Label>
              <Input
                id="newEmployeeName"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                placeholder="أدخل اسم الموظف"
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    createNewEmployee()
                  }
                }}
              />
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>ملاحظة:</strong> سيتمكن الموظف الجديد من تسجيل الدخول باستخدام اسمه وإضافة صورة شخصية أو تعديل بياناته لاحقاً.
              </p>
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={creating}
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
              <Button 
                onClick={createNewEmployee}
                disabled={creating || !newEmployeeName.trim()}
              >
                <Save className="w-4 h-4 ml-2" />
                {creating ? 'جاري الإضافة...' : 'إضافة الموظف'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
