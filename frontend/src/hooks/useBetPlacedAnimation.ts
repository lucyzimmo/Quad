import { useState, useEffect } from "react";

export const useBetPlacedAnimation = () => {
  const [betPlacedAnimation, setBetPlacedAnimation] = useState(false);

  useEffect(() => {
    if (betPlacedAnimation) {
      const timer = setTimeout(() => {
        setBetPlacedAnimation(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [betPlacedAnimation]);

  return [betPlacedAnimation, setBetPlacedAnimation] as const;
};
