
import { useState, useEffect } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1400);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1400);
    }

    window.addEventListener('resize', handleResize);

    // 组件卸载时移除事件监听
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default useIsMobile;