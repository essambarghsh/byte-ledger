import { NextRequest, NextResponse } from 'next/server'
import { setSession } from '@/lib/session'
import { SessionData } from '@/types'
import { getEmployees } from '@/lib/data-access'
import { verifyPassword } from '@/lib/password-utils'

export async function POST(request: NextRequest) {
  try {
    const body: SessionData & { password?: string } = await request.json()
    
    if (!body.employeeId || !body.employeeName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the employee in the database
    const employees = await getEmployees()
    const employee = employees.find(emp => emp.id === body.employeeId)
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    if (!employee.isActive) {
      return NextResponse.json(
        { error: 'Employee account is disabled' },
        { status: 403 }
      )
    }

    // Check password if employee has one set
    if (employee.passwordHash) {
      if (!body.password) {
        return NextResponse.json(
          { error: 'Password required' },
          { status: 400 }
        )
      }

      const isPasswordValid = await verifyPassword(body.password, employee.passwordHash)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }
    }

    // Create session data (exclude password from session)
    const sessionData: SessionData = {
      employeeId: body.employeeId,
      employeeName: body.employeeName,
      employeeAvatar: body.employeeAvatar
    }

    await setSession(sessionData)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
