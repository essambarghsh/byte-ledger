import { NextRequest, NextResponse } from 'next/server'
import { updateEmployee } from '@/lib/data-access'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params
    
    const updatedEmployee = await updateEmployee(id, body)
    
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, avatar, isActive } = body
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const { addEmployee } = await import('@/lib/data-access')
    const newEmployee = await addEmployee({
      name,
      avatar: avatar || '',
      isActive: isActive !== undefined ? isActive : true
    })
    
    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
