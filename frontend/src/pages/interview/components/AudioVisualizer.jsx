import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AudioVisualizer({ isActive, color = 'bg-primary' }) {
  const [bars, setBars] = useState(Array(12).fill(0));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(12).fill(0.2));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array(12).fill(0).map(() => Math.random() * 0.8 + 0.2));
    }, 150);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 w-32">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className={`w-1.5 rounded-full ${color}`}
          animate={{
            height: `${height * 100}%`,
            opacity: isActive ? 1 : 0.5
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        />
      ))}
    </div>
  );
}
