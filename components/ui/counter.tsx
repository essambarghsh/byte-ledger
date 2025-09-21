'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CounterProps {
  /** The target number to count to */
  value: number;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Number of decimal places to show */
  decimals?: number;
  /** Prefix to display before the number */
  prefix?: string;
  /** Suffix to display after the number */
  suffix?: string;
  /** Whether to use number separators (commas) */
  useGrouping?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Whether to start animation immediately or wait for trigger */
  startOnMount?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Custom easing function */
  easingFunction?: (t: number) => number;
}

// Default easing function (ease out)
const defaultEasing = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export function Counter({
  value,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  useGrouping = true,
  className,
  startOnMount = true,
  onComplete,
  easingFunction = defaultEasing,
}: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const targetValueRef = useRef<number>(value);

  const formatNumber = (num: number): string => {
    const options: Intl.NumberFormatOptions = {
      useGrouping,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    };

    return new Intl.NumberFormat(undefined, options).format(num);
  };

  const animate = useCallback(() => {
    const animateStep = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing function
      const easedProgress = easingFunction(progress);
      const currentValue = easedProgress * targetValueRef.current;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateStep);
      } else {
        setIsAnimating(false);
        setDisplayValue(targetValueRef.current);
        onComplete?.();
      }
    };

    if (targetValueRef.current > 0) {
      setIsAnimating(true);
      setDisplayValue(0);
      startTimeRef.current = undefined;
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      animationRef.current = requestAnimationFrame(animateStep);
    } else {
      // If target is 0 or negative, just set it directly
      setDisplayValue(targetValueRef.current);
    }
  }, [duration, easingFunction, onComplete]);

  // Effect to handle value changes
  useEffect(() => {
    // Update target value
    targetValueRef.current = value;
    
    if (startOnMount) {
      // Start animation when value changes
      animate();
    } else {
      // Just set the value directly if not animating on mount
      setDisplayValue(value);
    }
  }, [value, startOnMount, animate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <span
      className={cn('inline-block tabular-nums', className)}
      dir="ltr"
    >
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}

// Hook for manual control of the counter
export function useCounter({
  value,
  duration = 2000,
  decimals = 0,
  easingFunction = defaultEasing,
}: Pick<CounterProps, 'value' | 'duration' | 'decimals' | 'easingFunction'>) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  const animate = (targetValue: number) => {
    const animateStep = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunction(progress);
      const currentValue = easedProgress * targetValue;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateStep);
      } else {
        setIsAnimating(false);
        setDisplayValue(targetValue);
      }
    };

    if (isAnimating) return;

    setIsAnimating(true);
    setDisplayValue(0);
    startTimeRef.current = undefined;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(animateStep);
  };

  const start = () => {
    animate(value);
  };

  const reset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
    setDisplayValue(0);
    startTimeRef.current = undefined;
  };

  const stop = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    displayValue,
    isAnimating,
    start,
    reset,
    stop,
  };
}