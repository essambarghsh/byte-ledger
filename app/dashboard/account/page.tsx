import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AccountPage } from '@/components/account-page'

export default async function AccountPageRoute() {
  const session = await getSession()
  
  if (!session) {
    redirect('/')
  }

  return (
    <DashboardLayout session={session}>
      <AccountPage session={session} />
    </DashboardLayout>
  )
}
