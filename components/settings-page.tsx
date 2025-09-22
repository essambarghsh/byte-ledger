'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getDictionary, t } from '@/lib/i18n'
import { AppSettings } from '@/types'
import { Plus, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsPageProps {
  settings: AppSettings
}

export function SettingsPage({ 
  settings: initialSettings
}: SettingsPageProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [showTransactionTypeModal, setShowTransactionTypeModal] = useState(false)
  const [editingTransactionType, setEditingTransactionType] = useState<{ id: string; name: string; isActive: boolean } | null>(null)
  const [loading, setLoading] = useState(false)
  const dict = getDictionary()

  const [transactionTypeForm, setTransactionTypeForm] = useState({
    name: '',
    isActive: true
  })

  const handleAddTransactionType = () => {
    setEditingTransactionType(null)
    setTransactionTypeForm({ name: '', isActive: true })
    setShowTransactionTypeModal(true)
  }

  const handleEditTransactionType = (transactionType: { id: string; name: string; isActive: boolean }) => {
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
    } catch {
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

      {/* Transaction Types Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className='mb-0'>{t('settings.transactionTypes', dict)}</CardTitle>
          <Button onClick={handleAddTransactionType}>
            <Plus className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
            {t('settings.addTransactionType', dict)}
          </Button>
        </CardHeader>
        <CardContent>
        <div className='bg-white border rounded-xl border-gray-300 overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='border-gray-300 text-black'>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">{t('settings.name', dict)}</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">{t('settings.isActive', dict)}</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">{t('invoice.actions', dict)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.transactionTypes.map((type) => (
                  <TableRow key={type.id} className='border-gray-300 text-black'>
                    <TableCell className="text-right px-4 py-6 text-xs font-bold">
                      {type.name}
                    </TableCell>
                    <TableCell className="text-right px-4 py-6 text-xs font-bold">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        type.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {type.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-4 py-6 text-xs font-bold">
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
