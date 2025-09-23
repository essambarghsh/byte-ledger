import { NextRequest, NextResponse } from 'next/server'
import { updateEmployee, getEmployees } from '@/lib/data-access'
import { Employee } from '@/types'
import { hashPassword, validatePassword, verifyPassword } from '@/lib/password-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const employees = await getEmployees()
    const employee = employees.find(emp => emp.id === employeeId)

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, avatar, isActive, password, currentPassword } = body

    const updates: Partial<Omit<Employee, 'id' | 'createdAt'>> = {}
    if (name !== undefined) updates.name = name
    if (avatar !== undefined) updates.avatar = avatar
    if (isActive !== undefined) updates.isActive = isActive

    // Handle password update
    if (password !== undefined) {
      // Get current employee data to check existing password
      const employees = await getEmployees()
      const employee = employees.find(emp => emp.id === employeeId)
      
      if (!employee) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        )
      }

      // If employee has existing password, verify current password
      if (employee.passwordHash && !currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        )
      }

      if (employee.passwordHash && currentPassword) {
        const isCurrentPasswordValid = await verifyPassword(currentPassword, employee.passwordHash)
        if (!isCurrentPasswordValid) {
          return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 401 }
          )
        }
      }

      // Validate new password
      if (password === '') {
        // Remove password (set to null/undefined)
        updates.passwordHash = undefined
      } else {
        const validation = validatePassword(password)
        if (!validation.isValid) {
          return NextResponse.json(
            { error: validation.errors.join(', ') },
            { status: 400 }
          )
        }

        // Hash the new password
        updates.passwordHash = await hashPassword(password)
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedEmployee = await updateEmployee(employeeId, updates)

    if (!updatedEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}