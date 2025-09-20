import { Sale } from './types';

// Client-side utility functions for the new pricing structure
export function calculateAmountPaid(sale: Sale): number {
  return sale.productPrice - sale.unpaidAmount;
}

export function validateSalePricing(productPrice: number, unpaidAmount: number): boolean {
return unpaidAmount >= 0 && unpaidAmount <= productPrice;
}

export function determineTransactionStatus(productPrice: number, unpaidAmount: number): 'paid' | 'partially-paid' | 'not-paid' {
  if (unpaidAmount === 0) {
    return 'paid';
  } else if (unpaidAmount > 0 && unpaidAmount < productPrice) {
    return 'partially-paid';
  } else if (unpaidAmount === productPrice) {
    return 'not-paid';
  } else {
    // Invalid case - fallback to partially-paid if unpaidAmount > productPrice
    return 'partially-paid';
  }
}

// Migration function to convert old data structure to new structure
export function migrateSaleData(sale: Partial<Sale> & { amountPaid?: number; amountUnpaid?: number }): Sale {
  // Base sale object with required fields
  const baseSale: Sale = {
    id: sale.id || '',
    operationType: sale.operationType || 'product-sale',
    customerName: sale.customerName || '',
    transactionStatus: sale.transactionStatus || 'paid',
    productPrice: 0,
    unpaidAmount: 0,
    employeeId: sale.employeeId || 1,
    createdAt: sale.createdAt || new Date().toISOString()
  };

  // If it's already in the new format, return with proper defaults
  if (sale.productPrice !== undefined && sale.unpaidAmount !== undefined) {
    return {
      ...baseSale,
      ...sale,
      productPrice: sale.productPrice,
      unpaidAmount: sale.unpaidAmount
    };
  }
  
  // If it's in the old format, migrate it
  if (sale.amountPaid !== undefined && sale.amountUnpaid !== undefined) {
    const productPrice = sale.amountPaid + sale.amountUnpaid;
    return {
      ...baseSale,
      ...sale,
      productPrice: productPrice,
      unpaidAmount: sale.amountUnpaid || 0
    };
  }
  
  // Fallback for any other format
  return {
    ...baseSale,
    ...sale,
    productPrice: sale.amountPaid || 0,
    unpaidAmount: 0
  };
}

export function calculateTotalRevenue(sales: Sale[]): number {
  return sales.reduce((total, sale) => total + calculateAmountPaid(sale), 0);
}
