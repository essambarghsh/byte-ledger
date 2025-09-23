'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmployeeAvatar } from '@/components/employee-avatar'
import { SessionData, Employee } from '@/types'
import { toast } from 'sonner'
import { Upload, User, Eye, EyeOff, Lock, Trash2 } from 'lucide-react'
import { getDictionary, t } from '@/lib/i18n'
import { Separator } from '@/components/ui/separator'

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
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
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

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('يجب أن تكون كلمة المرور 6 أحرف على الأقل')
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
          password: passwordData.newPassword,
          currentPassword: employee?.passwordHash ? passwordData.currentPassword : undefined,
        }),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployee(updatedEmployee)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        toast.success('تم تغيير كلمة المرور بنجاح')
      } else {
        const data = await response.json()
        toast.error(data.error || 'خطأ في تغيير كلمة المرور')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  const handleRemovePassword = async () => {
    if (!employee?.passwordHash) {
      toast.error('لا توجد كلمة مرور لحذفها')
      return
    }

    if (!passwordData.currentPassword) {
      toast.error('يرجى إدخال كلمة المرور الحالية')
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
          password: '', // Empty string to remove password
          currentPassword: passwordData.currentPassword,
        }),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployee(updatedEmployee)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        toast.success('تم حذف كلمة المرور بنجاح')
      } else {
        const data = await response.json()
        toast.error(data.error || 'خطأ في حذف كلمة المرور')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setSaving(false)
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
        </div>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>المعلومات الشخصية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center">
            <div className="relative">
              <EmployeeAvatar
                name={employee.name}
                avatar={formData.avatar}
                size="xl"
                updatedAt={employee.updatedAt}
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            <div className="flex-1 mr-4">
              <div className="flex">
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
          <div>
            <Label className='text-xs font-medium mb-2 flex' htmlFor="employeeName">الاسم *</Label>
            <Input
              id="employeeName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="أدخل اسمك"
            />
          </div>

          {/* Account Info */}
          <div className="sr-only">
            <h4 className="font-medium">معلومات الحساب</h4>
            <div className="">
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {employee.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name.trim()}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            إعدادات كلمة المرور
          </CardTitle>
          <div className="flex items-center">
            {employee?.passwordHash ? (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                محمي بكلمة مرور
              </span>
            ) : (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                غير محمي بكلمة مرور
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Password (if exists) */}
          {employee?.passwordHash && (
            <div>
              <Label className='text-xs font-medium mb-2 flex' htmlFor="currentPassword">
                كلمة المرور الحالية *
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="أدخل كلمة المرور الحالية"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={saving}
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div>
            <Label className='text-xs font-medium mb-2 flex' htmlFor="newPassword">
              كلمة المرور الجديدة *
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                disabled={saving}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={saving}
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <Label className='text-xs font-medium mb-2 flex' htmlFor="confirmPassword">
              تأكيد كلمة المرور *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="أكد كلمة المرور الجديدة"
                disabled={saving}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={saving}
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handlePasswordChange}
              disabled={
                saving || 
                !passwordData.newPassword || 
                !passwordData.confirmPassword || 
                (!!employee?.passwordHash && !passwordData.currentPassword)
              }
            >
              {saving ? 'جاري الحفظ...' : (employee?.passwordHash ? 'تغيير كلمة المرور' : 'تعيين كلمة المرور')}
            </Button>
            
            {employee?.passwordHash && (
              <Button
                variant="destructive"
                onClick={handleRemovePassword}
                disabled={saving || !passwordData.currentPassword}
              >
                <Trash2 className="w-4 h-4 ml-1" />
                حذف كلمة المرور
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
