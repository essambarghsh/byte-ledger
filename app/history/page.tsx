import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getArchives } from '@/lib/data-access'
import { HistoryPage } from '@/components/history-page'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function HistoryPageRoute() {
  const session = await getSession()
  
  if (!session) {
    redirect('/')
  }

  const archives = await getArchives()

  return (
    <DashboardLayout session={session} defaultOpen={false}>
      <HistoryPage archives={archives} />
    </DashboardLayout>
  )
}
