import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, LayoutGrid, Plus, RotateCcw, Trash2, QrCode } from 'lucide-react';
import { Question } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface AdminPageProps {
  questions: Question[];
  csvUrl: string;
  isFetching: boolean;
  onCsvUrlChange: (url: string) => void;
  onCsvSync: () => void;
  onBulkImport: (data: string) => void;
  onReset: () => void;
  onClear: () => void;
  onClose: () => void;
  onOpenQrCode: () => void;
}

export function AdminPage({
  questions,
  csvUrl,
  isFetching,
  onCsvUrlChange,
  onCsvSync,
  onBulkImport,
  onReset,
  onClear,
  onClose,
  onOpenQrCode,
}: AdminPageProps) {
  const [bulkData, setBulkData] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <motion.div
      key="admin"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="text-emerald-500" /> 管理后台
        </h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
          关闭
        </button>
      </div>

      <div className="space-y-6">
        <button
          onClick={onOpenQrCode}
          className="w-full bg-purple-500 text-white py-4 rounded-2xl font-bold hover:bg-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
        >
          <QrCode size={20} /> QR Code 生成器（渠道追踪）
        </button>

        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
          <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <LayoutGrid size={18} /> 远程 CSV 导入 (Google Sheets)
          </h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={csvUrl}
              onChange={(e) => onCsvUrlChange(e.target.value)}
              placeholder="粘贴 Google Sheets CSV 链接..."
              className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            <button
              onClick={onCsvSync}
              disabled={isFetching || !csvUrl}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isFetching ? '正在获取...' : '从 URL 同步题库'}
            </button>
            <p className="text-[10px] text-zinc-400 mt-1">
              注意：Google Sheets 需设置为"知道链接的人可以查看"，并使用"发布到网络"生成的 CSV 链接。
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-2">手动批量导入 (Tab 分隔)</label>
          <p className="text-xs text-zinc-400 mb-3">
            格式：年段	科目	章节	题目	选项A	选项B	选项C	选项D	答案索引(0-3)	解析
          </p>
          <textarea
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            placeholder="从 Excel 复制并粘贴到这里..."
            className="w-full h-32 p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono text-sm"
          />
          <button
            onClick={() => {
              onBulkImport(bulkData);
              setBulkData('');
            }}
            disabled={!bulkData.trim()}
            className="mt-3 w-full bg-zinc-800 text-white py-3 rounded-xl font-bold hover:bg-zinc-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> 手动追加题目
          </button>
        </div>

        <div className="flex gap-4 pt-4 border-t border-zinc-100">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex-1 border border-zinc-200 text-zinc-500 py-3 rounded-xl font-bold hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw size={16} /> 重置初始题库
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex-1 border border-red-200 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 size={16} /> 清空所有题目
          </button>
        </div>

        <div className="pt-6 border-t border-zinc-100">
          <h3 className="font-bold text-zinc-700 mb-4">当前题库统计</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-emerald-500">{questions.length}</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider">总题目</div>
            </div>
            <div className="bg-zinc-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-blue-500">
                {new Set(questions.map((q) => q.subject)).size}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider">科目数</div>
            </div>
            <div className="bg-zinc-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-purple-500">
                {new Set(questions.map((q) => q.chapter)).size}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider">章节数</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={showResetConfirm}
        title="重置题库"
        message="确定要重置所有题目到初始状态吗？"
        onConfirm={() => {
          onReset();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
        isDanger
      />
      <ConfirmModal
        show={showClearConfirm}
        title="清空题库"
        message="确定要清空所有题目吗？此操作不可撤销。"
        onConfirm={() => {
          onClear();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
        isDanger
      />
    </motion.div>
  );
}
