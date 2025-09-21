import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { EmployeeSelection } from '@/components/employee-selection'

export default async function HomePage() {
  const session = await getSession()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <EmployeeSelection />
    </div>
  )
}