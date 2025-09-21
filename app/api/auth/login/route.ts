import { NextRequest, NextResponse } from 'next/server'
import { setSession } from '@/lib/session'
import { SessionData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: SessionData = await request.json()
    
    if (!body.employeeId || !body.employeeName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await setSession(body)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
