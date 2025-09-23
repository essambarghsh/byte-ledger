'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Employee } from '@/types'
import { EmployeeAvatar } from '@/components/employee-avatar'
import { Eye, EyeOff, Lock } from 'lucide-react'

interface PasswordModalProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (password: string) => Promise<void>
  isLoading: boolean
}

export function PasswordModal({ 
  employee, 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading 
}: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setError('')
      setShowPassword(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور')
      return
    }
    
    setError('')
    try {
      await onSubmit(password)
    } catch {
      setError('كلمة المرور غير صحيحة')
    }
  }

  const handleCancel = () => {
    setPassword('')
    setError('')
    onClose()
  }

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <EmployeeAvatar
              name={employee.name}
              avatar={employee.avatar}
              size="md"
              updatedAt={employee.updatedAt}
            />
            تسجيل الدخول - {employee.name}
          </DialogTitle>
          <DialogDescription>
            يرجى إدخال كلمة المرور للمتابعة
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              كلمة المرور
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                disabled={isLoading}
                className="pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
