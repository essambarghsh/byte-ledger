export interface Employee {
  id: number;
  name: string;
  nameEn: string;
}

export interface OperationTypeData {
  id: string;
  name: string; // Arabic name only
}

export interface SettingsData {
  operationTypes: OperationTypeData[];
}

export interface Sale {
  id: string;
  operationType: string; // Changed from hardcoded union to string to support dynamic types
  customerName: string;
  transactionStatus: 'paid' | 'partially-paid' | 'not-paid' | 'refunded' | 'voided';
  productPrice: number;
  unpaidAmount: number;
  employeeId: number;
  createdAt: string;
}

export interface DailySales {
  date: string;
  sales: Sale[];
}

export interface ArchiveData {
  date: string;
  sales: Sale[];
  totalRevenue: number;
}

export type OperationType = string; // Changed to string to support dynamic types
export type TransactionStatus = 'paid' | 'partially-paid' | 'not-paid' | 'refunded' | 'voided';
// Keep PaymentStatus for backward compatibility during migration
export type PaymentStatus = TransactionStatus;
