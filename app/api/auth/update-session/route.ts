import { NextResponse } from 'next/server'
import { getSession, setSession } from '@/lib/session'
import { getEmployees } from '@/lib/data-access'

export async function POST() {
  try {
    const currentSession = await getSession()
    
    if (!currentSession) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    // Get the latest employee data
    const employees = await getEmployees()
    const currentEmployee = employees.find(emp => emp.id === currentSession.employeeId)
    
    if (!currentEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Update session with latest employee data
    const updatedSession = {
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeAvatar: currentEmployee.avatar || ''
    }

    await setSession(updatedSession)
    
    return NextResponse.json({ 
      success: true,
      session: updatedSession
    })
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}
