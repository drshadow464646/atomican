
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    router.replace('/lab/workbench');
  }, [router]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p>Redirecting to the lab...</p>
    </div>
  );
}
