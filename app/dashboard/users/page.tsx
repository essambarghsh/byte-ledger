import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { DashboardLayout } from '@/components/dashboard-layout'
import { UsersPage } from '@/components/users-page'

export default async function UsersPageRoute() {
  const session = await getSession()
  
  if (!session) {
    redirect('/')
  }

  return (
    <DashboardLayout session={session}>
      <UsersPage />
    </DashboardLayout>
  )
}
