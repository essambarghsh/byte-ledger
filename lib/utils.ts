import { promises as fs } from 'fs';
import path from 'path';
import { DailySales, Sale, Employee, ArchiveData } from './types';
import { format } from 'date-fns';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readEmployees(): Promise<Employee[]> {
  try {
    const filePath = path.join(DATA_DIR, 'employees.json');
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading employees:', error);
    return [];
  }
}

export async function readTodaysSales(): Promise<DailySales> {
  try {
    const filePath = path.join(DATA_DIR, 'sales.json');
    const data = await fs.readFile(filePath, 'utf8');
    const salesData = JSON.parse(data);
    
    // Migrate data to new pricing structure and paymentStatus to transactionStatus
    if (salesData.sales) {
      salesData.sales = salesData.sales.map((sale: Partial<Sale> & { paymentStatus?: string; amountPaid?: number; amountUnpaid?: number }) => {
        let migratedSale = sale;
        
        // Migrate paymentStatus to transactionStatus for backward compatibility
        if (sale.paymentStatus && !sale.transactionStatus) {
          migratedSale = {
            ...migratedSale,
            transactionStatus: sale.paymentStatus as 'paid' | 'partially-paid' | 'not-paid' | 'refunded' | 'voided',
            paymentStatus: undefined
          };
        }
        
        // Migrate pricing structure
        return migrateSaleData(migratedSale);
      });
    }
    
    return salesData;
  } catch (error) {
    console.error('Error reading today\'s sales:', error);
    return {
      date: format(new Date(), 'yyyy-MM-dd'),
      sales: []
    };
  }
}

export async function writeTodaysSales(salesData: DailySales): Promise<void> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, 'sales.json');
    await fs.writeFile(filePath, JSON.stringify(salesData, null, 2));
  } catch (error) {
    console.error('Error writing today\'s sales:', error);
    throw error;
  }
}

export async function readArchiveData(date: string): Promise<ArchiveData | null> {
  try {
    const filePath = path.join(DATA_DIR, `archive-${date}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    const archiveData = JSON.parse(data);
    
    // Migrate data to new pricing structure and paymentStatus to transactionStatus
    if (archiveData.sales) {
      archiveData.sales = archiveData.sales.map((sale: Partial<Sale> & { paymentStatus?: string; amountPaid?: number; amountUnpaid?: number }) => {
        let migratedSale = sale;
        
        // Migrate paymentStatus to transactionStatus for backward compatibility
        if (sale.paymentStatus && !sale.transactionStatus) {
          migratedSale = {
            ...migratedSale,
            transactionStatus: sale.paymentStatus as 'paid' | 'partially-paid' | 'not-paid' | 'refunded' | 'voided',
            paymentStatus: undefined
          };
        }
        
        // Migrate pricing structure
        return migrateSaleData(migratedSale);
      });
    }
    
    return archiveData;
  } catch (error) {
    console.error('Error reading archive data:', error);
    return null;
  }
}

export async function writeArchiveData(archiveData: ArchiveData): Promise<void> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, `archive-${archiveData.date}.json`);
    await fs.writeFile(filePath, JSON.stringify(archiveData, null, 2));
  } catch (error) {
    console.error('Error writing archive data:', error);
    throw error;
  }
}

export async function archiveTodaysData(): Promise<void> {
  try {
    const todaysSales = await readTodaysSales();
    
    if (todaysSales.sales.length > 0) {
      const totalRevenue = calculateTotalRevenue(todaysSales.sales);
      
      const archiveData: ArchiveData = {
        date: todaysSales.date,
        sales: todaysSales.sales,
        totalRevenue
      };
      
      await writeArchiveData(archiveData);
    }
    
    // Reset today's sales
    const newSalesData: DailySales = {
      date: format(new Date(), 'yyyy-MM-dd'),
      sales: []
    };
    
    await writeTodaysSales(newSalesData);
  } catch (error) {
    console.error('Error archiving today\'s data:', error);
    throw error;
  }
}

export async function addSale(sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> {
  try {
    const todaysSales = await readTodaysSales();
    
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    todaysSales.sales.push(newSale);
    await writeTodaysSales(todaysSales);
    
    return newSale;
  } catch (error) {
    console.error('Error adding sale:', error);
    throw error;
  }
}

export async function updateSale(saleId: string, updates: Partial<Sale>): Promise<Sale | null> {
  try {
    const todaysSales = await readTodaysSales();
    const saleIndex = todaysSales.sales.findIndex(sale => sale.id === saleId);
    
    if (saleIndex === -1) {
      return null;
    }
    
    todaysSales.sales[saleIndex] = { ...todaysSales.sales[saleIndex], ...updates };
    await writeTodaysSales(todaysSales);
    
    return todaysSales.sales[saleIndex];
  } catch (error) {
    console.error('Error updating sale:', error);
    throw error;
  }
}

export async function deleteSale(saleId: string): Promise<boolean> {
  try {
    const todaysSales = await readTodaysSales();
    const originalLength = todaysSales.sales.length;
    
    todaysSales.sales = todaysSales.sales.filter(sale => sale.id !== saleId);
    
    if (todaysSales.sales.length < originalLength) {
      await writeTodaysSales(todaysSales);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw error;
  }
}

import { calculateAmountPaid, validateSalePricing, migrateSaleData, calculateTotalRevenue, determineTransactionStatus } from './client-utils';

// Re-export client utilities for server-side use
export { calculateAmountPaid, validateSalePricing, migrateSaleData, calculateTotalRevenue, determineTransactionStatus };

export async function getYesterdayRevenue(): Promise<number> {
  try {
    const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const archiveData = await readArchiveData(yesterday);
    return archiveData?.totalRevenue || 0;
  } catch (error) {
    console.error('Error getting yesterday revenue:', error);
    return 0;
  }
}
