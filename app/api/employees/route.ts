import { NextResponse } from 'next/server';
import { readEmployees } from '@/lib/utils';

export async function GET() {
  try {
    const employees = await readEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}
