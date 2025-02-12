// SafeCountUp.tsx
import React, { useState, useEffect } from "react";
import CountUp from "react-countup";

interface SafeCountUpProps {
  end: number;
  duration: number;
  prefix?: string;
  decimals?: number;
}

const SafeCountUp = ({
  end,
  duration,
  prefix = "",
  decimals = 0,
}: SafeCountUpProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If not yet mounted, show a fallback static value (formatted)
  if (!mounted) {
    return (
      <span>
        {prefix}
        {end.toFixed(decimals)}
      </span>
    );
  }

  return (
    <CountUp
      end={end}
      duration={duration}
      prefix={prefix}
      decimals={decimals}
    />
  );
};

export default SafeCountUp;
