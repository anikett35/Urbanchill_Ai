'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/globe');
  }, [router]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: '#020817' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Redirecting to workspace…</p>
      </div>
    </div>
  );
}
