'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/src/store/hooks';
import { Navbar } from './Navbar';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = useAppSelector((s) => s.ui.isLoggedIn);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoggedIn && !isLoginPage) {
      router.replace('/login');
    }
    if (isLoggedIn && isLoginPage) {
      router.replace('/');
    }
  }, [isLoggedIn, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}
