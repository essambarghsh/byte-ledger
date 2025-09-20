'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArchiveData, Employee } from '@/lib/types';
import SalesTable from '@/components/SalesTable';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

export default function ArchivePage() {
  const t = useTranslations();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [archiveData, setArchiveData] = useState<ArchiveData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadArchiveData = async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    setNotFound(false);
    setArchiveData(null);

    try {
      const response = await fetch(`/api/archive/${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setArchiveData(data);
      } else if (response.status === 404) {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error loading archive data:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="terminal-window border-x-0 border-b border-green-600 shadow-[0_2px_10px_rgba(0,255,0,0.3)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-green-400 hover:text-green-200 font-mono border border-green-600 px-3 py-1 rounded hover:shadow-[0_0_10px_#00ff00] transition-all"
              >
                ← {t('common.back')}
              </Link>
              <h1 className="text-2xl font-bold text-green-300 font-mono text-glow pulse-text">
                 {t('archive.title')}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        {/* Date Selector */}
        <div className="terminal-window rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="font-medium text-green-400 font-mono">
               {t('archive.selectDate')}:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-green-600 rounded-md focus:ring-green-500 focus:border-green-400 bg-black text-green-300 font-mono"
            />
            <button
              onClick={loadArchiveData}
              disabled={isLoading || !selectedDate}
              className="bg-green-900 border border-green-600 text-green-300 px-6 py-2 rounded-md hover:bg-green-800 hover:text-green-100 disabled:opacity-50 transition-all hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] font-mono"
            >
              {isLoading ? t('common.loading') : t('archive.loadArchive')}
            </button>
          </div>
        </div>

        {/* Archive Data */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4 shadow-[0_0_20px_#00ff00]"></div>
            <p className="text-green-300 font-mono text-glow">{t('common.loading')}</p>
          </div>
        )}

        {notFound && (
          <div className="text-center py-8">
            <div className="terminal-window rounded-lg p-6">
              <p className="text-yellow-400 text-lg font-mono animate-pulse">
                WARNING: {t('archive.noDataForDate')}
              </p>
              <p className="text-yellow-500 text-sm mt-2 font-mono">
                {selectedDate && formatDate(selectedDate)}
              </p>
            </div>
          </div>
        )}

        {archiveData && (
          <div className="space-y-6">
            {/* Archive Info */}
            <div className="terminal-window rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-green-400 mb-2 font-mono text-glow">
                     {t('archive.date')}
                  </h3>
                  <p className="text-2xl font-bold text-green-300 font-mono pulse-text">
                    {formatDate(archiveData.date)}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-400 mb-2 font-mono text-glow">
                     {t('archive.totalRevenue')}
                  </h3>
                  <p className="text-2xl font-bold text-green-300 font-mono pulse-text">
                    {formatCurrency(archiveData.totalRevenue)}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-400 mb-2 font-mono text-glow">
                     {t('archive.salesCount')}
                  </h3>
                  <p className="text-2xl font-bold text-green-300 font-mono pulse-text">
                    {archiveData.sales.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Sales Table */}
            <div className="terminal-window rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.2)]">
              <div className="p-6 border-b border-green-600">
                <h2 className="text-xl font-bold text-green-300 font-mono text-glow cursor-blink">
                   {t('archive.salesDetails')}
                </h2>
              </div>
              <div className="p-6">
                <SalesTable
                  sales={archiveData.sales}
                  employees={employees}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}