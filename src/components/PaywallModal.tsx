import { motion, AnimatePresence } from 'motion/react';
import { Lock, MessageCircle, X, Check, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface PaywallModalProps {
  show: boolean;
  user: UserProfile | null;
  onClose: () => void;
  whatsappNumber?: string;
}

export function PaywallModal({ show, user, onClose, whatsappNumber = '60165789873' }: PaywallModalProps) {
  const accountInfo = user
    ? `\n\n我的账号信息：\n昵称：${user.nickname}\n学校：${user.school}\n年级：${user.grade}\n账号 ID：${user.id}`
    : '';
  const message = `你好！我想以首月特惠价 RM 9.90 解锁 UEC 刷题宝完整版。${accountInfo}`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl max-w-sm w-full shadow-2xl my-4 max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-zinc-300 hover:text-zinc-500"
            >
              <X size={20} />
            </button>

            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock size={28} />
              </div>

              <h3 className="text-xl font-bold text-zinc-800 mb-1">今日免费额度已用完</h3>
              <p className="text-zinc-500 text-xs">
                免费版每天可做 1 个章节
              </p>
            </div>

            {/* 价格展示 */}
            <div className="mx-6 mb-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-1 rounded-bl-lg">
                <Sparkles size={10} className="inline mr-0.5" />
                首月特惠
              </div>

              <p className="text-xs text-emerald-100 mb-1">完整版 · 无限刷题</p>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-sm text-emerald-200 line-through">RM 19.90</span>
                <span className="text-4xl font-black">RM 9.90</span>
              </div>
              <p className="text-[10px] text-emerald-100">
                每天无限刷题 · 解锁所有章节
              </p>
            </div>

            <div className="px-6 pb-2">
              <ul className="space-y-2 text-xs text-zinc-700">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>每天 <span className="font-bold">无限刷题</span>，不再受限</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>解锁 <span className="font-bold">所有 8000+ 题</span>（初中 + 高中所有章节）</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>新题自动同步，永远跟上最新题库</span>
                </li>
              </ul>
            </div>

            <div className="p-6 pt-4 space-y-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200"
              >
                <MessageCircle size={18} />
                WhatsApp 立即解锁 RM 9.90
              </a>
              <button
                onClick={onClose}
                className="w-full bg-zinc-100 text-zinc-500 py-2.5 rounded-xl font-medium hover:bg-zinc-200 transition-colors text-sm"
              >
                明天再来
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
