import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getInvoices } from '@/lib/data-access'
import { Dashboard } from '@/components/dashboard'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/')
  }

  const invoices = await getInvoices()

  return (
    <DashboardLayout session={session}>
      <Dashboard invoices={invoices} session={session} />
    </DashboardLayout>
  )
}
