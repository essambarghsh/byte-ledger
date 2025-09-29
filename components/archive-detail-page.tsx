'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateCairo, formatDateTimeCairo } from '@/lib/date-utils'
import { ArchiveData } from '@/types'
import { ArrowLeft, FileText, Calendar, DollarSign, Package, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EmployeeAvatar } from '@/components/employee-avatar'

interface ArchiveDetailPageProps {
  archiveData: ArchiveData
}

export function ArchiveDetailPage({ archiveData }: ArchiveDetailPageProps) {
  const router = useRouter()

  // Calculate statistics from the archive data
  const paidInvoices = archiveData.invoices.filter(invoice => invoice.status === 'paid')
  const withdrawnInvoices = archiveData.invoices.filter(invoice => invoice.status === 'مسحوب')
  const canceledInvoices = archiveData.invoices.filter(invoice => invoice.status === 'canceled')
  const actualSales = [...paidInvoices, ...withdrawnInvoices].reduce((sum, invoice) => sum + invoice.amount, 0)
  const openingBalance = archiveData.totalSales - actualSales

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">تفاصيل الأرشيف</h1>
          <p className="sr-only">
            {formatDateCairo(archiveData.date)} - {archiveData.filename}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <span>العودة لجميع الأرشيفات</span>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المبيعات
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3 mt-1">
              {archiveData.totalSales.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-gray-600">
              شامل الرصيد الافتتاحي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              المبيعات الفعلية
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3 mt-1">
              {actualSales.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-gray-600">
              من الفواتير المدفوعة والمسحوبة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              المبلغ المورد
            </CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3 mt-1">
              {archiveData.suppliedAmount.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-gray-600">
              المبلغ المسلم للإدارة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الرصيد للغد
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3 mt-1">
              {archiveData.openingAmountForNextDay.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-gray-600">
              الرصيد الافتتاحي لليوم التالي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Archive Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            معلومات الأرشيف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2.5 block">تاريخ الإنشاء</label>
              <p className="text-sm">{formatDateTimeCairo(archiveData.createdAt)}</p>
            </div>
            <div className='sr-only'>
              <label className="text-sm font-medium text-gray-500 mb-2.5 block">اسم الملف</label>
              <p className="font-mono text-sm">
                <span dir='ltr'>{archiveData.filename}</span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2.5 block">الرصيد الافتتاحي</label>
              <p className="text-sm">{openingBalance.toLocaleString('en-US')} جنيه</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2.5 block">معرف الموظف المسؤول</label>
              <p className="text-sm">
                <span dir='ltr'>{archiveData.employeeIdWhoArchived}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              إجمالي الفواتير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {archiveData.invoices.length}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              جميع الفواتير في هذا الأرشيف
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-green-800">
              الفواتير المدفوعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {paidInvoices.length}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              بقيمة {paidInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('en-US')} جنيه
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-orange-800">
              الفواتير المسحوبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {withdrawnInvoices.length}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              بقيمة {withdrawnInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('en-US')} جنيه
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-800">
              الفواتير الملغية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              {canceledInvoices.length}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              بقيمة {canceledInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('en-US')} جنيه
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>فواتير هذا الأرشيف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">رقم الفاتورة</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">نوع المعاملة</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">اسم العميل</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">الوصف</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">المبلغ</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">الحالة</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">الموظف</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">تاريخ الإنشاء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archiveData.invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      لا توجد فواتير في هذا الأرشيف
                    </TableCell>
                  </TableRow>
                ) : (
                  archiveData.invoices
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="text-right font-mono text-sm h-16 px-4">
                          {invoice.id.slice(-8)}
                        </TableCell>
                        <TableCell className="text-right h-16 px-4">
                          {invoice.transactionType}
                        </TableCell>
                        <TableCell className="text-right h-16 px-4">
                          {invoice.customerName || 'غير محدد'}
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.description || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium h-16 px-4">
                          {invoice.amount.toLocaleString('en-US')} جنيه
                        </TableCell>
                        <TableCell className="text-right h-16 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'canceled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {invoice.status === 'paid' ? 'مدفوع' :
                              invoice.status === 'canceled' ? 'ملغي' :
                                invoice.status === 'مسحوب' ? 'مسحوب' : 'معلق'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right h-16 px-4">
                          <EmployeeAvatar
                            name={invoice.employeeName}
                            avatar={invoice.employeeAvatar}
                            size="sm"
                            showName={true}
                            nameClassName="text-sm"
                          />
                        </TableCell>
                        <TableCell className="text-right h-16 px-4">
                          {formatDateTimeCairo(invoice.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
