'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Employee } from '@/types'
import { toast } from 'sonner'
import { Edit2, Save, X, Upload, User, Trash2 } from 'lucide-react'

interface EmployeeCardProps {
  employee: Employee
  onEmployeeUpdate: (updatedEmployee: Employee) => void
  onEmployeeDelete?: (employeeId: string) => void
}

export function EmployeeCard({ 
  employee, 
  onEmployeeUpdate, 
  onEmployeeDelete 
}: EmployeeCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(employee.name)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl
    if (employee.avatar.startsWith('/avatars/') && !employee.avatar.includes('default')) {
      // Add timestamp to bust browser cache using updatedAt
      const timestamp = new Date(employee.updatedAt).getTime()
      return `/api${employee.avatar}?t=${timestamp}`
    }
    return null
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('نوع الملف غير مدعوم. يُسمح فقط بـ JPEG، PNG، GIF، وWebP')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch(`/api/employees/${employee.id}/avatar`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('تم تحديث الصورة الشخصية بنجاح')
        onEmployeeUpdate({ ...employee, avatar: data.avatarPath })
        setPreviewUrl(null)
      } else {
        toast.error(data.error || 'خطأ في تحميل الصورة')
        setPreviewUrl(null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('خطأ في الاتصال بالخادم')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeAvatar = async () => {
    setUploading(true)
    
    try {
      const response = await fetch(`/api/employees/${employee.id}/avatar`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('تم حذف الصورة الشخصية')
        onEmployeeUpdate(data.employee)
      } else {
        toast.error(data.error || 'خطأ في حذف الصورة')
      }
    } catch (error) {
      console.error('Remove error:', error)
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setUploading(false)
    }
  }

  const startEditing = () => {
    setIsEditing(true)
    setEditName(employee.name)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditName(employee.name)
  }

  const saveEmployee = async () => {
    if (!editName.trim()) {
      toast.error('اسم الموظف مطلوب')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
        }),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        onEmployeeUpdate(updatedEmployee)
        toast.success('تم تحديث بيانات الموظف')
        setIsEditing(false)
      } else {
        const data = await response.json()
        toast.error(data.error || 'خطأ في تحديث الموظف')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  const toggleActiveStatus = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !employee.isActive,
        }),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        onEmployeeUpdate(updatedEmployee)
        toast.success(`تم ${updatedEmployee.isActive ? 'تفعيل' : 'إلغاء تفعيل'} الموظف`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'خطأ في تحديث حالة الموظف')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const avatarUrl = getAvatarUrl()

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 border-2 border-border">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${employee.name} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Loading overlay for avatar */}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Avatar Actions */}
            <div className="flex flex-col space-y-2">
              <Button
                onClick={openFileDialog}
                disabled={uploading || saving}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <Upload className="w-3 h-3 ml-1" />
                {avatarUrl ? 'تغيير الصورة' : 'رفع صورة'}
              </Button>

              {avatarUrl && (
                <Button
                  onClick={removeAvatar}
                  disabled={uploading || saving}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <X className="w-3 h-3 ml-1" />
                  حذف الصورة
                </Button>
              )}
            </div>
          </div>

          {/* Employee Info Section */}
          <div className="space-y-3">
            {/* Name */}
            <div>
              <Label className="text-sm font-medium">الاسم</Label>
              {isEditing ? (
                <div className="flex space-x-2 rtl:space-x-reverse mt-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    disabled={saving}
                  />
                  <Button
                    onClick={saveEmployee}
                    disabled={saving}
                    size="sm"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    disabled={saving}
                    size="sm"
                    variant="outline"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <span className="font-medium">{employee.name}</span>
                  <Button
                    onClick={startEditing}
                    disabled={uploading || saving}
                    size="sm"
                    variant="ghost"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <Label className="text-sm font-medium">الحالة</Label>
              <div className="flex items-center justify-between mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  employee.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {employee.isActive ? 'نشط' : 'غير نشط'}
                </span>
                <Button
                  onClick={toggleActiveStatus}
                  disabled={uploading || saving}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {employee.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-muted-foreground">
              <div>تم الإنشاء: {new Date(employee.createdAt).toLocaleDateString('ar-SA')}</div>
              <div>آخر تحديث: {new Date(employee.updatedAt).toLocaleDateString('ar-SA')}</div>
            </div>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            يُسمح بملفات JPEG، PNG، GIF، وWebP. الحد الأقصى 5 ميجابايت.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
