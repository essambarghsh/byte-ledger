import { NextRequest, NextResponse } from 'next/server'
import { setFakeDate, getFakeDate } from '@/lib/date-utils'

export async function GET() {
  try {
    const fakeDate = getFakeDate()
    return NextResponse.json({ 
      fakeDate: fakeDate?.toISOString() || null,
      currentRealDate: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting fake date:', error)
    return NextResponse.json(
      { error: 'Failed to get fake date' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dateString } = body
    
    if (dateString) {
      const fakeDate = new Date(dateString)
      if (isNaN(fakeDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        )
      }
      setFakeDate(fakeDate)
      return NextResponse.json({ 
        message: 'Fake date set successfully',
        fakeDate: fakeDate.toISOString()
      })
    } else {
      // Reset to real date
      setFakeDate(null)
      return NextResponse.json({ 
        message: 'Fake date reset to real time',
        fakeDate: null
      })
    }
  } catch (error) {
    console.error('Error setting fake date:', error)
    return NextResponse.json(
      { error: 'Failed to set fake date' },
      { status: 500 }
    )
  }
}

