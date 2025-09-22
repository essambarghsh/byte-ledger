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
import { getDictionary, t } from '@/lib/i18n'

export function UsersPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newEmployeeName, setNewEmployeeName] = useState('')
  const dict = getDictionary()
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
        toast.error(t('users.error', dict))
      }
    } catch {
      toast.error(t('users.error', dict))
    } finally {
      setLoading(false)
    }
  }

  const createNewEmployee = async () => {
    if (!newEmployeeName.trim()) {
      toast.error(t('users.nameRequired', dict))
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
        toast.success(t('users.success', dict))
        setShowCreateModal(false)
        setNewEmployeeName('')
      } else {
        const data = await response.json()
        toast.error(data.error || t('users.error', dict))
      }
    } catch {
      toast.error(t('users.error', dict))
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
            <p className="mt-2 text-muted-foreground">{t('users.loading', dict)}...</p>
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
          <h1 className="text-2xl font-bold">{t('users.title', dict)}</h1>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>{t('users.addEmployee', dict)}</span>
        </Button>
      </div>

      {/* Employees Grid */}
      {employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-row items-center text-center">
                  <EmployeeAvatar
                    name={employee.name}
                    avatar={employee.avatar || ''}
                    size="lg"
                    className='w-16 h-16 min-w-16'
                    updatedAt={employee.updatedAt}
                  />

                  <div className="flex-1">
                    <h3 className="font-black text-sm mr-4 text-right">{employee.name}</h3>
                  </div>

                  <div className="sr-only">
                    <p className="text-sm text-muted-foreground font-mono">
                      {employee.id}
                    </p>
                  </div>

                  <div className="flex">
                    <div className="flex justify-between text-sm">
                      <span className={`px-4 py-3 rounded-full text-xs font-medium ${employee.isActive
                        ? 'bg-green-900/10 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {employee.isActive ? t('users.active', dict) : t('users.inactive', dict)}
                      </span>
                    </div>

                    <div className="sr-only">
                      <span className="text-muted-foreground">{t('users.joinDate', dict)}:</span>
                      <span>{new Date(employee.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>

                    {employee.updatedAt !== employee.createdAt && (
                      <div className="sr-only">
                        <span className="text-muted-foreground">{t('users.lastUpdate', dict)}:</span>
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
            <h3 className="text-lg font-medium mb-2">{t('users.noEmployees', dict)}</h3>
            <p className="text-muted-foreground mb-4">
              {t('users.noEmployeesDescription', dict)}
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 ml-2" />
              {t('users.addEmployee', dict)}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Employee Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('users.addEmployee', dict)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newEmployeeName">{t('users.name', dict)} *</Label>
              <Input
                id="newEmployeeName"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                placeholder={t('users.name', dict)}
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
                <strong>{t('users.note', dict)}:</strong> {t('users.noteDescription', dict)}
              </p>
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={creating}
              >
                <X className="w-4 h-4 ml-2" />
                {t('users.cancel', dict)}
              </Button>
              <Button
                onClick={createNewEmployee}
                disabled={creating || !newEmployeeName.trim()}
              >
                <Save className="w-4 h-4 ml-2" />
                {creating ? t('users.adding', dict) : t('users.addEmployee', dict)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
