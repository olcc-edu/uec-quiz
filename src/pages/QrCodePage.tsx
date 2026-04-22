import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, QrCode } from 'lucide-react';

interface QrCodePageProps {
  onBack: () => void;
}

const BASE_URL = 'https://olcc-edu.github.io/uec-quiz/';

const PRESET_CHANNELS = [
  { key: 'wechat', label: '微信', color: 'bg-green-500' },
  { key: 'whatsapp', label: 'WhatsApp', color: 'bg-emerald-500' },
  { key: 'facebook', label: 'Facebook', color: 'bg-blue-500' },
  { key: 'instagram', label: 'Instagram', color: 'bg-pink-500' },
  { key: 'xiaohongshu', label: '小红书', color: 'bg-red-500' },
  { key: 'tiktok', label: 'TikTok', color: 'bg-black' },
  { key: 'flyer', label: '传单', color: 'bg-amber-500' },
  { key: 'poster', label: '海报', color: 'bg-purple-500' },
  { key: 'friend', label: '朋友推荐', color: 'bg-indigo-500' },
  { key: 'school_visit', label: '学校宣传', color: 'bg-teal-500' },
];

export function QrCodePage({ onBack }: QrCodePageProps) {
  const [customRef, setCustomRef] = useState('');

  const buildUrl = (ref: string) => `${BASE_URL}?ref=${ref}`;

  const buildQrUrl = (ref: string, size = 400) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      buildUrl(ref)
    )}&margin=10`;

  const downloadQr = async (ref: string, label: string) => {
    try {
      const response = await fetch(buildQrUrl(ref, 800));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UEC刷题宝-${label}-${ref}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('下载失败，请重试');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-emerald-500 mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> 返回管理后台
      </button>

      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <QrCode className="text-emerald-500" /> QR Code 生成器
        </h2>
        <p className="text-sm text-zinc-500">
          为每个推广渠道生成专属 QR Code，注册时会自动记录来源到 Google Sheets。
        </p>
      </div>

      {/* Custom channel */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 mb-6">
        <h3 className="font-bold text-zinc-800 mb-3">自定义渠道</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customRef}
            onChange={(e) => setCustomRef(e.target.value.replace(/\s+/g, '_').toLowerCase())}
            placeholder="例如：school_kuanren, event_2026"
            className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <button
            onClick={() => customRef && downloadQr(customRef, '自定义')}
            disabled={!customRef}
            className="px-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors text-sm"
          >
            下载
          </button>
        </div>
        {customRef && (
          <div className="mt-4 p-3 bg-zinc-50 rounded-lg text-xs font-mono text-zinc-500 break-all">
            {buildUrl(customRef)}
          </div>
        )}
      </div>

      {/* Preset channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRESET_CHANNELS.map((ch) => (
          <div
            key={ch.key}
            className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col items-center"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-3 h-3 rounded-full ${ch.color}`} />
              <span className="font-bold text-zinc-800">{ch.label}</span>
              <span className="text-xs text-zinc-400">?ref={ch.key}</span>
            </div>
            <img
              src={buildQrUrl(ch.key)}
              alt={ch.label}
              className="w-48 h-48 border border-zinc-100 rounded-lg"
            />
            <button
              onClick={() => downloadQr(ch.key, ch.label)}
              className="mt-3 w-full bg-zinc-100 text-zinc-700 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Download size={16} /> 下载高清版
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
