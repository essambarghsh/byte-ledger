'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('navigation');
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
    <footer className="terminal-window !border-x-0 !border-b-0 border-t !border-green-900 py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <Link className='text-sm text-green-400 font-mono hover:text-green-200 transition-colors hover:text-shadow-[0_0_10px_#00ff00]' href="https://www.esssam.com" target="_blank">Developer: Essam Barghsh</Link>
          <button
            onClick={handleLanguageChange}
            disabled={isPending}
            className="text-sm text-green-400 hover:text-green-200 transition-colors disabled:opacity-50 border border-green-600 px-3 py-1 rounded hover:shadow-[0_0_10px_#00ff00] font-mono"
          >
            {t('languageSwitch')}
          </button>
        </div>
      </div>
    </footer>
  );
}
