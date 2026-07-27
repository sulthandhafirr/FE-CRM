import { useState, useEffect, useRef } from "react";

export default function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (value == null) return;

    const startValue = prevValue.current;
    const diff = value - startValue;
    if (diff === 0) return;

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
        prevValue.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return display;
}
