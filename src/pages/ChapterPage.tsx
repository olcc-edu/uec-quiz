import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, ChevronRight, Lock } from 'lucide-react';
import { cn } from '../utils/cn';
import { Question, QuizResult } from '../types';

interface ChapterPageProps {
  subject: string;
  chapters: string[];
  questions: Question[];
  level: 'Junior' | 'Senior';
  quizHistory: QuizResult[];
  canStartQuiz: (chapterKey: string) => boolean;
  onSelectChapter: (chapter: string) => void;
  onShowPaywall: () => void;
  onBack: () => void;
}

export function ChapterPage({
  subject,
  chapters,
  questions,
  level,
  quizHistory,
  canStartQuiz,
  onSelectChapter,
  onShowPaywall,
  onBack,
}: ChapterPageProps) {
  const getChapterMaxScore = (chapter: string) => {
    const levelLabel = level === 'Junior' ? '初中' : '高中';
    const chapterResults = quizHistory.filter(
      (h) => h.level === levelLabel && h.subject === subject && h.chapter === chapter
    );
    if (chapterResults.length === 0) return null;
    const maxScore = Math.max(...chapterResults.map((h) => h.score));
    const total = chapterResults[0].total;
    return { score: maxScore, total };
  };

  const handleChapterClick = (chapter: string) => {
    const chapterKey = `${level}|${subject}|${chapter}`;
    if (canStartQuiz(chapterKey)) {
      onSelectChapter(chapter);
    } else {
      onShowPaywall();
    }
  };

  return (
    <motion.div
      key="chapter"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-emerald-500 mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> 返回科目选择
      </button>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm">{subject}</span>
        选择章节
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {chapters.map((chapter) => {
          const chapterKey = `${level}|${subject}|${chapter}`;
          const isLocked = !canStartQuiz(chapterKey);
          const maxScore = getChapterMaxScore(chapter);
          const questionCount = questions.filter((q) => q.chapter === chapter && q.level === level && q.subject === subject).length;

          return (
            <button
              key={chapter}
              onClick={() => handleChapterClick(chapter)}
              className={cn(
                'flex items-center justify-between p-4 bg-white rounded-xl border transition-all group active:scale-[0.99]',
                isLocked
                  ? 'border-zinc-100 opacity-60'
                  : 'border-zinc-200 hover:border-emerald-500 hover:shadow-sm'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                    isLocked
                      ? 'bg-zinc-100 text-zinc-300'
                      : 'bg-zinc-50 text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'
                  )}
                >
                  {isLocked ? <Lock size={18} /> : <BookOpen size={18} />}
                </div>
                <span className={cn('font-medium text-sm', isLocked ? 'text-zinc-400' : 'text-zinc-700')}>
                  {chapter}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {maxScore && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    最高: {maxScore.score}/{maxScore.total}
                  </span>
                )}
                <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                  {questionCount} 题
                </span>
                <ChevronRight size={16} className={isLocked ? 'text-zinc-200' : 'text-zinc-300 group-hover:text-emerald-500'} />
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
