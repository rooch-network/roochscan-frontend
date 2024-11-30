import { useEffect, useState } from 'react';

function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const htmlElement = document.documentElement;

    const updateDarkMode = () => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    };

    // 初始化检测
    updateDarkMode();

    // 使用 MutationObserver 监听 class 属性变化
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });

    // 清理监听器
    return () => observer.disconnect();
  }, []);

  return isDarkMode;
}

export default useDarkMode;
