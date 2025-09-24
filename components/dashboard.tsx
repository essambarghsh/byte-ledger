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
import { SolarPrinterBold } from './icons/SolarPrinterBold'

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

  const handlePrintInvoices = () => {
    // Get today's invoices
    const todayInvoices = invoices.filter(invoice =>
      invoice.status === 'paid' && isToday(invoice.createdAt) && !invoice.isArchived
    )

    // Calculate total sales
    const salesToday = todayInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('print.title')}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            text-align: right;
            padding: 20px;
            background: white;
            color: black;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .date {
            font-size: 14px;
            color: #666;
          }
          .summary {
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
          }
          .summary-item {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
            min-width: 200px;
            text-align: center;
          }
          .summary-item h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
          }
          .summary-item .value {
            font-size: 20px;
            font-weight: bold;
            color: #000;
          }
          .invoices-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .invoices-table th,
          .invoices-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
          }
          .invoices-table th {
            background: #f5f5f5;
            font-weight: bold;
            font-size: 12px;
          }
          .invoices-table td {
            font-size: 11px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 0;
            }
            .summary {
              break-inside: avoid;
            }
            .invoices-table {
              break-inside: auto;
            }
            .invoices-table tr {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t('print.todayInvoices')}</h1>
          <div class="date">${new Date().toLocaleDateString('ar-EG')}</div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <h3>${t('print.totalSales')}</h3>
            <div class="value">${salesToday} ${t('common.egp')}</div>
          </div>
          <div class="summary-item">
            <h3>${t('print.openingBalance')}</h3>
            <div class="value">${openingBalance} ${t('common.egp')}</div>
          </div>
          <div class="summary-item">
            <h3>إجمالي اليوم</h3>
            <div class="value">${salesToday + openingBalance} ${t('common.egp')}</div>
          </div>
        </div>

        <table class="invoices-table">
          <thead>
            <tr>
              <th>#</th>
              <th>${t('invoice.transactionType')}</th>
              <th>${t('invoice.customerName')}</th>
              <th>${t('invoice.amount')}</th>
              <th>${t('invoice.employee')}</th>
              <th>${t('invoice.createdAt')}</th>
            </tr>
          </thead>
          <tbody>
            ${todayInvoices.length === 0
        ? `<tr><td colspan="6">${t('invoice.noInvoices')}</td></tr>`
        : todayInvoices.map((invoice, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${invoice.transactionType}</td>
                  <td>${invoice.customerName || '-'}</td>
                  <td>${invoice.amount} ${t('common.egp')}</td>
                  <td>${invoice.employeeName}</td>
                  <td>${new Date(invoice.createdAt).toLocaleString('ar-EG')}</td>
                </tr>
              `).join('')
      }
          </tbody>
        </table>

        <div class="footer">
          <p>عدد الفواتير: ${todayInvoices.length}</p>
          <p>تم الطباعة في: ${new Date().toLocaleString('ar-EG')}</p>
        </div>
      </body>
      </html>
    `

    // Open new window with print content
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()

      // Auto-print when loaded
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    }
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
        <div className="flex gap-3">
          <Button
            onClick={handlePrintInvoices}
            variant="outline"
            className='flex items-center gap-2 px-6 py-1 h-14 rounded-xl border border-gray-300 shadow-none bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold'
          >
            <SolarPrinterBold className="w-4 h-4" />
            {t('dashboard.printInvoices')}
          </Button>
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
