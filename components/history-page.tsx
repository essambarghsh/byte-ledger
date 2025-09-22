'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDictionary, t } from '@/lib/i18n'
import { formatDateCairo } from '@/lib/date-utils'
import { Archive } from '@/types'
import { useRouter } from 'next/navigation'
import { Counter } from './ui/counter'
import { MynauiClockWavesSolid } from './icons/MynauiClockWavesSolid'

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
        <h1 className="text-base font-black">{t('history.title', dict)}</h1>
      </div>

      {/* Statistics Cards */}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        <div className="p-4 bg-white border border-gray-300 rounded-xl">
          <div className="flex">
            <span className='text-xs font-semibold text-gray-600 flex items-center leading-none flex-1'>
              {t('history.totalSalesMonth', dict)}
            </span>
            <div className="flex h-1.5 w-12 bg-black rounded-full"></div>
          </div>
          <div className="mt-6 flex items-center">
            <div className="flex items-center flex-1">
              <span className='size-13 bg-black/10 rounded-full flex items-center justify-center border border-black/15 ml-4 ltr:ml-0 ltr:mr-4'>
                <MynauiClockWavesSolid className='size-7 text-black' />
              </span>
              <div className="flex">
                <span className='text-3xl font-black text-black flex leading-none'>
                  <Counter
                    value={monthlyTotal}
                    duration={1800}
                    className="text-black"
                  />
                </span>
                <span className='text-base font-bold text-gray-600/80 flex items-center leading-none mr-2 ltr:mr-0 ltr:ml-2'>
                  {t('common.egp')}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-300 rounded-xl">
          <div className="flex">
            <span className='text-xs font-semibold text-gray-600 flex items-center leading-none flex-1'>
              {t('history.totalSalesYear', dict)}
            </span>
            <div className="flex h-1.5 w-12 bg-black rounded-full"></div>
          </div>
          <div className="mt-6 flex items-center">
            <div className="flex items-center flex-1">
              <span className='size-13 bg-black/10 rounded-full flex items-center justify-center border border-black/15 ml-4 ltr:ml-0 ltr:mr-4'>
                <MynauiClockWavesSolid className='size-7 text-black' />
              </span>
              <div className="flex">
                <span className='text-3xl font-black text-black flex leading-none'>
                  <Counter
                    value={yearlyTotal}
                    duration={1800}
                    className="text-black"
                  />
                </span>
                <span className='text-base font-bold text-gray-600/80 flex items-center leading-none mr-2 ltr:mr-0 ltr:ml-2'>
                  {t('common.egp')}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-300 rounded-xl">
          <div className="flex">
            <span className='text-xs font-semibold text-gray-600 flex items-center leading-none flex-1'>
              {t('dashboard.salesYesterday', dict)}
            </span>
            <div className="flex h-1.5 w-12 bg-black rounded-full"></div>
          </div>
          <div className="mt-6 flex items-center">
            <div className="flex items-center flex-1">
              <span className='size-13 bg-black/10 rounded-full flex items-center justify-center border border-black/15 ml-4 ltr:ml-0 ltr:mr-4'>
                <MynauiClockWavesSolid className='size-7 text-black' />
              </span>
              <div className="flex">
                <span className='text-3xl font-black text-black flex leading-none'>
                  <Counter
                    value={yesterdayTotal}
                    duration={1800}
                    className="text-black"
                  />
                </span>
                <span className='text-base font-bold text-gray-600/80 flex items-center leading-none mr-2 ltr:mr-0 ltr:ml-2'>
                  {t('common.egp')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Archives Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('history.archives', dict)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='bg-white border rounded-xl border-gray-300 overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='border-gray-300 text-black'>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">{t('history.date', dict)}</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">{t('archive.totalSales', dict)}</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">{t('archive.suppliedAmount', dict)}</TableHead>
                  <TableHead className="text-right h-16 px-4 text-xs font-bold">{t('archive.openingBalance', dict)}</TableHead>
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
                        className="cursor-pointer hover:bg-primary/10 transition-colors border-gray-300 hover:text-primary"
                        onClick={() => handleArchiveClick(archive.id)}
                      >
                        <TableCell className="text-right px-4 py-6 text-xs font-bold">
                          {formatDateCairo(archive.date)}
                        </TableCell>
                        <TableCell className="text-right px-4 py-6 text-xs font-bold">
                          {archive.totalSales.toLocaleString('en-US')} جنيه
                        </TableCell>
                        <TableCell className="text-right px-4 py-6 text-xs font-bold">
                          {archive.suppliedAmount.toLocaleString('en-US')} جنيه
                        </TableCell>
                        <TableCell className="text-right px-4 py-6 text-xs font-bold">
                          {archive.openingAmountForNextDay.toLocaleString('en-US')} جنيه
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
