'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Employee } from '@/lib/types';

interface EmployeeLoginProps {
  employees: Employee[];
  onEmployeeSelect: (employee: Employee) => void;
}

export default function EmployeeLogin({ employees, onEmployeeSelect }: EmployeeLoginProps) {
  const t = useTranslations('login');
  const tNav = useTranslations('navigation');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    startTransition(() => {
      router.push(`/${nextLocale}`);
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Matrix-style background effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="text-green-500 text-xs font-mono whitespace-pre animate-pulse">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="mb-2">
              {Array.from({ length: 80 }, () => Math.random() > 0.8 ? '1' : '0').join('')}
            </div>
          ))}
        </div>
      </div>
      
      <div className="terminal-window rounded-lg p-8 w-full max-w-md relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-400 mb-2 text-glow pulse-text">
              {t('title')}
            </h1>
            <p className="text-green-300 font-mono">
              {t('subtitle')}
            </p>
          </div>
          <button
            onClick={handleLanguageChange}
            disabled={isPending}
            className="text-sm text-green-400 hover:text-green-200 transition-colors disabled:opacity-50 border border-green-600 px-3 py-1 rounded hover:shadow-[0_0_10px_#00ff00]"
          >
            {tNav('languageSwitch')}
          </button>
        </div>

        <div className="space-y-3">
          {employees.map((employee) => (
            <button
              key={employee.id}
              onClick={() => onEmployeeSelect(employee)}
              className="w-full p-4 text-right bg-black border border-green-600 hover:border-green-400 rounded-lg transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:bg-green-900/20 group"
            >
              <div className="font-medium text-green-300 group-hover:text-green-100 font-mono">
                 {locale === 'ar' ? employee.name : employee.nameEn}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
