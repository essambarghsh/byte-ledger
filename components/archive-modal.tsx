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
    } catch {
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

        <form onSubmit={handleSubmit}>
          <div className="bg-gray-100 p-8 mb-8 mt-4 rounded-2xl">
            <div className="flex justify-between mb-4 font-bold text-sm">
              <span>{t('archive.totalSales', dict)}:</span>
              <span>{totalSales.toLocaleString('en-US')} جنيه</span>
            </div>
            {openingBalance > 0 && (
              <>
                <div className="flex justify-between text-xs font-bold text-gray-600 mb-4">
                  <span>المبيعات الفعلية اليوم:</span>
                  <span>{(totalSales - openingBalance).toLocaleString('en-US')} جنيه</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>الرصيد الافتتاحي:</span>
                  <span>{openingBalance.toLocaleString('en-US')} جنيه</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label className='flex mb-3 text-xs font-bold text-gray-600' htmlFor="suppliedAmount">
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
            <p className="text-xs text-gray-600 mt-3">
              إذا تُرك فارغاً، سيكون الرصيد الافتتاحي للغد هو إجمالي المبيعات
            </p>
          </div>

          <div className="bg-blue-50 p-5 rounded-lg mt-8 mb-4">
            <div className="flex justify-between items-center text-xs font-black">
              <span>{t('archive.openingBalance', dict)}:</span>
              <span className="text-primary text-lg">
                {openingBalanceForNextDay.toLocaleString('en-US')} جنيه
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('archive.cancel', dict)}
            </Button>
            <Button className='mr-4' type="submit" disabled={loading}>
              {loading ? t('common.loading', dict) : t('archive.confirm', dict)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
