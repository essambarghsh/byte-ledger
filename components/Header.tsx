'use client';

import { useTranslations } from 'next-intl';

export default function Header() {
  const t = useTranslations();

  return (
    <header className="terminal-window !border-x-0 border-b border-green-600 shadow-[0_2px_10px_rgba(0,255,0,0.3)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-green-300 font-mono text-glow pulse-text">
               {t('dashboard.title')}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
