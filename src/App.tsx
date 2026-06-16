/**
 * UEC 刷题宝 - Main App Coordinator
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { X, Lock } from 'lucide-react';
// motion animations are handled within individual page components
import { Question, QuizResult, UserProfile, ViewType, DailyUsage } from './types';
import { storage } from './utils/storage';
import { api } from './utils/api';
import { initialQuestions } from './data/questions';
import { Header } from './components/Header';
import { PaywallModal } from './components/PaywallModal';
import { AccountModal } from './components/AccountModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { HolidayClassBanner, HolidayClassModal } from './components/HolidayClassBanner';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { SubjectPage } from './pages/SubjectPage';
import { ChapterPage } from './pages/ChapterPage';
import { QuizPage } from './pages/QuizPage';
import { AdminPage } from './pages/AdminPage';
import { QrCodePage } from './pages/QrCodePage';
import { MockExamPage } from './pages/MockExamPage';

const NUDGE_KEY = 'uec_password_nudge_dismissed';

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
  const [showHolidayClass, setShowHolidayClass] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [showPasswordNudge, setShowPasswordNudge] = useState(false);

  // Admin state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [csvUrl, setCsvUrl] = useState(DEFAULT_CSV_URL);
  const [isFetching, setIsFetching] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);

  // Initialize
  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);
      hydrateUserFromServer(savedUser);
    } else {
      setView('login');
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
      setView('admin');
    }
    const ref = params.get('ref');
    if (ref) {
      storage.setRef(ref);
    }
  }, []);

  // 静默后台同步题库（每次打开 app 时自动拉取最新题库）
  useEffect(() => {
    if (csvUrl && user && !isFetching) {
      handleCsvImport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Refresh server-side user fields + pull history. Show nudge if legacy account on default password.
  const hydrateUserFromServer = useCallback(async (current: UserProfile) => {
    if (current.id.startsWith('local_')) return;

    const fresh = await api.refreshUser(current.id);
    const merged: UserProfile = fresh ? { ...current, ...fresh } : current;
    if (fresh) {
      setUser(merged);
      storage.setUser(merged);
    }

    const serverHist = await api.getHistory(current.id);
    if (serverHist && serverHist.length > 0) {
      const localHist = storage.getHistory();
      const seen = new Set<string>();
      const out: QuizResult[] = [];
      for (const h of [...serverHist, ...localHist]) {
        const key = `${h.date}|${h.subject}|${h.chapter}|${h.score}|${h.total}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(h);
      }
      out.sort((a, b) => (a.date < b.date ? 1 : -1));
      const trimmed = out.slice(0, 50);
      setQuizHistory(trimmed);
      storage.setHistory(trimmed);
    }

    // Gentle nudge for legacy users sitting on default password
    if (merged.passwordChangeRequired && localStorage.getItem(NUDGE_KEY) !== 'true') {
      setShowPasswordNudge(true);
    }
  }, []);

  // Handlers
  const handleLoggedIn = (newUser: UserProfile) => {
    setUser(newUser);
    setView('home');
    if (newUser.passwordChangeRequired) {
      setForcePasswordChange(true);
      setShowChangePassword(true);
    }
    hydrateUserFromServer(newUser);
    handleCsvImport();
  };

  const handleRegistered = (newUser: UserProfile) => {
    setUser(newUser);
    setView('home');
    // Brand new user chose own password — no nudge needed
    localStorage.setItem(NUDGE_KEY, 'true');
    handleCsvImport();
  };

  const handleLogout = () => {
    storage.clearUser();
    storage.clearHistory();
    localStorage.removeItem(NUDGE_KEY);
    setUser(null);
    setQuizHistory([]);
    setShowAccount(false);
    setView('login');
  };

  const handlePasswordChanged = (updated: UserProfile) => {
    setUser(updated);
    setForcePasswordChange(false);
    setShowChangePassword(false);
    localStorage.setItem(NUDGE_KEY, 'true');
    setShowPasswordNudge(false);
  };

  const handleDismissNudge = () => {
    localStorage.setItem(NUDGE_KEY, 'true');
    setShowPasswordNudge(false);
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
      date: new Date().toISOString(),
    };
    const updated = [newResult, ...quizHistory].slice(0, 50);
    setQuizHistory(updated);
    storage.setHistory(updated);
    if (user) {
      api.saveHistory(user.id, newResult);
    }
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

  // Auth views (no header)
  if (view === 'login') {
    return <LoginPage onLoggedIn={handleLoggedIn} onGoRegister={() => setView('register')} />;
  }
  if (view === 'register') {
    return <RegisterPage onRegistered={handleRegistered} onGoLogin={() => setView('login')} />;
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
          <>
            <HolidayClassBanner onOpenDetails={() => setShowHolidayClass(true)} />
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
              onOpenMockExam={() => setView('mockexam')}
            />
          </>
        )}

        {view === 'mockexam' && (
          <MockExamPage onBack={() => setView('home')} />
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
            onOpenHolidayClass={() => setShowHolidayClass(true)}
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
      <AccountModal
        show={showAccount}
        user={user}
        onClose={() => setShowAccount(false)}
        onChangePassword={() => {
          setShowAccount(false);
          setForcePasswordChange(false);
          setShowChangePassword(true);
        }}
        onLogout={handleLogout}
      />
      <ChangePasswordModal
        show={showChangePassword}
        user={user}
        forced={forcePasswordChange}
        onClose={() => setShowChangePassword(false)}
        onChanged={handlePasswordChanged}
      />
      <HolidayClassModal show={showHolidayClass} onClose={() => setShowHolidayClass(false)} />

      {/* 友善提示：建议设密码（旧用户） */}
      {showPasswordNudge && view === 'home' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md w-[calc(100%-2rem)] z-50">
          <div className="bg-amber-50 border border-amber-300 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-800">建议设置密码</p>
              <p className="text-[11px] text-zinc-500">默认密码 1234，改一个只有你知道的</p>
            </div>
            <button
              onClick={() => {
                setForcePasswordChange(false);
                setShowChangePassword(true);
              }}
              className="bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber-600 shrink-0"
            >
              立即设置
            </button>
            <button onClick={handleDismissNudge} className="text-zinc-400 hover:text-zinc-600 shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

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

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-zinc-400 text-xs space-y-2">
        <p>UEC 刷题宝 · 助力每一位统考学子</p>
        <p className="text-zinc-500">
          本 app 由 <span className="font-bold text-emerald-600">毅而山教育中心</span> 赞助
          <span className="mx-2 text-zinc-300">│</span>
          补习咨询：<a href="https://wa.me/60107669167" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">010-7669167</a>
        </p>
      </footer>
    </div>
  );
}
