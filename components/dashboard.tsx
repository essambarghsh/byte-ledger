'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { InvoiceTable } from '@/components/invoice-table'
import { ArchiveModal } from '@/components/archive-modal'
import { getDictionary, t } from '@/lib/i18n'
import { Invoice, SessionData } from '@/types'
import { isToday } from '@/lib/date-utils'
import { Counter } from './ui/counter'
import { SolarMoneyBagBold } from './icons/SolarMoneyBagBold'
import { MingcuteOpenDoorFill } from './icons/MingcuteOpenDoorFill'
import { MynauiClockWavesSolid } from './icons/MynauiClockWavesSolid'

interface DashboardProps {
  invoices: Invoice[]
  session: SessionData
  yesterdaySales: number
  openingBalance: number
}

export function Dashboard({ invoices: initialInvoices, session, yesterdaySales, openingBalance }: DashboardProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const dict = getDictionary()

  // Calculate statistics
  const stats = useMemo(() => {
    const todayInvoices = invoices.filter(invoice =>
      invoice.status === 'paid' && isToday(invoice.createdAt) && !invoice.isArchived
    )

    // Check if there are any unarchived invoices from today (paid or canceled) for archiving
    const todayUnarchivedInvoices = invoices.filter(invoice =>
      (invoice.status === 'paid' || invoice.status === 'canceled') &&
      isToday(invoice.createdAt) &&
      !invoice.isArchived
    )

    const salesToday = todayInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    // Add opening balance to today's total sales
    const totalSalesToday = salesToday + openingBalance

    return {
      salesToday: totalSalesToday,
      salesYesterday: yesterdaySales,
      openingBalance,
      hasUnarchivedInvoicesToday: todayUnarchivedInvoices.length > 0
    }
  }, [invoices, yesterdaySales, openingBalance])

  const handleInvoiceUpdate = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices)
  }

  const handleArchiveComplete = () => {
    // Refresh invoices after archiving
    window.location.reload()
  }

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        <div className="p-4 bg-primary border border-primary rounded-xl">
          <div className="flex">
            <span className='text-xs font-semibold text-white flex items-center leading-none flex-1'>
              {t('dashboard.salesToday')}
            </span>
            <div className="flex h-1.5 w-12 bg-white rounded-full"></div>
          </div>
          <div className="mt-6 flex items-center">
            <div className="flex items-center flex-1">
              <span className='size-13 bg-white/25 rounded-full flex items-center justify-center ml-4 ltr:ml-0 ltr:mr-4'>
                <SolarMoneyBagBold className='size-7 text-white' />
              </span>
              <div className="flex">
                <span className='text-3xl font-black text-white flex leading-none'>
                  <Counter
                    value={stats.salesToday}
                    duration={1800}
                    className="text-white"
                  />
                </span>
                <span className='text-base font-bold text-white/80 flex items-center leading-none mr-2 ltr:mr-0 ltr:ml-2'>
                  {t('common.egp')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-black border border-black rounded-xl">
          <div className="flex">
            <span className='text-xs font-semibold text-white flex items-center leading-none flex-1'>
              {t('dashboard.openingBalance')}
            </span>
            <div className="flex h-1.5 w-12 bg-white rounded-full"></div>
          </div>
          <div className="mt-6 flex items-center">
            <div className="flex items-center flex-1">
              <span className='size-13 bg-white/25 rounded-full flex items-center justify-center ml-4 ltr:ml-0 ltr:mr-4'>
                <MingcuteOpenDoorFill className='size-7 text-white' />
              </span>
              <div className="flex">
                <span className='text-3xl font-black text-white flex leading-none'>
                  <Counter
                    value={stats.openingBalance}
                    duration={1800}
                    className="text-white"
                  />
                </span>
                <span className='text-base font-bold text-white/80 flex items-center leading-none mr-2 ltr:mr-0 ltr:ml-2'>
                  {t('common.egp')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-300 rounded-xl">
          <div className="flex">
            <span className='text-xs font-semibold text-gray-600 flex items-center leading-none flex-1'>
              {t('dashboard.salesYesterday')}
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
                    value={stats.salesYesterday}
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

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-black">الفواتير</h2>
        <div className="flex">
          <Button
            onClick={() => setShowArchiveModal(true)}
            variant="default"
            disabled={!stats.hasUnarchivedInvoicesToday}
            className='flex px-6 py-1 h-14 rounded-xl border-none shadow-none cursor-pointer text-white text-xs font-bold'
          >
            {t('dashboard.archiveData', dict)}
          </Button>
        </div>
      </div>

      {/* Invoice Table */}
      <InvoiceTable
        invoices={invoices}
        session={session}
        onInvoicesUpdate={handleInvoiceUpdate}
      />

      {/* Archive Modal */}
      <ArchiveModal
        open={showArchiveModal}
        onOpenChange={setShowArchiveModal}
        totalSales={stats.salesToday}
        openingBalance={openingBalance}
        employeeId={session.employeeId}
        onComplete={handleArchiveComplete}
      />
    </div>
  )
}
