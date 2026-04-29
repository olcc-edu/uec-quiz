import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, LayoutGrid, CheckCircle2, RotateCcw, Crown, FileText, Sparkles, ChevronRight } from 'lucide-react';
import { Question, QuizResult, UserProfile, DailyUsage } from '../types';
import { cn } from '../utils/cn';
import { ConfirmModal } from '../components/ConfirmModal';

interface HomePageProps {
  user: UserProfile;
  questions: Question[];
  quizHistory: QuizResult[];
  isAdminMode: boolean;
  isFetching: boolean;
  dailyUsage: DailyUsage;
  onSelectLevel: (level: 'Junior' | 'Senior') => void;
  onCsvSync: () => void;
  onClearHistory: () => void;
  onOpenMockExam: () => void;
}

export function HomePage({
  user,
  questions,
  quizHistory,
  isAdminMode,
  isFetching,
  dailyUsage,
  onSelectLevel,
  onCsvSync,
  onClearHistory,
  onOpenMockExam,
}: HomePageProps) {
  const [showHistoryClear, setShowHistoryClear] = useState(false);

  const freeRemaining = user.isPaid ? null : Math.max(0, 1 - dailyUsage.chaptersUsed.length);

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {isAdminMode && (
        <div className="md:col-span-2 mb-4">
          <button
            onClick={onCsvSync}
            disabled={isFetching}
            className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 py-4 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-100 transition-all shadow-sm"
          >
            <RotateCcw size={20} className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? '正在同步云端题库...' : '同步最新题库 (Google Sheets)'}
          </button>
        </div>
      )}

      <div className="md:col-span-2 text-center mb-8">
        <h2 className="text-3xl font-extrabold text-zinc-900 mb-2">
          你好，{user.nickname} 👋
        </h2>
        <p className="text-zinc-500">选择你的年段开始高效复习</p>

        <div className="flex items-center justify-center gap-3 mt-4">
          {questions.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 text-zinc-500 rounded-full text-xs font-medium">
              <CheckCircle2 size={12} className="text-emerald-500" />
              题库共 {questions.length} 题
            </div>
          )}
          {!user.isPaid && (
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
              freeRemaining! > 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            )}>
              <Crown size={12} />
              今日免费额度: {freeRemaining}/1 章节
            </div>
          )}
          {user.isPaid && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
              <Crown size={12} />
              完整版
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onSelectLevel('Junior')}
        className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-zinc-200 hover:border-emerald-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-zinc-800">初中统考</h3>
            <p className="text-zinc-500 mt-1">Junior Middle Level</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onSelectLevel('Senior')}
        className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-zinc-200 hover:border-emerald-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <LayoutGrid size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-zinc-800">高中统考</h3>
            <p className="text-zinc-500 mt-1">Senior Middle Level</p>
          </div>
        </div>
      </button>

      {/* 统考模拟卷入口（敬请期待） */}
      <button
        onClick={onOpenMockExam}
        className="md:col-span-2 group relative overflow-hidden rounded-3xl border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 hover:border-purple-500 hover:shadow-md transition-all p-5 active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-200">
            <FileText size={22} />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-zinc-800">📝 统考模拟卷</h3>
              <span className="inline-flex items-center gap-0.5 bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded text-[9px] font-black">
                <Sparkles size={9} />
                敬请期待
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              仿真统考真题难度 · 限时模拟考试体验
            </p>
          </div>
          <ChevronRight size={18} className="text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </div>
      </button>

      {quizHistory.length > 0 && (
        <div className="md:col-span-2 mt-8">
          <h3 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <RotateCcw size={20} className="text-emerald-500" />
            最近成绩记录
          </h3>
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">日期</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">科目/章节</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">得分</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">正确率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {quizHistory.slice(0, 10).map((result) => (
                    <tr key={result.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{result.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-700">{result.subject}</span>
                          <span className="text-xs text-zinc-400">{result.chapter}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-zinc-600">
                        {result.score} / {result.total}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-bold',
                            result.score / result.total >= 0.8
                              ? 'bg-emerald-100 text-emerald-600'
                              : result.score / result.total >= 0.5
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-red-100 text-red-600'
                          )}
                        >
                          {Math.round((result.score / result.total) * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowHistoryClear(true)}
              className="w-full py-3 text-xs text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all border-t border-zinc-100"
            >
              清空记录
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        show={showHistoryClear}
        title="清空成绩记录"
        message="确定要清空所有成绩记录吗？"
        onConfirm={() => {
          onClearHistory();
          setShowHistoryClear(false);
        }}
        onCancel={() => setShowHistoryClear(false)}
        isDanger
      />
    </motion.div>
  );
}
