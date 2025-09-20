import { NextResponse } from 'next/server';
import { readTodaysSales, getYesterdayRevenue, calculateTotalRevenue } from '@/lib/utils';

export async function GET() {
  try {
    const todaysSales = await readTodaysSales();
    const todayRevenue = calculateTotalRevenue(todaysSales.sales);
    const yesterdayRevenue = await getYesterdayRevenue();

    return NextResponse.json({
      today: todayRevenue,
      yesterday: yesterdayRevenue
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 });
  }
}
