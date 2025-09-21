'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDictionary, t } from '@/lib/i18n'
import { formatDateCairo } from '@/lib/date-utils'
import { Archive } from '@/types'
import { useRouter } from 'next/navigation'

interface HistoryPageProps {
  archives: Archive[]
}

export function HistoryPage({ archives }: HistoryPageProps) {
  const dict = getDictionary()
  const router = useRouter()

  const handleArchiveClick = (archiveId: string) => {
    router.push(`/history/${archiveId}`)
  }

  // Calculate statistics from archives
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthlyTotal = archives
    .filter(archive => {
      const archiveDate = new Date(archive.date)
      return archiveDate.getMonth() === currentMonth && archiveDate.getFullYear() === currentYear
    })
    .reduce((sum, archive) => sum + archive.totalSales, 0)

  const yearlyTotal = archives
    .filter(archive => {
      const archiveDate = new Date(archive.date)
      return archiveDate.getFullYear() === currentYear
    })
    .reduce((sum, archive) => sum + archive.totalSales, 0)

  const yesterdayTotal = archives
    .filter(archive => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return archive.date === yesterday.toISOString().split('T')[0]
    })
    .reduce((sum, archive) => sum + archive.totalSales, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('history.title', dict)}</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('history.totalSalesMonth', dict)}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📊</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyTotal.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي مبيعات الشهر الحالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('history.totalSalesYear', dict)}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📈</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {yearlyTotal.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي مبيعات السنة الحالية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.salesYesterday', dict)}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">⏮️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {yesterdayTotal.toLocaleString('en-US')} جنيه
            </div>
            <p className="text-xs text-muted-foreground">
              مبيعات أمس من الأرشيف
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Archives Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('history.archives', dict)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">{t('history.date', dict)}</TableHead>
                  <TableHead className="text-right">{t('archive.totalSales', dict)}</TableHead>
                  <TableHead className="text-right">{t('archive.suppliedAmount', dict)}</TableHead>
                  <TableHead className="text-right">{t('archive.openingBalance', dict)}</TableHead>
                  <TableHead className="text-right">عدد الفواتير</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      لا يوجد أرشيف
                    </TableCell>
                  </TableRow>
                ) : (
                  archives
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((archive) => (
                      <TableRow 
                        key={archive.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleArchiveClick(archive.id)}
                      >
                        <TableCell className="text-right">
                          {formatDateCairo(archive.date)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {archive.totalSales.toLocaleString('en-US')} جنيه
                        </TableCell>
                        <TableCell className="text-right">
                          {archive.suppliedAmount.toLocaleString('en-US')} جنيه
                        </TableCell>
                        <TableCell className="text-right font-medium text-blue-600">
                          {archive.openingAmountForNextDay.toLocaleString('en-US')} جنيه
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          انقر للتفاصيل
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
