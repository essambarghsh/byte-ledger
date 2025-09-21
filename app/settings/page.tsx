import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getEmployees, getSettings } from '@/lib/data-access'
import { SettingsPage } from '@/components/settings-page'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function SettingsPageRoute() {
  const session = await getSession()
  
  if (!session) {
    redirect('/')
  }

  const [employees, settings] = await Promise.all([
    getEmployees(),
    getSettings()
  ])

  return (
    <DashboardLayout session={session}>
      <SettingsPage 
        employees={employees} 
        settings={settings}
        currentEmployeeId={session.employeeId}
      />
    </DashboardLayout>
  )
}
