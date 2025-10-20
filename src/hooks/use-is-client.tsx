
'use client';

import { useState, useEffect } from 'react';

/**
 * A simple hook to determine if the component is running on the client.
 * This is useful for avoiding hydration mismatches when using browser-specific APIs.
 * @returns {boolean} - True if the component is mounted on the client, false otherwise.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
