import { NextResponse } from 'next/server';
import { archiveTodaysData } from '@/lib/utils';

export async function POST() {
  try {
    await archiveTodaysData();
    return NextResponse.json({ success: true, message: 'Day archived successfully' });
  } catch (error) {
    console.error('Error archiving day:', error);
    return NextResponse.json({ error: 'Failed to archive day' }, { status: 500 });
  }
}
