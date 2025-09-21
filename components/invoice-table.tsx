'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClientOnly } from '@/components/ui/client-only'
import { getDictionary, t } from '@/lib/i18n'
import { formatDateTimeCairo } from '@/lib/date-utils'
import { Invoice, SessionData, TransactionType, Employee } from '@/types'
import { Edit, X, Check, Save, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { EmployeeAvatar } from '@/components/employee-avatar'
import { Fa7SolidPlus } from './icons/Fa7SolidPlus'
import { SolarTrashBinTrashOutline } from './icons/SolarTrashBinTrashOutline'

interface InvoiceTableProps {
  invoices: Invoice[]
  session: SessionData
  onInvoicesUpdate: (invoices: Invoice[]) => void
}

interface NewInvoiceFormData {
  transactionType: string
  customerName: string
  description: string
  amount: string
  status: 'paid' | 'pending'
}

interface EditInvoiceFormData {
  transactionType: string
  customerName: string
  description: string
  amount: string
  status: 'paid' | 'pending'
}

export function InvoiceTable({ invoices: initialInvoices, session, onInvoicesUpdate }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([])
  const [employees, setEmployees] = useState<{ [key: string]: Employee }>({})
  const [loading, setLoading] = useState(false)
  const [loadingTransactionTypes, setLoadingTransactionTypes] = useState(true)
  const [loadingPaymentStatus, setLoadingPaymentStatus] = useState(false)
  const [loadingEditPaymentStatus, setLoadingEditPaymentStatus] = useState(false)
  const [newInvoiceData, setNewInvoiceData] = useState<NewInvoiceFormData>({
    transactionType: '',
    customerName: '',
    description: '',
    amount: '',
    status: 'paid'
  })
  const [addingInvoice, setAddingInvoice] = useState(false)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [editInvoiceData, setEditInvoiceData] = useState<EditInvoiceFormData>({
    transactionType: '',
    customerName: '',
    description: '',
    amount: '',
    status: 'paid'
  })
  const [savingInvoice, setSavingInvoice] = useState(false)
  const dict = getDictionary()

  useEffect(() => {
    fetchTransactionTypes()
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (transactionTypes.length > 0 && !newInvoiceData.transactionType) {
      setNewInvoiceData(prev => ({ ...prev, transactionType: transactionTypes[0].name }))
    }
  }, [transactionTypes, newInvoiceData.transactionType])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const employeeList = await response.json()
        const employeeMap = employeeList.reduce((acc: { [key: string]: Employee }, emp: Employee) => {
          acc[emp.id] = emp
          return acc
        }, {})
        setEmployees(employeeMap)
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const fetchTransactionTypes = async () => {
    setLoadingTransactionTypes(true)
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const settings = await response.json()
        setTransactionTypes(settings.transactionTypes || [])
      }
    } catch (error) {
      console.error('Error fetching transaction types:', error)
    } finally {
      setLoadingTransactionTypes(false)
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
    } catch {
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
        description: newInvoiceData.description || null,
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
          description: '',
          amount: '',
          status: 'paid'
        })
        await fetchInvoices()
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch {
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
      description: invoice.description || '',
      amount: invoice.amount.toString(),
      status: invoice.status as 'paid' | 'pending'
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
        description: editInvoiceData.description || null,
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
    } catch {
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
      description: '',
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
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentEmployeeAvatar = (employeeId: string, fallbackAvatar: string) => {
    const currentEmployee = employees[employeeId]
    return currentEmployee ? currentEmployee.avatar : fallbackAvatar
  }

  const getCurrentEmployeeUpdatedAt = (employeeId: string) => {
    const currentEmployee = employees[employeeId]
    return currentEmployee ? currentEmployee.updatedAt : undefined
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
    <>
      {/* Table */}
      <div className='bg-white border rounded-xl border-gray-300 overflow-hidden'>
        <Table>
          <TableHeader className='border-none'>
            <TableRow className='border-gray-300 text-black'>
              <TableHead className="text-right h-14 px-4 text-xs font-bold">{t('invoice.createdAt', dict)}</TableHead>
              <TableHead className="text-right h-14 px-4 text-xs font-bold">{t('invoice.transactionType', dict)}</TableHead>
              <TableHead className="text-right h-14 px-4 text-xs font-bold">{t('invoice.customerName', dict)}</TableHead>
              <TableHead className="text-right h-14 px-4 text-xs font-bold">{t('invoice.description', dict)}</TableHead>
              <TableHead className="text-right h-14 px-4 text-xs font-bold">{t('invoice.amount', dict)}</TableHead>
              <TableHead className="text-right h-14 px-4 text-xs font-bold">{t('invoice.status', dict)}</TableHead>
              <TableHead className="text-center h-14 px-4 text-xs font-bold">{t('invoice.employee', dict)}</TableHead>
              <TableHead className="text-center h-14 px-4 text-xs font-bold">{t('invoice.actions', dict)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* New Invoice Row */}
            <TableRow className="bg-primary/10 border-none relative after:right-0 after:top-0 after:bottom-0 after:w-1 after:h-full after:bg-primary after:absolute">
              <TableCell className="text-right h-14 px-4 text-sm font-bold">
                <span className="text-sm text-primary mr-5">{t('invoice.new', dict)}</span>
              </TableCell>
              <TableCell className="text-right min-w-[200px] p-4">
                <ClientOnly fallback={<div className="h-14 w-full rounded-xl bg-white" />}>
                  <Combobox
                    options={transactionTypes.map((type) => ({ value: type.name, label: type.name }))}
                    value={newInvoiceData.transactionType}
                    onValueChange={(value) => setNewInvoiceData(prev => ({ ...prev, transactionType: value }))}
                    placeholder={t('invoice.transactionType', dict)}
                    searchPlaceholder="البحث..."
                    emptyText="لا توجد أنواع معاملات"
                    className="w-full"
                    loading={loadingTransactionTypes}
                  />
                </ClientOnly>
              </TableCell>
              <TableCell className="text-right max-w-[160px] p-4">
                <Input
                  value={newInvoiceData.customerName}
                  onChange={(e) => setNewInvoiceData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder={t('invoice.customerName', dict)}
                  className="w-full"
                />
              </TableCell>
              <TableCell className="text-right max-w-[260px] p-4">
                <Input
                  value={newInvoiceData.description}
                  onChange={(e) => setNewInvoiceData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('invoice.description', dict)}
                  className="w-full"
                />
              </TableCell>
              <TableCell className="text-right max-w-[170px] p-4">
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={newInvoiceData.amount}
                  onChange={(e) => setNewInvoiceData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder={t('invoice.amount', dict)}
                  className="w-full"
                />
              </TableCell>
              <TableCell className="text-right min-w-[140px] max-w-[140px] p-4">
                <ClientOnly fallback={<div className="h-14 w-full rounded-xl bg-white" />}>
                  <Combobox
                    options={[
                      { value: 'paid', label: t('invoice.paid', dict) },
                      { value: 'pending', label: t('invoice.pending', dict) }
                    ]}
                    value={newInvoiceData.status}
                    onValueChange={(value) => {
                      setLoadingPaymentStatus(true)
                      setNewInvoiceData(prev => ({ ...prev, status: value as 'paid' | 'pending' }))
                      setTimeout(() => setLoadingPaymentStatus(false), 300)
                    }}
                    placeholder="اختر الحالة"
                    searchPlaceholder="البحث..."
                    emptyText="لا توجد حالات"
                    className="w-full"
                    loading={loadingPaymentStatus}
                  />
                </ClientOnly>
              </TableCell>
              <TableCell className="text-center flex justify-center p-4">
                <EmployeeAvatar
                  name={session.employeeName}
                  avatar={getCurrentEmployeeAvatar(session.employeeId, session.employeeAvatar)}
                  size="lg"
                  showName={false}
                  nameClassName="text-sm"
                  updatedAt={getCurrentEmployeeUpdatedAt(session.employeeId)}
                />
              </TableCell>
              <TableCell className="text-left p-4">
                <Button
                  size="sm"
                  onClick={handleAddInvoice}
                  disabled={!isAddButtonEnabled}
                  className="bg-primary hover:bg-primary/90 text-white disabled:bg-primary/15 disabled:text-primary/80 rounded-full size-10 border-none shadow-none cursor-pointer disabled:opacity-100"
                >
                  {addingInvoice ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Fa7SolidPlus className="h-4 w-4" />
                  )}
                  <span className="sr-only">{t('invoice.addInvoice', dict)}</span>
                </Button>
              </TableCell>
            </TableRow>

            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {t('invoice.noInvoices', dict)}
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const isEditing = editingInvoiceId === invoice.id

                return (
                  <TableRow
                    key={invoice.id}
                    className={`border-gray-300 ${isEditing ? 'bg-yellow-100' : 'hover:bg-gray-50 cursor-pointer'}`}
                    onClick={() => !isEditing && handleEditInvoice(invoice)}
                  >
                    <TableCell className="text-right h-14 px-4 text-xs font-bold">
                      {formatDateTimeCairo(invoice.createdAt)}
                    </TableCell>
                    <TableCell className="text-right min-w-[200px] p-4 text-xs font-bold">
                      {isEditing ? (
                        <ClientOnly fallback={<div className="h-14 w-full rounded-xl bg-white" />}>
                          <Combobox
                            options={transactionTypes.map((type) => ({ value: type.name, label: type.name }))}
                            value={editInvoiceData.transactionType}
                            onValueChange={(value) => setEditInvoiceData(prev => ({ ...prev, transactionType: value }))}
                            placeholder={t('invoice.transactionType', dict)}
                            searchPlaceholder="البحث..."
                            emptyText="لا توجد أنواع معاملات"
                            className="w-full"
                            loading={loadingTransactionTypes}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          />
                        </ClientOnly>
                      ) : (
                        invoice.transactionType
                      )}
                    </TableCell>
                    <TableCell className="text-right max-w-[160px] p-4 text-xs font-bold">
                      {isEditing ? (
                        <Input
                          value={editInvoiceData.customerName}
                          onChange={(e) => setEditInvoiceData(prev => ({ ...prev, customerName: e.target.value }))}
                          placeholder={t('invoice.customerName', dict)}
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        invoice.customerName || '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right max-w-[260px] p-4 text-xs font-bold">
                      {isEditing ? (
                        <Input
                          value={editInvoiceData.description}
                          onChange={(e) => setEditInvoiceData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder={t('invoice.description', dict)}
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        invoice.description || '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium p-4">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editInvoiceData.amount}
                          onChange={(e) => setEditInvoiceData(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder={t('invoice.amount', dict)}
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        `${invoice.amount.toLocaleString('en-US')} ${t('common.egp', dict)}`
                      )}
                    </TableCell>
                    <TableCell className="text-right min-w-[140px] max-w-[140px] p-4 text-xs font-bold">
                      {isEditing ? (
                        <ClientOnly fallback={<div className="h-14 w-full rounded-xl bg-white" />}>
                          <Combobox
                            options={[
                              { value: 'paid', label: t('invoice.paid', dict) },
                              { value: 'pending', label: t('invoice.pending', dict) }
                            ]}
                            value={editInvoiceData.status}
                            onValueChange={(value) => {
                              setLoadingEditPaymentStatus(true)
                              setEditInvoiceData(prev => ({ ...prev, status: value as 'paid' | 'pending' }))
                              setTimeout(() => setLoadingEditPaymentStatus(false), 300)
                            }}
                            placeholder="اختر الحالة"
                            searchPlaceholder="البحث..."
                            emptyText="لا توجد حالات"
                            className="w-full"
                            loading={loadingEditPaymentStatus}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          />
                        </ClientOnly>
                      ) : (
                        getStatusBadge(invoice.status)
                      )}
                    </TableCell>
                    <TableCell className="text-center flex justify-center p-4">
                      <EmployeeAvatar
                        name={invoice.employeeName}
                        avatar={getCurrentEmployeeAvatar(invoice.employeeId, invoice.employeeAvatar)}
                        size="lg"
                        showName={false}
                        nameClassName="text-sm"
                        updatedAt={getCurrentEmployeeUpdatedAt(invoice.employeeId)}
                      />
                    </TableCell>
                    <TableCell className="text-left p-4" onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={savingInvoice}
                            className="bg-black/15 hover:bg-black/20 text-black disabled:bg-primary/15 disabled:text-black/80 rounded-full size-10 border-none shadow-none cursor-pointer disabled:opacity-100"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveInvoice(invoice.id)}
                            disabled={!editInvoiceData.transactionType || !editInvoiceData.amount || savingInvoice}
                            className="mr-2 bg-primary hover:bg-primary/90 text-white disabled:bg-primary/15 disabled:text-primary/80 rounded-full size-10 border-none shadow-none cursor-pointer disabled:opacity-100"
                          >
                            {savingInvoice ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          {invoice.status !== 'canceled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCancelInvoice(invoice)
                              }}
                              disabled={loading}
                              className="bg-red-900/8 hover:bg-red-900/20 text-red-700 disabled:bg-red-900/30 disabled:text-red-900/80 rounded-full size-10 border-none shadow-none cursor-pointer"
                            >
                              <SolarTrashBinTrashOutline className="!size-5" />
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
    </>
  )
}
