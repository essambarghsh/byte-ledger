'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDictionary, t } from '@/lib/i18n'
import { formatDateCairo, formatDateTimeCairo } from '@/lib/date-utils'
import { ArchiveData } from '@/types'
import { ArrowLeft, FileText, User, Calendar, DollarSign, Package, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ArchiveDetailPageProps {
  archiveData: ArchiveData
}

export function ArchiveDetailPage({ archiveData }: ArchiveDetailPageProps) {
  const dict = getDictionary()
  const router = useRouter()

  // Calculate statistics from the archive data
  const paidInvoices = archiveData.invoices.filter(invoice => invoice.status === 'paid')
  const canceledInvoices = archiveData.invoices.filter(invoice => invoice.status === 'canceled')
  const actualSales = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const openingBalance = archiveData.totalSales - actualSales

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة إلى السجل
        </Button>
        <div>
          <h1 className="text-2xl font-bold">تفاصيل الأرشيف</h1>
          <p className="text-muted-foreground">
            {formatDateCairo(archiveData.date)} - {archiveData.filename}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المبيعات
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {archiveData.totalSales.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-muted-foreground">
              شامل الرصيد الافتتاحي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              المبيعات الفعلية
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {actualSales.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-muted-foreground">
              من الفواتير المدفوعة فقط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              المبلغ المورد
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {archiveData.suppliedAmount.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-muted-foreground">
              المبلغ المسلم للإدارة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الرصيد للغد
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {archiveData.openingAmountForNextDay.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-muted-foreground">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</label>
              <p className="text-lg">{formatDateTimeCairo(archiveData.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">اسم الملف</label>
              <p className="font-mono text-sm">{archiveData.filename}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">الرصيد الافتتاحي</label>
              <p className="text-lg">{openingBalance.toLocaleString('en-US')} جنيه</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">معرف الموظف المسؤول</label>
              <p className="text-lg">{archiveData.employeeIdWhoArchived}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <p className="text-xs text-muted-foreground">
              جميع الفواتير في هذا الأرشيف
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-green-600">
              الفواتير المدفوعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidInvoices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              بقيمة {actualSales.toLocaleString('en-US')} جنيه
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-600">
              الفواتير الملغية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {canceledInvoices.length}
            </div>
            <p className="text-xs text-muted-foreground">
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
                  <TableHead className="text-right">رقم الفاتورة</TableHead>
                  <TableHead className="text-right">نوع المعاملة</TableHead>
                  <TableHead className="text-right">اسم العميل</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archiveData.invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد فواتير في هذا الأرشيف
                    </TableCell>
                  </TableRow>
                ) : (
                  archiveData.invoices
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="text-right font-mono text-sm">
                          {invoice.id.slice(-8)}
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.transactionType}
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.customerName || 'غير محدد'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {invoice.amount.toLocaleString('en-US')} جنيه
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : invoice.status === 'canceled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status === 'paid' ? 'مدفوع' : 
                             invoice.status === 'canceled' ? 'ملغي' : 'معلق'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-3 w-3" />
                            </div>
                            <span className="text-sm">{invoice.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
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
