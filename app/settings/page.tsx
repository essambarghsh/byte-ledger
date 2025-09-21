import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getSettings } from '@/lib/data-access'
import { SettingsPage } from '@/components/settings-page'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function SettingsPageRoute() {
  const session = await getSession()
  
  if (!session) {
    redirect('/')
  }

  const settings = await getSettings()

  return (
    <DashboardLayout session={session} defaultOpen={false}>
      <SettingsPage 
        settings={settings}
      />
    </DashboardLayout>
  )
}
