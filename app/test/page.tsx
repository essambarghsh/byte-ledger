import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { TestToolsPage } from '@/components/test-tools-page'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function TestToolsPageRoute() {
  const session = await getSession()
  
  if (!session) {
    redirect('/')
  }

  return (
    <DashboardLayout session={session}>
      <TestToolsPage />
    </DashboardLayout>
  )
}
