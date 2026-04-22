import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface QrCodePageProps {
  onBack: () => void;
}

const BASE_URL = 'https://olcc-edu.github.io/uec-quiz/';

interface Channel {
  key: string;
  label: string;
  bgColor: string;     // Background color of logo circle
  emoji: string;       // Emoji shown in the center
}

const PRESET_CHANNELS: Channel[] = [
  { key: 'wechat',       label: '微信',     bgColor: '#07C160', emoji: '💬' },
  { key: 'whatsapp',     label: 'WhatsApp', bgColor: '#25D366', emoji: '📱' },
  { key: 'facebook',     label: 'Facebook', bgColor: '#1877F2', emoji: 'f'  },
  { key: 'instagram',    label: 'Instagram',bgColor: '#E4405F', emoji: '📷' },
  { key: 'xiaohongshu',  label: '小红书',   bgColor: '#FF2442', emoji: '📕' },
  { key: 'tiktok',       label: 'TikTok',   bgColor: '#000000', emoji: '🎵' },
  { key: 'flyer',        label: '传单',     bgColor: '#F59E0B', emoji: '📄' },
  { key: 'poster',       label: '海报',     bgColor: '#A855F7', emoji: '🖼️' },
  { key: 'friend',       label: '朋友推荐', bgColor: '#6366F1', emoji: '👥' },
  { key: 'school_visit', label: '学校宣传', bgColor: '#14B8A6', emoji: '🏫' },
];

/**
 * Draw a QR code with a colored circle and emoji/letter logo in the center.
 */
async function drawQrWithLogo(
  canvas: HTMLCanvasElement,
  url: string,
  bgColor: string,
  emoji: string,
  size: number = 400
) {
  // Generate QR with high error correction (so center logo doesn't break scanning)
  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#1f2937', light: '#ffffff' },
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Center white square (background for logo)
  const logoSize = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  // White rounded background
  ctx.fillStyle = '#ffffff';
  const padding = size * 0.04;
  const bgSize = logoSize + padding * 2;
  ctx.fillRect(cx - bgSize / 2, cy - bgSize / 2, bgSize, bgSize);

  // Colored circle
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(cx, cy, logoSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Emoji or letter centered in the circle
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${logoSize * 0.6}px -apple-system, "Segoe UI Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx, cy + logoSize * 0.04);
}

function ChannelQr({ channel }: { channel: Channel }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = `${BASE_URL}?ref=${channel.key}`;

  useEffect(() => {
    if (canvasRef.current) {
      drawQrWithLogo(canvasRef.current, url, channel.bgColor, channel.emoji, 400);
    }
  }, [url, channel.bgColor, channel.emoji]);

  const downloadHd = async () => {
    // Generate higher resolution version for download
    const offCanvas = document.createElement('canvas');
    await drawQrWithLogo(offCanvas, url, channel.bgColor, channel.emoji, 1000);
    const link = document.createElement('a');
    link.download = `UEC刷题宝-${channel.label}-${channel.key}.png`;
    link.href = offCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: channel.bgColor }}
        >
          {channel.emoji}
        </span>
        <span className="font-bold text-zinc-800">{channel.label}</span>
        <span className="text-xs text-zinc-400">?ref={channel.key}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-48 h-48 border border-zinc-100 rounded-lg"
      />
      <button
        onClick={downloadHd}
        className="mt-3 w-full bg-zinc-100 text-zinc-700 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <Download size={16} /> 下载高清版
      </button>
    </div>
  );
}

export function QrCodePage({ onBack }: QrCodePageProps) {
  const [customRef, setCustomRef] = useState('');
  const customCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (customRef && customCanvasRef.current) {
      drawQrWithLogo(
        customCanvasRef.current,
        `${BASE_URL}?ref=${customRef}`,
        '#10b981',
        '🎯',
        400
      );
    }
  }, [customRef]);

  const downloadCustom = async () => {
    if (!customRef) return;
    const offCanvas = document.createElement('canvas');
    await drawQrWithLogo(
      offCanvas,
      `${BASE_URL}?ref=${customRef}`,
      '#10b981',
      '🎯',
      1000
    );
    const link = document.createElement('a');
    link.download = `UEC刷题宝-自定义-${customRef}.png`;
    link.href = offCanvas.toDataURL('image/png');
    link.click();
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
          每个渠道有专属彩色 logo，注册时会自动记录来源到 Google Sheets。
        </p>
      </div>

      {/* Custom channel */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 mb-6">
        <h3 className="font-bold text-zinc-800 mb-3">自定义渠道</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customRef}
            onChange={(e) => setCustomRef(e.target.value.replace(/\s+/g, '_').toLowerCase())}
            placeholder="例如：school_kuanren, event_2026"
            className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <button
            onClick={downloadCustom}
            disabled={!customRef}
            className="px-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors text-sm"
          >
            下载
          </button>
        </div>
        {customRef && (
          <div className="flex flex-col items-center gap-2">
            <canvas
              ref={customCanvasRef}
              className="w-40 h-40 border border-zinc-100 rounded-lg"
            />
            <div className="text-xs font-mono text-zinc-500 break-all text-center">
              {`${BASE_URL}?ref=${customRef}`}
            </div>
          </div>
        )}
      </div>

      {/* Preset channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRESET_CHANNELS.map((ch) => (
          <ChannelQr key={ch.key} channel={ch} />
        ))}
      </div>
    </motion.div>
  );
}
