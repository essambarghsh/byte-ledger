import { NextRequest, NextResponse } from 'next/server';
import { readTodaysSales, addSale, validateSalePricing, determineTransactionStatus } from '@/lib/utils';
import { Sale } from '@/lib/types';

export async function GET() {
  try {
    const salesData = await readTodaysSales();
    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate pricing structure
    const productPrice = Number(body.productPrice) || 0;
    const unpaidAmount = Number(body.unpaidAmount) || 0;
    
    if (!validateSalePricing(productPrice, unpaidAmount)) {
      return NextResponse.json(
        { error: 'Invalid pricing: Unpaid amount must be less than or equal to product price' }, 
        { status: 400 }
      );
    }
    
    // Auto-determine correct transaction status based on unpaid amount
    const correctStatus = determineTransactionStatus(productPrice, unpaidAmount);
    
    const saleData: Omit<Sale, 'id' | 'createdAt'> = {
      operationType: body.operationType,
      customerName: body.customerName,
      transactionStatus: correctStatus, // Use auto-determined status
      productPrice: productPrice,
      unpaidAmount: unpaidAmount,
      employeeId: Number(body.employeeId)
    };

    const newSale = await addSale(saleData);
    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}
