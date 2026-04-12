import { Settings, GraduationCap, User } from 'lucide-react';
import { UserProfile, ViewType } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  isAdminMode: boolean;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
}

export function Header({ user, isAdminMode, onNavigateHome, onNavigateAdmin }: HeaderProps) {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={onNavigateHome}
        >
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <GraduationCap size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-800">UEC 刷题宝</h1>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <User size={14} />
              <span>{user.nickname}</span>
            </div>
          )}
          {isAdminMode && (
            <button
              onClick={onNavigateAdmin}
              className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-50 transition-colors rounded-lg"
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
