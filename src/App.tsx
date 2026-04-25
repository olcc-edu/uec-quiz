/**
 * UEC 刷题宝 - Main App Coordinator
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
// motion animations are handled within individual page components
import { Question, QuizResult, UserProfile, ViewType, DailyUsage } from './types';
import { storage } from './utils/storage';
import { api } from './utils/api';
import { initialQuestions } from './data/questions';
import { Header } from './components/Header';
import { PaywallModal } from './components/PaywallModal';
import { AccountModal } from './components/AccountModal';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { SubjectPage } from './pages/SubjectPage';
import { ChapterPage } from './pages/ChapterPage';
import { QuizPage } from './pages/QuizPage';
import { AdminPage } from './pages/AdminPage';
import { QrCodePage } from './pages/QrCodePage';

const CURRENT_VERSION = '3';
const DEFAULT_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTqnDvJyDALJk6C4-9y1f4jtFN_jNwgE8TTG0xjhp3BsEiuY4zKvsQPxACw_d-B4uBG3RUc0-LZFwFl/pub?output=csv';

export default function App() {
  // Core state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [view, setView] = useState<ViewType>('home');
  const [selectedLevel, setSelectedLevel] = useState<'Junior' | 'Senior' | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({ date: '', chaptersUsed: [] });
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  // Admin state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [csvUrl, setCsvUrl] = useState(DEFAULT_CSV_URL);
  const [isFetching, setIsFetching] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);

  // Initialize
  useEffect(() => {
    // Load user
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);

      // Auto-recover orphaned local users (those whose registration never reached the server)
      if (savedUser.id.startsWith('local_')) {
        api.recoverLocalUser(savedUser).then((recovered) => {
          if (recovered) {
            // Successfully migrated to server - replace local user with server user
            // but preserve answer history (which is already in localStorage independently)
            console.log('Account recovered to server:', recovered.id);
            setUser(recovered);
            storage.setUser(recovered);
          }
        });
      } else {
        // Normal server-side user: check paid status
        api.checkPaidStatus(savedUser.id).then((isPaid) => {
          if (isPaid !== savedUser.isPaid) {
            const updated = { ...savedUser, isPaid };
            setUser(updated);
            storage.setUser(updated);
          }
        });
      }
    } else {
      setView('register');
    }

    // Load questions
    const saved = localStorage.getItem('uec_questions');
    const version = localStorage.getItem('uec_version');
    if (saved && version === CURRENT_VERSION) {
      setQuestions(JSON.parse(saved));
    } else {
      setQuestions(initialQuestions);
      storage.setQuestions(initialQuestions);
      storage.setVersion(CURRENT_VERSION);
    }

    // Load history
    setQuizHistory(storage.getHistory());

    // Load daily usage
    setDailyUsage(storage.getDailyUsage());

    // Check URL params - admin requires password
    const params = new URLSearchParams(window.location.search);
    const adminKey = params.get('admin');
    if (adminKey === 'uec2026admin') {
      setIsAdminMode(true);
    }
    const ref = params.get('ref');
    if (ref) {
      storage.setRef(ref);
    }
  }, []);

  // Auto-sync CSV on first load
  useEffect(() => {
    if (csvUrl && questions.length <= initialQuestions.length && !isFetching && user) {
      handleCsvImport();
    }
  }, [user]);

  // Derived data
  const subjects = useMemo(() => {
    const set = new Set(
      questions.filter((q) => q.level === selectedLevel).map((q) => q.subject)
    );
    return Array.from(set);
  }, [questions, selectedLevel]);

  const chapters = useMemo(() => {
    const set = new Set(
      questions
        .filter((q) => q.level === selectedLevel && q.subject === selectedSubject)
        .map((q) => q.chapter)
    );
    return Array.from(set);
  }, [questions, selectedLevel, selectedSubject]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(
      (q) =>
        q.level === selectedLevel &&
        q.subject === selectedSubject &&
        q.chapter === selectedChapter
    );
  }, [questions, selectedLevel, selectedSubject, selectedChapter]);

  // CSV import handler
  const handleCsvImport = useCallback(async () => {
    if (!csvUrl) return;
    setIsFetching(true);
    try {
      let finalUrl = csvUrl;
      if (csvUrl.includes('docs.google.com/spreadsheets') && csvUrl.includes('/edit')) {
        finalUrl = csvUrl.replace(/\/edit.*$/, '/export?format=csv');
      }

      const response = await fetch(finalUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const csvText = await response.text();

      if (csvText.includes('<!DOCTYPE html>') || csvText.includes('login')) {
        throw new Error('获取到的是网页而非 CSV');
      }

      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const dataRows = results.data.slice(1);
          const newQuestions: Question[] = dataRows
            .map((row: any, i: number) => {
              let level: 'Junior' | 'Senior' = 'Junior';
              const rawLevel = String(row[0] || '').trim();
              if (rawLevel.includes('高') || rawLevel.toLowerCase().includes('senior')) {
                level = 'Senior';
              }

              const rawCorrect = String(row[8] || '').trim().toUpperCase();
              let correctIndex = 0;
              if (rawCorrect === 'A') correctIndex = 0;
              else if (rawCorrect === 'B') correctIndex = 1;
              else if (rawCorrect === 'C') correctIndex = 2;
              else if (rawCorrect === 'D') correctIndex = 3;
              else {
                const parsed = parseInt(rawCorrect);
                if (!isNaN(parsed)) correctIndex = parsed;
              }

              return {
                id: Date.now().toString() + i,
                level,
                subject: String(row[1] || '未分类').trim(),
                chapter: String(row[2] || '第一章').trim(),
                question: String(row[3] || '').trim(),
                options: [
                  String(row[4] || '').trim(),
                  String(row[5] || '').trim(),
                  String(row[6] || '').trim(),
                  String(row[7] || '').trim(),
                ],
                correctIndex,
                explanation: String(row[9] || '').trim(),
              };
            })
            .filter((q: Question) => q.question && q.subject);

          if (newQuestions.length > 0) {
            setQuestions(newQuestions);
            storage.setQuestions(newQuestions);
            storage.setVersion(CURRENT_VERSION);
          }
          setIsFetching(false);
        },
        error: () => {
          setIsFetching(false);
        },
      });
    } catch {
      setIsFetching(false);
    }
  }, [csvUrl]);

  // Handlers
  const handleRegistered = (newUser: UserProfile) => {
    setUser(newUser);
    setView('home');
    // Trigger CSV sync after registration
    handleCsvImport();
  };

  const handleSelectLevel = (level: 'Junior' | 'Senior') => {
    setSelectedLevel(level);
    setView('subject');
  };

  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setView('chapter');
  };

  const canStartQuiz = (chapterKey: string): boolean => {
    if (!user) return false;
    return storage.canUseChapter(chapterKey, user.isPaid);
  };

  const handleSelectChapter = (chapter: string) => {
    const chapterKey = `${selectedLevel}|${selectedSubject}|${chapter}`;
    storage.addChapterUsage(chapterKey);
    setDailyUsage(storage.getDailyUsage());
    setSelectedChapter(chapter);
    setView('quiz');
  };

  const handleQuizFinish = (score: number, total: number) => {
    const newResult: QuizResult = {
      id: Date.now().toString(),
      level: selectedLevel === 'Junior' ? '初中' : '高中',
      subject: selectedSubject || '',
      chapter: selectedChapter || '',
      score,
      total,
      date: new Date().toLocaleString(),
    };
    const updated = [newResult, ...quizHistory].slice(0, 50);
    setQuizHistory(updated);
    storage.setHistory(updated);
  };

  const handleBulkImport = (data: string) => {
    const lines = data.trim().split('\n');
    const newQuestions: Question[] = lines.map((line, i) => {
      const [level, subject, chapter, question, a, b, c, d, correct, explanation] =
        line.split('\t');
      return {
        id: Date.now().toString() + i,
        level: level as 'Junior' | 'Senior',
        subject,
        chapter,
        question,
        options: [a, b, c, d],
        correctIndex: parseInt(correct),
        explanation,
      };
    });
    const updated = [...questions, ...newQuestions];
    setQuestions(updated);
    storage.setQuestions(updated);
    alert(`成功导入 ${newQuestions.length} 道题目！`);
  };

  const navigateHome = () => {
    setView('home');
    setSelectedLevel(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  // Register page (no header)
  if (view === 'register') {
    return <RegisterPage onRegistered={handleRegistered} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Header
        user={user}
        isAdminMode={isAdminMode}
        onNavigateHome={navigateHome}
        onNavigateAdmin={() => setView('admin')}
        onOpenAccount={() => setShowAccount(true)}
      />

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {view === 'home' && user && (
          <HomePage
            user={user}
            questions={questions}
            quizHistory={quizHistory}
            isAdminMode={isAdminMode}
            isFetching={isFetching}
            dailyUsage={dailyUsage}
            onSelectLevel={handleSelectLevel}
            onCsvSync={handleCsvImport}
            onClearHistory={() => {
              setQuizHistory([]);
              storage.clearHistory();
            }}
          />
        )}

        {view === 'subject' && selectedLevel && (
          <SubjectPage
            level={selectedLevel}
            subjects={subjects}
            onSelectSubject={handleSelectSubject}
            onBack={() => setView('home')}
          />
        )}

        {view === 'chapter' && selectedLevel && selectedSubject && (
          <ChapterPage
            subject={selectedSubject}
            chapters={chapters}
            questions={questions}
            level={selectedLevel}
            quizHistory={quizHistory}
            canStartQuiz={canStartQuiz}
            onSelectChapter={handleSelectChapter}
            onShowPaywall={() => setShowPaywall(true)}
            onBack={() => setView('subject')}
          />
        )}

        {view === 'quiz' && selectedChapter && filteredQuestions.length > 0 && (
          <QuizPage
            questions={filteredQuestions}
            chapter={selectedChapter}
            onFinish={handleQuizFinish}
            onExit={() => setView('chapter')}
          />
        )}

        {view === 'admin' && (
          <AdminPage
            questions={questions}
            csvUrl={csvUrl}
            isFetching={isFetching}
            onCsvUrlChange={setCsvUrl}
            onCsvSync={handleCsvImport}
            onBulkImport={handleBulkImport}
            onReset={() => {
              setQuestions(initialQuestions);
              storage.setQuestions(initialQuestions);
            }}
            onClear={() => {
              setQuestions([]);
              storage.setQuestions([]);
            }}
            onClose={() => setView('home')}
            onOpenQrCode={() => setView('qrcode')}
          />
        )}

        {view === 'qrcode' && (
          <QrCodePage onBack={() => setView('admin')} />
        )}
      </main>

      <PaywallModal show={showPaywall} user={user} onClose={() => setShowPaywall(false)} />
      <AccountModal show={showAccount} user={user} onClose={() => setShowAccount(false)} />

      {/* 首页底部按钮 */}
      {view === 'home' && (
        <div className="max-w-4xl mx-auto px-4 pb-4 flex flex-col gap-3">
          <a
            href="https://olcc-edu.github.io/uec-quiz/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition-all text-sm"
          >
            📚 统考教材推荐
          </a>
          <a
            href="https://yesteaching.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-all text-sm"
          >
            🎓 家教配对网（YesTeaching）
          </a>
          <a
            href={`https://wa.me/60165789873?text=${encodeURIComponent(
              user
                ? `你好！我想咨询关于 UEC 刷题宝。\n\n我的账号信息：\n昵称：${user.nickname}\n学校：${user.school}\n年级：${user.grade}\n账号 ID：${user.id}`
                : '你好！我想咨询关于 UEC 刷题宝。'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-2xl border border-green-200 bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-all text-sm"
          >
            💬 WhatsApp 联系我们
          </a>
        </div>
      )}

      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-zinc-400 text-xs">
        <p>UEC 刷题宝 · 助力每一位统考学子</p>
      </footer>
    </div>
  );
}
