import { motion } from 'motion/react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden mb-6">
      <motion.div
        className="bg-emerald-500 h-full"
        initial={{ width: 0 }}
        animate={{ width: `${((current + 1) / total) * 100}%` }}
      />
    </div>
  );
}
