import { motion, AnimatePresence } from 'motion/react';
import { Flame, X, ChevronRight } from 'lucide-react';
// X is still used in the modal close button below

const WHATSAPP = '60165789873';
const WHATSAPP_MSG = '你好！我想了解 5 月假期理科四剑客特攻班的详情。';

interface HolidayClassBannerProps {
  onOpenDetails: () => void;
}

export function HolidayClassBanner({ onOpenDetails }: HolidayClassBannerProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpenDetails}
      className="relative w-full text-left rounded-2xl overflow-hidden shadow-lg shadow-orange-200 mb-6 group"
      style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
      }}
    >
      <div className="px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Flame size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold bg-white/25 px-1.5 py-0.5 rounded">
                统考倒计时 178 天
              </span>
            </div>
            <p className="font-bold text-base leading-tight">
              🔥 理科四剑客 假期特攻班
            </p>
            <p className="text-xs text-white/90 mt-0.5">
              物理 · 英文 · 化学 · 生物 · 早鸟价 RM 60 起
            </p>
          </div>
          <ChevronRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform shrink-0" />
        </div>
      </div>
    </motion.button>
  );
}

export function HolidayClassResultCard({ onOpenDetails }: { onOpenDetails: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      onClick={onOpenDetails}
      className="w-full mt-4 p-5 rounded-2xl border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 text-left group hover:border-orange-500 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg shadow-orange-200">
          <Flame size={24} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-zinc-800 text-sm">想要系统性提升？</p>
          <p className="text-xs text-zinc-600 mt-0.5">
            5 月假期 · 理科四剑客特攻班 · 资深名师 6 小时密训
          </p>
        </div>
        <ChevronRight size={18} className="text-orange-500 group-hover:translate-x-1 transition-transform shrink-0" />
      </div>
    </motion.button>
  );
}

interface HolidayClassModalProps {
  show: boolean;
  onClose: () => void;
}

export function HolidayClassModal({ show, onClose }: HolidayClassModalProps) {
  const whatsappLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl my-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Hero */}
            <div
              className="relative p-6 text-white rounded-t-3xl"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' }}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <div className="text-xs font-bold bg-white/20 inline-block px-2 py-0.5 rounded mb-2">
                统考倒计时 178 天 · 5 月特攻
              </div>
              <h2 className="text-2xl font-black leading-tight">
                🔥 理科四剑客
              </h2>
              <p className="text-lg font-bold mt-0.5">假期特攻班</p>
              <p className="text-xs text-white/90 mt-2">
                只有干货 · 没有废话 · 拒绝死记 · 只要开窍
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm font-bold text-zinc-800 mb-2">⚡ 资深名师阵容</p>
                <div className="space-y-2 text-xs text-zinc-600">
                  <p><span className="font-bold text-zinc-800">物理</span> · 10 年独中经验 · 电磁学专项突破</p>
                  <p><span className="font-bold text-zinc-800">英文</span> · 11 年资历 · 作文高级表达</p>
                  <p><span className="font-bold text-zinc-800">化学</span> · 6 年资历 · 历届核心考点扫描</p>
                  <p><span className="font-bold text-zinc-800">生物</span> · 6 年资历 · 生理系统逻辑通关</p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <p className="text-sm font-bold text-orange-700 mb-2">💎 课程亮点</p>
                <ul className="text-xs text-zinc-700 space-y-1">
                  <li>1️⃣ 独家特制题库（外面买不到）</li>
                  <li>2️⃣ 6 年以上老师才知道的扣分盲点</li>
                  <li>3️⃣ Google Meet 线上课，在家也能学</li>
                  <li>4️⃣ 专属 WhatsApp 战友群</li>
                </ul>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="text-zinc-500">📅 日期</span>
                  <span className="font-bold text-zinc-800">5 月 23 日 - 30 日</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="text-zinc-500">⏰ 规格</span>
                  <span className="font-bold text-zinc-800">每科 4 堂 × 1.5 小时</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="text-zinc-500">💰 单科早鸟价</span>
                  <span className="font-bold text-orange-600">RM 60</span>
                </div>
                <div className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2">
                  <span className="font-bold text-orange-700">⭐ 四科全报</span>
                  <div className="text-right">
                    <span className="font-black text-orange-600 text-lg">RM 200</span>
                    <span className="text-[10px] text-orange-500 ml-1">省 RM 40</span>
                  </div>
                </div>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-center hover:shadow-lg hover:shadow-orange-200 transition-all"
              >
                💬 WhatsApp 立即报名
              </a>
              <p className="text-[10px] text-zinc-400 text-center">
                统考不会等你 · 给自己一个变强的机会
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
