import { motion } from 'motion/react';
import { ArrowLeft, FileText, Clock, Sparkles, BellRing, MessageCircle } from 'lucide-react';

interface MockExamPageProps {
  onBack: () => void;
}

export function MockExamPage({ onBack }: MockExamPageProps) {
  const whatsappLink = `https://wa.me/60165789873?text=${encodeURIComponent('你好！我想第一时间收到 UEC 刷题宝模拟卷上线通知。')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-emerald-500 mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> 返回首页
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-purple-200 mb-6">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText size={36} />
        </div>
        <h2 className="text-2xl font-black mb-2">📝 统考模拟卷</h2>
        <p className="text-sm text-white/90 mb-4">
          仿真统考真题难度 · 限时模拟考试体验
        </p>
        <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
          <Sparkles size={12} />
          敬请期待
        </div>
      </div>

      {/* Features preview */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-4">
        <p className="text-xs text-zinc-500 mb-3 font-medium">即将推出 · 模拟卷功能特点</p>
        <div className="space-y-3">
          <FeatureItem
            icon={<FileText size={16} />}
            title="按统考考纲出题"
            desc="参考历年真题难度与考点分布，精准还原考试体验"
          />
          <FeatureItem
            icon={<Clock size={16} />}
            title="限时模拟考试"
            desc="每张卷有计时器，培养考试节奏感"
          />
          <FeatureItem
            icon={<Sparkles size={16} />}
            title="详细解析与错题分析"
            desc="每题都有详解，找出薄弱环节"
          />
        </div>
      </div>

      {/* Coming soon notice */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-3">
          <BellRing size={20} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-zinc-800 text-sm mb-1">
              老师们正在努力出题中 ✍️
            </p>
            <p className="text-xs text-zinc-600 leading-relaxed">
              我们正在邀请资深独中老师团队为同学们出仿真模拟卷，
              内容涵盖物理、化学、生物、数学、英文、华文等核心科目。
              首批模拟卷预计于 <span className="font-bold text-amber-700">2026 年 6 月</span> 推出，
              敬请期待！
            </p>
          </div>
        </div>
      </div>

      {/* Notify button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
      >
        <MessageCircle size={20} />
        WhatsApp 我，模拟卷上线第一时间通知
      </a>

      <p className="text-center text-[10px] text-zinc-400 mt-3">
        留下你的 WhatsApp，我们上线后会第一时间通知你
      </p>
    </motion.div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-zinc-800">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
