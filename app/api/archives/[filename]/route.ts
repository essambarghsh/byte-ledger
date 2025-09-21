import { NextRequest, NextResponse } from 'next/server'
import { getArchiveData } from '@/lib/data-access'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const archiveData = await getArchiveData(decodeURIComponent(filename))
    
    if (!archiveData) {
      return NextResponse.json(
        { error: 'Archive not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(archiveData)
  } catch (error) {
    console.error('Error fetching archive:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archive' },
      { status: 500 }
    )
  }
}
