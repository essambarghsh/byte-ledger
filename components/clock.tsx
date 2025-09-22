'use client';

import { useState, useEffect } from 'react';

export default function Clock() {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('ar-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTime(timeString);
    };

    // Update time immediately
    updateTime();

    // Set up interval to update every second
    const interval = setInterval(updateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="text-lg font-black text-black">
        {currentTime}
      </div>
    </div>
  );
}
