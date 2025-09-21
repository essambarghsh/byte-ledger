import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getUnarchivedInvoices, getYesterdaySales, getTodaysOpeningBalance } from '@/lib/data-access'
import { Dashboard } from '@/components/dashboard'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/')
  }

  const [invoices, yesterdaySales, openingBalance] = await Promise.all([
    getUnarchivedInvoices(),
    getYesterdaySales(),
    getTodaysOpeningBalance()
  ])

  return (
    <DashboardLayout session={session}>
      <Dashboard 
        invoices={invoices} 
        session={session} 
        yesterdaySales={yesterdaySales}
        openingBalance={openingBalance}
      />
    </DashboardLayout>
  )
}
