import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getArchives, getArchiveData } from '@/lib/data-access'
import { ArchiveDetailPage } from '@/components/archive-detail-page'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function ArchiveDetailPageRoute({
  params
}: {
  params: Promise<{ archiveId: string }>
}) {
  const session = await getSession()
  
  if (!session) {
    redirect('/')
  }

  const { archiveId } = await params

  // Get all archives to find the one with matching ID
  const archives = await getArchives()
  const archive = archives.find(a => a.id === archiveId)
  
  if (!archive) {
    redirect('/history')
  }

  // Get the full archive data including invoices
  const archiveData = await getArchiveData(archive.filename)
  
  if (!archiveData) {
    redirect('/history')
  }

  return (
    <DashboardLayout session={session} defaultOpen={false}>
      <ArchiveDetailPage archiveData={archiveData} />
    </DashboardLayout>
  )
}
