'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmployeeAvatar } from '@/components/employee-avatar'
import { SessionData, Employee } from '@/types'
import { toast } from 'sonner'
import { Save, Upload, User } from 'lucide-react'
import { getDictionary, t } from '@/lib/i18n'

interface AccountPageProps {
  session: SessionData
}

export function AccountPage({ session }: AccountPageProps) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    avatar: ''
  })
  const dict = getDictionary()

  const fetchEmployee = useCallback(async () => {
    try {
      const response = await fetch(`/api/employees/${session.employeeId}`)
      if (response.ok) {
        const employeeData = await response.json()
        setEmployee(employeeData)
        setFormData({
          name: employeeData.name,
          avatar: employeeData.avatar || ''
        })
      } else {
        toast.error('خطأ في تحميل بيانات الحساب')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }, [session.employeeId])

  useEffect(() => {
    fetchEmployee()
  }, [fetchEmployee])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('اسم الموظف مطلوب')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/employees/${session.employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          avatar: formData.avatar,
        }),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployee(updatedEmployee)
        
        // Update session data to reflect changes throughout the app
        try {
          const sessionResponse = await fetch('/api/auth/update-session', {
            method: 'POST',
          })
          
          if (sessionResponse.ok) {
            toast.success('تم حفظ البيانات بنجاح')
            // Small delay to show the success message before reload
            setTimeout(() => {
              toast.loading('جاري تحديث البيانات...')
              setTimeout(() => window.location.reload(), 500)
            }, 1000)
          } else {
            toast.success('تم حفظ البيانات بنجاح')
            setTimeout(() => {
              toast.loading('جاري تحديث البيانات...')
              setTimeout(() => window.location.reload(), 500)
            }, 1000)
          }
        } catch {
          toast.success('تم حفظ البيانات بنجاح')
          setTimeout(() => {
            toast.loading('جاري تحديث البيانات...')
            setTimeout(() => window.location.reload(), 500)
          }, 1000)
        }
      } else {
        const data = await response.json()
        toast.error(data.error || 'خطأ في حفظ البيانات')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صحيح')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف يجب أن يكون أقل من 5 ميجابايت')
      return
    }

    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const response = await fetch(`/api/employees/${session.employeeId}/avatar`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, avatar: data.avatarUrl }))
        
        // Update session to reflect new avatar
        try {
          await fetch('/api/auth/update-session', {
            method: 'POST',
          })
        } catch {
          // Silent fail, avatar will still be updated locally
        }
        
        toast.success('تم رفع الصورة الشخصية بنجاح')
        
        // Refresh page after a short delay to update session data throughout the app
        setTimeout(() => {
          toast.loading('جاري تحديث البيانات...')
          setTimeout(() => window.location.reload(), 500)
        }, 1500)
      } else {
        const data = await response.json()
        toast.error(data.error || 'خطأ في رفع الصورة الشخصية')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setUploadingAvatar(false)
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

  if (!employee) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لم يتم العثور على بيانات الحساب</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('account.title', dict)}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة بيانات حسابك الشخصي
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المعلومات الشخصية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="relative">
              <EmployeeAvatar
                name={employee.name}
                avatar={formData.avatar}
                size="lg"
                updatedAt={employee.updatedAt}
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">الصورة الشخصية</h3>
              <p className="text-sm text-muted-foreground mb-2">
                اختر صورة شخصية لحسابك (الحد الأقصى 5 ميجابايت)
              </p>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingAvatar}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Upload className="w-4 h-4 ml-2" />
                  {uploadingAvatar ? 'جاري الرفع...' : 'رفع صورة'}
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="employeeName">الاسم *</Label>
            <Input
              id="employeeName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="أدخل اسمك"
            />
          </div>

          {/* Account Info */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium">معلومات الحساب</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">معرف الموظف:</span>
                <p className="font-mono">{employee.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                <p>{new Date(employee.createdAt).toLocaleDateString('ar-EG')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">آخر تحديث:</span>
                <p>{new Date(employee.updatedAt).toLocaleDateString('ar-EG')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">حالة الحساب:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  employee.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={saving || !formData.name.trim()}
            >
              <Save className="w-4 h-4 ml-2" />
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
