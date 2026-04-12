import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, CheckCircle2, ArrowLeft, RotateCcw, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import confetti from 'canvas-confetti';
import { Question } from '../types';
import { cn } from '../utils/cn';
import { ProgressBar } from '../components/ProgressBar';
import { ConfirmModal } from '../components/ConfirmModal';

const APPLAUSE_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3';
const ERROR_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2959/2959-preview.mp3';

interface QuizPageProps {
  questions: Question[];
  chapter: string;
  onFinish: (score: number, total: number) => void;
  onExit: () => void;
}

export function QuizPage({ questions, chapter, onFinish, onExit }: QuizPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const applauseAudio = useMemo(() => new Audio(APPLAUSE_SOUND), []);
  const errorAudio = useMemo(() => new Audio(ERROR_SOUND), []);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (index: number) => {
    if (userAnswer !== null) return;
    setUserAnswer(index);
    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
      applauseAudio.currentTime = 0;
      applauseAudio.play().catch(() => {});
    } else {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      errorAudio.currentTime = 0;
      errorAudio.play().catch(() => {});
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      onFinish(score, questions.length);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setUserAnswer(null);
      setShowExplanation(false);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setUserAnswer(null);
    setShowExplanation(false);
    setQuizFinished(false);
  };

  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white p-10 rounded-3xl border border-zinc-200 text-center shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-zinc-800 mb-2">复习完成！</h2>
          <p className="text-zinc-500 mb-6">你在本章节中获得了</p>
          <div className="text-6xl font-black text-emerald-500 mb-8">{percentage}%</div>
          <div className="text-sm text-zinc-400 mb-8">
            答对 {score} / {questions.length} 题
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={restartQuiz}
              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> 再次挑战
            </button>
            <button
              onClick={onExit}
              className="w-full bg-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
            >
              返回章节列表
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="quiz"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowEndConfirm(true)}
          className="text-xs font-medium text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <XCircle size={14} /> 结束作答
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-500">
            第 {currentIndex + 1} / {questions.length} 题
          </span>
          <span className="text-sm font-bold text-emerald-600">得分: {score}</span>
        </div>
      </div>

      <ProgressBar current={currentIndex} total={questions.length} />

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm mb-6 relative">
        {currentIndex > 0 && userAnswer === null && (
          <button
            onClick={prevQuestion}
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:border-emerald-500 shadow-md transition-all z-10"
            title="上一题"
          >
            <ArrowLeft size={16} />
          </button>
        )}

        <div className="text-lg font-bold text-zinc-800 mb-6 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {currentQuestion.question}
          </ReactMarkdown>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isCorrect = idx === currentQuestion.correctIndex;
            const isSelected = userAnswer === idx;

            return (
              <button
                key={idx}
                disabled={userAnswer !== null}
                onClick={() => handleAnswer(idx)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group min-h-[48px]',
                  userAnswer === null
                    ? 'border-zinc-100 hover:border-emerald-500 hover:bg-emerald-50 active:scale-[0.99]'
                    : isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : isSelected
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-zinc-100 opacity-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors shrink-0',
                      userAnswer === null
                        ? 'bg-zinc-100 text-zinc-500 group-hover:bg-emerald-500 group-hover:text-white'
                        : isCorrect
                        ? 'bg-emerald-500 text-white'
                        : isSelected
                        ? 'bg-red-500 text-white'
                        : 'bg-zinc-100 text-zinc-400'
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {option}
                    </ReactMarkdown>
                  </span>
                </div>
                {userAnswer !== null && isCorrect && <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />}
                {userAnswer !== null && isSelected && !isCorrect && <XCircle size={20} className="text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-100 p-5 rounded-2xl mb-6 border-l-4 border-emerald-500"
        >
          <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
            <Info size={18} /> 详解解析
          </div>
          <div className="text-zinc-600 markdown-body text-sm">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {currentQuestion.explanation}
            </ReactMarkdown>
          </div>
          <button
            onClick={nextQuestion}
            className="mt-4 w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
          >
            {currentIndex === questions.length - 1 ? '查看结果' : '下一题'}
          </button>
        </motion.div>
      )}

      <ConfirmModal
        show={showEndConfirm}
        title="结束作答"
        message="确定要结束本次作答并返回吗？当前进度将不会被记录。"
        onConfirm={() => {
          setShowEndConfirm(false);
          onExit();
        }}
        onCancel={() => setShowEndConfirm(false)}
        isDanger
      />
    </motion.div>
  );
}
