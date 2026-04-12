import { motion, AnimatePresence } from 'motion/react';
import { Lock, MessageCircle, X } from 'lucide-react';

interface PaywallModalProps {
  show: boolean;
  onClose: () => void;
  whatsappNumber?: string;
}

export function PaywallModal({ show, onClose, whatsappNumber = '60165789873' }: PaywallModalProps) {
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('你好！我想解锁 UEC 刷题宝完整版。我的昵称是：')}`;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-500"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>

            <h3 className="text-xl font-bold text-zinc-800 mb-2">今日免费额度已用完</h3>
            <p className="text-zinc-500 text-sm mb-6">
              免费版每天可完整做 1 个章节。解锁完整版即可无限刷题！
            </p>

            <div className="space-y-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                WhatsApp 联系解锁
              </a>
              <button
                onClick={onClose}
                className="w-full bg-zinc-100 text-zinc-500 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
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
