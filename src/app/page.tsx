
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/lab/workbench');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p>Redirecting to the lab...</p>
    </div>
  );
}
