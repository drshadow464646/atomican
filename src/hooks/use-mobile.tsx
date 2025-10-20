
import { useState, useEffect } from "react"
import { useIsClient } from "./use-is-client";

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const isClient = useIsClient();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!isClient) {
        return;
    }

    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, [isClient]);

  return isMobile;
}
