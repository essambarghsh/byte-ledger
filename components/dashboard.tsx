'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InvoiceTable } from '@/components/invoice-table'
import { ArchiveModal } from '@/components/archive-modal'
import { getDictionary, t } from '@/lib/i18n'
import { Invoice, SessionData } from '@/types'
import { isToday, isYesterday } from '@/lib/date-utils'
import { Archive, Plus } from 'lucide-react'

interface DashboardProps {
  invoices: Invoice[]
  session: SessionData
}

export function Dashboard({ invoices: initialInvoices, session }: DashboardProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const dict = getDictionary()

  // Calculate statistics
  const stats = useMemo(() => {
    const todayInvoices = invoices.filter(invoice => 
      invoice.status === 'paid' && isToday(invoice.createdAt) && !invoice.isArchived
    )
    const yesterdayInvoices = invoices.filter(invoice => 
      invoice.status === 'paid' && isYesterday(invoice.createdAt) && !invoice.isArchived
    )

    const salesToday = todayInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const salesYesterday = yesterdayInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    
    // For now, opening balance is 0 - this would come from the last archive
    const openingBalance = 0

    return {
      salesToday,
      salesYesterday,
      openingBalance
    }
  }, [invoices])

  const handleInvoiceUpdate = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices)
  }

  const handleArchiveComplete = () => {
    // Refresh invoices after archiving
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.salesToday', dict)}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">💰</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.salesToday.toLocaleString('ar-EG')} جنيه
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي المبيعات اليوم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.salesYesterday', dict)}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📊</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.salesYesterday.toLocaleString('ar-EG')} جنيه
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي مبيعات أمس
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.openingBalance', dict)}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🏦</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.openingBalance.toLocaleString('ar-EG')} جنيه
            </div>
            <p className="text-xs text-muted-foreground">
              الرصيد الافتتاحي لليوم
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">الفواتير</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            onClick={() => setShowArchiveModal(true)}
            variant="outline"
            disabled={stats.salesToday === 0}
          >
            <Archive className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
            {t('dashboard.archiveData', dict)}
          </Button>
        </div>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          <InvoiceTable 
            invoices={invoices}
            session={session}
            onInvoicesUpdate={handleInvoiceUpdate}
          />
        </CardContent>
      </Card>

      {/* Archive Modal */}
      <ArchiveModal
        open={showArchiveModal}
        onOpenChange={setShowArchiveModal}
        totalSales={stats.salesToday}
        employeeId={session.employeeId}
        onComplete={handleArchiveComplete}
      />
    </div>
  )
}
