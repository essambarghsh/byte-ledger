import { NextRequest, NextResponse } from 'next/server';
import { readArchiveData } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const archiveData = await readArchiveData(date);
    
    if (!archiveData) {
      return NextResponse.json({ error: 'No data found for this date' }, { status: 404 });
    }

    return NextResponse.json(archiveData);
  } catch (error) {
    console.error('Error fetching archive data:', error);
    return NextResponse.json({ error: 'Failed to fetch archive data' }, { status: 500 });
  }
}
