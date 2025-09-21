import { NextRequest, NextResponse } from 'next/server'
import { getEmployees, addEmployee } from '@/lib/data-access'

export async function GET() {
  try {
    const employees = await getEmployees()
    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
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
