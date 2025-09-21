'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getDictionary, t } from '@/lib/i18n'
import { Employee, AppSettings } from '@/types'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsPageProps {
  employees: Employee[]
  settings: AppSettings
  currentEmployeeId: string
}

export function SettingsPage({ 
  employees: initialEmployees, 
  settings: initialSettings,
  currentEmployeeId 
}: SettingsPageProps) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [settings, setSettings] = useState(initialSettings)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [showTransactionTypeModal, setShowTransactionTypeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editingTransactionType, setEditingTransactionType] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const dict = getDictionary()

  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    avatar: '',
    isActive: true
  })

  const [transactionTypeForm, setTransactionTypeForm] = useState({
    name: '',
    isActive: true
  })

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setEmployeeForm({ name: '', avatar: '', isActive: true })
    setShowEmployeeModal(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setEmployeeForm({
      name: employee.name,
      avatar: employee.avatar,
      isActive: employee.isActive
    })
    setShowEmployeeModal(true)
  }

  const handleSubmitEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeForm.name.trim()) {
      toast.error('يرجى إدخال اسم الموظف')
      return
    }

    setLoading(true)
    try {
      const url = editingEmployee 
        ? `/api/employees/${editingEmployee.id}`
        : '/api/employees'
      const method = editingEmployee ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        if (editingEmployee) {
          setEmployees(prev => prev.map(emp => 
            emp.id === editingEmployee.id ? updatedEmployee : emp
          ))
          toast.success('تم تحديث الموظف')
        } else {
          setEmployees(prev => [...prev, updatedEmployee])
          toast.success('تم إضافة الموظف')
        }
        setShowEmployeeModal(false)
      } else {
        toast.error('خطأ في حفظ الموظف')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransactionType = () => {
    setEditingTransactionType(null)
    setTransactionTypeForm({ name: '', isActive: true })
    setShowTransactionTypeModal(true)
  }

  const handleEditTransactionType = (transactionType: any) => {
    setEditingTransactionType(transactionType)
    setTransactionTypeForm({
      name: transactionType.name,
      isActive: transactionType.isActive
    })
    setShowTransactionTypeModal(true)
  }

  const handleSubmitTransactionType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transactionTypeForm.name.trim()) {
      toast.error('يرجى إدخال اسم نوع المعاملة')
      return
    }

    setLoading(true)
    try {
      const updatedSettings = { ...settings }
      
      if (editingTransactionType) {
        // Update existing
        updatedSettings.transactionTypes = updatedSettings.transactionTypes.map(type =>
          type.id === editingTransactionType.id 
            ? { ...type, ...transactionTypeForm }
            : type
        )
      } else {
        // Add new
        const newType = {
          id: `tx-${Date.now()}`,
          ...transactionTypeForm
        }
        updatedSettings.transactionTypes.push(newType)
      }

      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      })

      if (response.ok) {
        setSettings(updatedSettings)
        toast.success(editingTransactionType ? 'تم تحديث نوع المعاملة' : 'تم إضافة نوع المعاملة')
        setShowTransactionTypeModal(false)
      } else {
        toast.error('خطأ في حفظ نوع المعاملة')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('settings.title', dict)}</h1>
      </div>

      {/* Employees Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('settings.employees', dict)}</CardTitle>
          <Button onClick={handleAddEmployee}>
            <Plus className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
            {t('settings.addEmployee', dict)}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">{t('settings.name', dict)}</TableHead>
                  <TableHead className="text-right">{t('settings.avatar', dict)}</TableHead>
                  <TableHead className="text-right">{t('settings.isActive', dict)}</TableHead>
                  <TableHead className="text-right">{t('invoice.actions', dict)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="text-right font-medium">
                      {employee.name}
                      {employee.id === currentEmployeeId && (
                        <span className="mr-2 text-xs text-blue-600">(أنت)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {employee.avatar || 'افتراضي'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Types Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('settings.transactionTypes', dict)}</CardTitle>
          <Button onClick={handleAddTransactionType}>
            <Plus className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
            {t('settings.addTransactionType', dict)}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">{t('settings.name', dict)}</TableHead>
                  <TableHead className="text-right">{t('settings.isActive', dict)}</TableHead>
                  <TableHead className="text-right">{t('invoice.actions', dict)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.transactionTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="text-right font-medium">
                      {type.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        type.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {type.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTransactionType(type)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Employee Modal */}
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? t('settings.editEmployee', dict) : t('settings.addEmployee', dict)}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEmployee} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">{t('settings.name', dict)} *</Label>
              <Input
                id="employeeName"
                value={employeeForm.name}
                onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="اسم الموظف"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeAvatar">{t('settings.avatar', dict)}</Label>
              <Input
                id="employeeAvatar"
                value={employeeForm.avatar}
                onChange={(e) => setEmployeeForm(prev => ({ ...prev, avatar: e.target.value }))}
                placeholder="مسار الصورة الشخصية"
              />
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="employeeActive"
                checked={employeeForm.isActive}
                onChange={(e) => setEmployeeForm(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="employeeActive">{t('settings.isActive', dict)}</Label>
            </div>
            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmployeeModal(false)}
                disabled={loading}
              >
                {t('common.cancel', dict)}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('common.loading', dict) : t('common.save', dict)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Type Modal */}
      <Dialog open={showTransactionTypeModal} onOpenChange={setShowTransactionTypeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransactionType ? t('settings.editTransactionType', dict) : t('settings.addTransactionType', dict)}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTransactionType} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionTypeName">{t('settings.name', dict)} *</Label>
              <Input
                id="transactionTypeName"
                value={transactionTypeForm.name}
                onChange={(e) => setTransactionTypeForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="اسم نوع المعاملة"
                required
              />
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="transactionTypeActive"
                checked={transactionTypeForm.isActive}
                onChange={(e) => setTransactionTypeForm(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="transactionTypeActive">{t('settings.isActive', dict)}</Label>
            </div>
            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTransactionTypeModal(false)}
                disabled={loading}
              >
                {t('common.cancel', dict)}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('common.loading', dict) : t('common.save', dict)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
