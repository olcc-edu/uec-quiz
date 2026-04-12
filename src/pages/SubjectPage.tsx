import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface SubjectPageProps {
  level: 'Junior' | 'Senior';
  subjects: string[];
  onSelectSubject: (subject: string) => void;
  onBack: () => void;
}

export function SubjectPage({ level, subjects, onSelectSubject, onBack }: SubjectPageProps) {
  return (
    <motion.div
      key="subject"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-emerald-500 mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> 返回年段选择
      </button>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm">
          {level === 'Junior' ? '初中' : '高中'}
        </span>
        选择科目
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => onSelectSubject(subject)}
              className="flex items-center justify-between p-5 bg-white rounded-2xl border border-zinc-200 hover:border-emerald-500 hover:shadow-md transition-all group active:scale-[0.98]"
            >
              <span className="text-lg font-semibold text-zinc-700">{subject}</span>
              <ChevronRight className="text-zinc-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </button>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-zinc-100 rounded-2xl border-2 border-dashed border-zinc-200">
            <p className="text-zinc-500">该年段暂无科目数据</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
