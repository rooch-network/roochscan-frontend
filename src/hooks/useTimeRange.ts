import { useEffect, useState } from 'react';

function useTimeRange(updateInterval = 60000,isInterval = true) { // 默认 60 秒更新一次
  // 5 分钟前的时间戳
  const [fiveMinutesAgoMillis, setFiveMinutesAgoMillis] = useState(Date.now() - 5 * 60 * 1000);
  
  // 当前时间戳
  const [currentTimeMillis, setCurrentTimeMillis] = useState(Date.now());

  useEffect(() => {
    let intervalId:any
    if(!isInterval )   return () => clearInterval(intervalId);
    // 定时器每次更新 5 分钟前的时间戳和当前时间戳
     intervalId = setInterval(() => {
      setFiveMinutesAgoMillis(Date.now() - 20 * 60 * 1000);
      setCurrentTimeMillis(Date.now());
    }, updateInterval);

    // 清理定时器
    return () => clearInterval(intervalId);
  }, [isInterval, updateInterval]);

  return { fiveMinutesAgoMillis, currentTimeMillis };
}

export default useTimeRange;
