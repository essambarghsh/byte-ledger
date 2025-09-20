import { NextRequest, NextResponse } from 'next/server';
import { updateSale, deleteSale, validateSalePricing, determineTransactionStatus } from '@/lib/utils';
import { Sale } from '@/lib/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const updates: Partial<Sale> = {};

    // Validate pricing structure if both are provided
    const productPrice = body.productPrice !== undefined ? Number(body.productPrice) : undefined;
    const unpaidAmount = body.unpaidAmount !== undefined ? Number(body.unpaidAmount) : undefined;
    
    if (productPrice !== undefined && unpaidAmount !== undefined) {
      if (!validateSalePricing(productPrice, unpaidAmount)) {
        return NextResponse.json(
          { error: 'Invalid pricing: Unpaid amount must be less than or equal to product price' }, 
          { status: 400 }
        );
      }
      
      // Auto-determine correct transaction status based on unpaid amount
      const correctStatus = determineTransactionStatus(productPrice, unpaidAmount);
      updates.transactionStatus = correctStatus;
    }
    if (body.operationType) updates.operationType = body.operationType;
    if (body.customerName) updates.customerName = body.customerName;
    // Note: transactionStatus is now auto-determined above based on unpaidAmount
    if (productPrice !== undefined) updates.productPrice = productPrice;
    if (unpaidAmount !== undefined) updates.unpaidAmount = unpaidAmount;
    if (body.employeeId) updates.employeeId = Number(body.employeeId);

    const updatedSale = await updateSale(id, updates);
    
    if (!updatedSale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteSale(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
  }
}
