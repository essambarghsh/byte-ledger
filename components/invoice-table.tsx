'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { InvoiceFormModal } from '@/components/invoice-form-modal'
import { getDictionary, t } from '@/lib/i18n'
import { formatDateTimeCairo } from '@/lib/date-utils'
import { Invoice, SessionData, TransactionType } from '@/types'
import { Edit, X, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface InvoiceTableProps {
  invoices: Invoice[]
  session: SessionData
  onInvoicesUpdate: (invoices: Invoice[]) => void
}

export function InvoiceTable({ invoices: initialInvoices, session, onInvoicesUpdate }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([])
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(false)
  const dict = getDictionary()

  useEffect(() => {
    fetchTransactionTypes()
  }, [])

  const fetchTransactionTypes = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const settings = await response.json()
        setTransactionTypes(settings.transactionTypes || [])
      }
    } catch (error) {
      console.error('Error fetching transaction types:', error)
    }
  }

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
        onInvoicesUpdate(data)
      }
    } catch (error) {
      toast.error('خطأ في تحميل الفواتير')
    }
  }

  const handleAddInvoice = () => {
    setEditingInvoice(null)
    setShowInvoiceModal(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setShowInvoiceModal(true)
  }

  const handleCancelInvoice = async (invoice: Invoice) => {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'canceled'
        }),
      })

      if (response.ok) {
        toast.success('تم إلغاء الفاتورة')
        await fetchInvoices()
      } else {
        toast.error('خطأ في إلغاء الفاتورة')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleInvoiceSubmit = async () => {
    await fetchInvoices()
    setShowInvoiceModal(false)
    setEditingInvoice(null)
  }

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      paid: { label: t('invoice.paid', dict), className: 'bg-green-100 text-green-800' },
      pending: { label: t('invoice.pending', dict), className: 'bg-yellow-100 text-yellow-800' },
      canceled: { label: t('invoice.canceled', dict), className: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-4 p-6">
      {/* Add Invoice Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">قائمة الفواتير</h3>
        <Button onClick={handleAddInvoice}>
          <Plus className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
          {t('dashboard.addInvoice', dict)}
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">{t('invoice.createdAt', dict)}</TableHead>
              <TableHead className="text-right">{t('invoice.transactionType', dict)}</TableHead>
              <TableHead className="text-right">{t('invoice.customerName', dict)}</TableHead>
              <TableHead className="text-right">{t('invoice.amount', dict)}</TableHead>
              <TableHead className="text-right">{t('invoice.status', dict)}</TableHead>
              <TableHead className="text-right">{t('invoice.employee', dict)}</TableHead>
              <TableHead className="text-right">{t('invoice.actions', dict)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد فواتير
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-right">
                    {formatDateTimeCairo(invoice.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.transactionType}
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.customerName || '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {invoice.amount.toLocaleString('ar-EG')} جنيه
                  </TableCell>
                  <TableCell className="text-right">
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {invoice.employeeName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm">{invoice.employeeName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice)}
                        disabled={invoice.status === 'canceled'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {invoice.status !== 'canceled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvoice(invoice)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invoice Form Modal */}
      <InvoiceFormModal
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
        invoice={editingInvoice}
        session={session}
        transactionTypes={transactionTypes}
        onSubmit={handleInvoiceSubmit}
      />
    </div>
  )
}
