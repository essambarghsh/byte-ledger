'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Employee, Sale, DailySales } from '@/lib/types';
import SalesTable from './SalesTable';

interface DashboardProps {
  initialEmployees: Employee[];
  initialSalesData: DailySales;
  currentEmployee: Employee;
  onLogout: () => void;
}

export default function Dashboard({ initialEmployees, initialSalesData, currentEmployee, onLogout }: DashboardProps) {
  const t = useTranslations();
  
  const [employees] = useState<Employee[]>(initialEmployees);
  const [salesData, setSalesData] = useState<DailySales>(initialSalesData);
  const [revenueData, setRevenueData] = useState({ today: 0, yesterday: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Load revenue data
  useEffect(() => {
    fetchRevenueData();
  }, [salesData]);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/revenue');
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await fetch('/api/sales');
      if (response.ok) {
        const data = await response.json();
        setSalesData(data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const handleAddSale = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        await fetchSalesData();
        alert(t('messages.saleAdded'));
      } else {
        alert(t('common.error'));
        throw new Error('Failed to add sale');
      }
    } catch (error) {
      console.error('Error adding sale:', error);
      alert(t('common.error'));
      throw error; // Re-throw to let the table component handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSale = async (saleId: string, saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        await fetchSalesData();
        alert(t('messages.saleUpdated'));
      } else {
        alert(t('common.error'));
        throw new Error('Failed to update sale');
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      alert(t('common.error'));
      throw error; // Re-throw to let the table component handle it
    } finally {
      setIsLoading(false);
    }
  };


  const handleCloseDay = async () => {
    if (!confirm(t('messages.confirmCloseDay'))) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/archive', {
        method: 'POST',
      });

      if (response.ok) {
        await fetchSalesData();
        alert(t('messages.dayClosedSuccessfully'));
      } else {
        alert(t('common.error'));
      }
    } catch (error) {
      console.error('Error closing day:', error);
      alert(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      numberingSystem: 'latn',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-black min-h-screen">
      {/* User Navigation */}
      <div className="terminal-window !border-x-0 border-b !border-green-900 shadow-[0_2px_10px_rgba(0,255,0,0.3)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <p className="text-white font-mono text-glow">
               LOGGED_IN: {currentEmployee.name}
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="/archive"
                className="px-4 py-2 text-green-400 hover:text-green-200 border border-green-600 hover:border-green-400 rounded-md transition-all hover:shadow-[0_0_10px_#00ff00] font-mono"
              >
                {t('navigation.archive')}
              </Link>
              <Link
                href="/settings"
                className="px-4 py-2 text-blue-400 hover:text-blue-200 border border-blue-600 hover:border-blue-400 rounded-md transition-all hover:shadow-[0_0_10px_#0066ff] font-mono"
              >
                {t('navigation.settings')}
              </Link>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-red-400 hover:text-red-200 border border-red-600 hover:border-red-400 rounded-md transition-all hover:shadow-[0_0_10px_#ff0000] font-mono"
              >
                {t('dashboard.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="terminal-window p-6 rounded-lg">
            <h3 className="text-lg font-medium text-green-400 mb-2 font-mono text-glow">
               {t('dashboard.todayRevenue')}
            </h3>
            <p className="text-3xl font-bold text-white pulse-text font-mono">
              {formatCurrency(revenueData.today)}
            </p>
          </div>
          <div className="terminal-window p-6 rounded-lg">
            <h3 className="text-lg font-medium text-green-400 mb-2 font-mono text-glow">
               {t('dashboard.yesterdayRevenue')}
            </h3>
            <p className="text-3xl font-bold text-green-500 font-mono">
              {formatCurrency(revenueData.yesterday)}
            </p>
          </div>
          <div className="terminal-window p-6 rounded-lg flex flex-col justify-center">
            <button
              onClick={handleCloseDay}
              disabled={isLoading}
              className="w-full bg-red-900 border-0 font-bold text-red-100 py-5 px-4 rounded-xl hover:bg-red-800 hover:text-red-100 disabled:opacity-50 transition-all hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] font-mono"
            >
              {t('dashboard.closeDay')}
            </button>
          </div>
        </div>

        {/* Sales Section */}
        <div className="terminal-window rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.2)]">
          <div className="p-6 border-b border-green-600">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-400 font-mono text-glow cursor-blink">
                 {t('dashboard.todaysSales')}
              </h2>
            </div>
          </div>
          <div className="p-6">
            <SalesTable
              sales={salesData.sales}
              employees={employees}
              currentEmployeeId={currentEmployee.id}
              onAddSale={handleAddSale}
              onUpdateSale={handleUpdateSale}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
