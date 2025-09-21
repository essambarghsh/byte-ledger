'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDictionary, t } from '@/lib/i18n'
import { formatDateTimeCairo } from '@/lib/date-utils'
import { Invoice, SessionData, TransactionType } from '@/types'
import { Edit, X, Plus, Check, Save, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface InvoiceTableProps {
  invoices: Invoice[]
  session: SessionData
  onInvoicesUpdate: (invoices: Invoice[]) => void
}

interface NewInvoiceFormData {
  transactionType: string
  customerName: string
  amount: string
  status: 'paid' | 'pending'
}

interface EditInvoiceFormData {
  transactionType: string
  customerName: string
  amount: string
  status: 'paid' | 'pending'
}

export function InvoiceTable({ invoices: initialInvoices, session, onInvoicesUpdate }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([])
  const [loading, setLoading] = useState(false)
  const [newInvoiceData, setNewInvoiceData] = useState<NewInvoiceFormData>({
    transactionType: '',
    customerName: '',
    amount: '',
    status: 'paid'
  })
  const [addingInvoice, setAddingInvoice] = useState(false)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [editInvoiceData, setEditInvoiceData] = useState<EditInvoiceFormData>({
    transactionType: '',
    customerName: '',
    amount: '',
    status: 'paid'
  })
  const [savingInvoice, setSavingInvoice] = useState(false)
  const dict = getDictionary()

  useEffect(() => {
    fetchTransactionTypes()
  }, [])

  useEffect(() => {
    if (transactionTypes.length > 0 && !newInvoiceData.transactionType) {
      setNewInvoiceData(prev => ({ ...prev, transactionType: transactionTypes[0].name }))
    }
  }, [transactionTypes, newInvoiceData.transactionType])

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

  const handleAddInvoice = async () => {
    if (!newInvoiceData.transactionType || !newInvoiceData.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const amount = parseFloat(newInvoiceData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح')
      return
    }

    setAddingInvoice(true)
    try {
      const requestData = {
        transactionType: newInvoiceData.transactionType,
        customerName: newInvoiceData.customerName || null,
        amount,
        status: newInvoiceData.status,
        employeeId: session.employeeId,
        employeeName: session.employeeName,
        employeeAvatar: session.employeeAvatar
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        toast.success('تم إنشاء الفاتورة')
        // Reset form
        setNewInvoiceData({
          transactionType: transactionTypes.length > 0 ? transactionTypes[0].name : '',
          customerName: '',
          amount: '',
          status: 'paid'
        })
        await fetchInvoices()
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setAddingInvoice(false)
    }
  }

  const handleEditInvoice = (invoice: Invoice) => {
    if (invoice.status === 'canceled') return
    
    setEditingInvoiceId(invoice.id)
    setEditInvoiceData({
      transactionType: invoice.transactionType,
      customerName: invoice.customerName || '',
      amount: invoice.amount.toString(),
      status: invoice.status === 'canceled' ? 'paid' : invoice.status
    })
  }

  const handleSaveInvoice = async (invoiceId: string) => {
    if (!editInvoiceData.transactionType || !editInvoiceData.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const amount = parseFloat(editInvoiceData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح')
      return
    }

    setSavingInvoice(true)
    try {
      const requestData = {
        transactionType: editInvoiceData.transactionType,
        customerName: editInvoiceData.customerName || null,
        amount,
        status: editInvoiceData.status
      }

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        toast.success('تم تحديث الفاتورة')
        setEditingInvoiceId(null)
        await fetchInvoices()
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setSavingInvoice(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingInvoiceId(null)
    setEditInvoiceData({
      transactionType: '',
      customerName: '',
      amount: '',
      status: 'paid'
    })
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

  const isAddButtonEnabled = newInvoiceData.transactionType && newInvoiceData.amount && !addingInvoice

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">قائمة الفواتير</h3>
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
            {/* New Invoice Row */}
            <TableRow className="bg-blue-50/30 border-blue-200">
              <TableCell className="text-right">
                <span className="text-sm text-muted-foreground">جديدة</span>
              </TableCell>
              <TableCell className="text-right">
                <Select
                  value={newInvoiceData.transactionType}
                  onValueChange={(value) => setNewInvoiceData(prev => ({ ...prev, transactionType: value }))}
                >
                  <SelectTrigger className="w-full">
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
              </TableCell>
              <TableCell className="text-right">
                <Input
                  value={newInvoiceData.customerName}
                  onChange={(e) => setNewInvoiceData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="اسم العميل (اختياري)"
                  className="w-full"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newInvoiceData.amount}
                  onChange={(e) => setNewInvoiceData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="المبلغ"
                  className="w-full"
                />
              </TableCell>
              <TableCell className="text-right">
                <Select
                  value={newInvoiceData.status}
                  onValueChange={(value: 'paid' | 'pending') => setNewInvoiceData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">{t('invoice.paid', dict)}</SelectItem>
                    <SelectItem value="pending">{t('invoice.pending', dict)}</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold">
                      {session.employeeName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm">{session.employeeName}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  onClick={handleAddInvoice}
                  disabled={!isAddButtonEnabled}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                >
                  {addingInvoice ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span className="mr-2 rtl:mr-0 rtl:ml-2">إضافة فاتورة</span>
                </Button>
              </TableCell>
            </TableRow>

            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد فواتير
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const isEditing = editingInvoiceId === invoice.id
                
                return (
                  <TableRow 
                    key={invoice.id} 
                    className={`${isEditing ? 'bg-yellow-50/30 border-yellow-200' : 'hover:bg-gray-50 cursor-pointer'}`}
                    onClick={() => !isEditing && handleEditInvoice(invoice)}
                  >
                    <TableCell className="text-right">
                      {formatDateTimeCairo(invoice.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Select
                          value={editInvoiceData.transactionType}
                          onValueChange={(value) => setEditInvoiceData(prev => ({ ...prev, transactionType: value }))}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {transactionTypes.map((type) => (
                              <SelectItem key={type.id} value={type.name}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        invoice.transactionType
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          value={editInvoiceData.customerName}
                          onChange={(e) => setEditInvoiceData(prev => ({ ...prev, customerName: e.target.value }))}
                          placeholder="اسم العميل (اختياري)"
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        invoice.customerName || '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editInvoiceData.amount}
                          onChange={(e) => setEditInvoiceData(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="المبلغ"
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        `${invoice.amount.toLocaleString('en-US')} جنيه`
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Select
                          value={editInvoiceData.status}
                          onValueChange={(value: 'paid' | 'pending') => setEditInvoiceData(prev => ({ ...prev, status: value }))}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">{t('invoice.paid', dict)}</SelectItem>
                            <SelectItem value="pending">{t('invoice.pending', dict)}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getStatusBadge(invoice.status)
                      )}
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
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Button
                            size="sm"
                            onClick={() => handleSaveInvoice(invoice.id)}
                            disabled={!editInvoiceData.transactionType || !editInvoiceData.amount || savingInvoice}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                          >
                            {savingInvoice ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={savingInvoice}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditInvoice(invoice)
                            }}
                            disabled={invoice.status === 'canceled'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {invoice.status !== 'canceled' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCancelInvoice(invoice)
                              }}
                              disabled={loading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  )
}
