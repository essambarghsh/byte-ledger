'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { getDictionary, t } from '@/lib/i18n'
import { Invoice, SessionData, TransactionType } from '@/types'
import { toast } from 'sonner'

interface InvoiceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice | null
  session: SessionData
  transactionTypes: TransactionType[]
  onSubmit: () => void
}

interface InvoiceFormData {
  transactionType: string
  customerName: string
  amount: string
  status: 'paid' | 'pending'
}

export function InvoiceFormModal({
  open,
  onOpenChange,
  invoice,
  session,
  transactionTypes,
  onSubmit
}: InvoiceFormModalProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    transactionType: '',
    customerName: '',
    amount: '',
    status: 'paid'
  })
  const [loading, setLoading] = useState(false)
  const dict = getDictionary()

  useEffect(() => {
    if (invoice) {
      setFormData({
        transactionType: invoice.transactionType,
        customerName: invoice.customerName || '',
        amount: invoice.amount.toString(),
        status: invoice.status === 'canceled' ? 'paid' : invoice.status
      })
    } else {
      setFormData({
        transactionType: transactionTypes.length > 0 ? transactionTypes[0].name : '',
        customerName: '',
        amount: '',
        status: 'paid'
      })
    }
  }, [invoice, transactionTypes, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.transactionType || !formData.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح')
      return
    }

    setLoading(true)
    try {
      const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices'
      const method = invoice ? 'PATCH' : 'POST'

      const requestData = {
        transactionType: formData.transactionType,
        customerName: formData.customerName || null,
        amount,
        status: formData.status,
        ...(invoice ? {} : {
          employeeId: session.employeeId,
          employeeName: session.employeeName,
          employeeAvatar: session.employeeAvatar
        })
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        toast.success(invoice ? 'تم تحديث الفاتورة' : 'تم إنشاء الفاتورة')
        onSubmit()
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {invoice ? t('invoice.edit', dict) : t('dashboard.addInvoice', dict)}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transactionType">
              {t('invoice.transactionType', dict)} *
            </Label>
            <Select
              value={formData.transactionType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, transactionType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المعاملة" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">
              {t('invoice.customerName', dict)} ({t('common.optional', dict)})
            </Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="اسم العميل"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              {t('invoice.amount', dict)} *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              {t('invoice.status', dict)} *
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'paid' | 'pending') => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">{t('invoice.paid', dict)}</SelectItem>
                <SelectItem value="pending">{t('invoice.pending', dict)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
  )
}
