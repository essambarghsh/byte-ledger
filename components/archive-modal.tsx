'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDictionary, t } from '@/lib/i18n'
import { toast } from 'sonner'

interface ArchiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalSales: number
  openingBalance: number
  employeeId: string
  onComplete: () => void
}

export function ArchiveModal({
  open,
  onOpenChange,
  totalSales,
  openingBalance,
  employeeId,
  onComplete
}: ArchiveModalProps) {
  const [suppliedAmount, setSuppliedAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const dict = getDictionary()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = suppliedAmount === '' ? 0 : parseFloat(suppliedAmount)
    
    if (isNaN(amount) || amount < 0) {
      toast.error('يرجى إدخال مبلغ صحيح')
      return
    }

    if (amount > totalSales) {
      toast.error(t('archive.validation.amountTooHigh', dict))
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/archives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suppliedAmount: amount,
          openingBalance,
          employeeId
        }),
      })

      if (response.ok) {
        toast.success(t('archive.success', dict))
        onComplete()
        onOpenChange(false)
        setSuppliedAmount('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ في الأرشفة')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const openingBalanceForNextDay = totalSales - (suppliedAmount === '' ? 0 : parseFloat(suppliedAmount) || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('archive.title', dict)}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">{t('archive.totalSales', dict)}:</span>
              <span>{totalSales.toLocaleString('ar-EG')} جنيه</span>
            </div>
            {openingBalance > 0 && (
              <>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>المبيعات الفعلية اليوم:</span>
                  <span>{(totalSales - openingBalance).toLocaleString('ar-EG')} جنيه</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>الرصيد الافتتاحي:</span>
                  <span>{openingBalance.toLocaleString('ar-EG')} جنيه</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="suppliedAmount">
              {t('archive.suppliedAmount', dict)} ({t('common.optional', dict)})
            </Label>
            <Input
              id="suppliedAmount"
              type="number"
              step="0.01"
              min="0"
              max={totalSales}
              value={suppliedAmount}
              onChange={(e) => setSuppliedAmount(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-sm text-muted-foreground">
              إذا تُرك فارغاً، سيكون الرصيد الافتتاحي للغد هو إجمالي المبيعات
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">{t('archive.openingBalance', dict)}:</span>
              <span className="font-bold text-blue-600">
                {openingBalanceForNextDay.toLocaleString('ar-EG')} جنيه
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('archive.cancel', dict)}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.loading', dict) : t('archive.confirm', dict)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
