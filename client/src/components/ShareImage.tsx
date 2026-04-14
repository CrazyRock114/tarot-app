import { useState, useEffect } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface ShareImageProps {
  visible: boolean;
  onClose: () => void;
  shareUrl: string;
  question: string;
  spreadName: string;
  readerName?: string;
  interpretation: string;
  cards: Array<{
    name: string;
    orientation: string;
    image?: string;
  }>;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number): number {
  const chars = text.replace(/\n/g, ' ').split('');
  let line = '';
  let lines = 0;
  let curY = y;
  
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      lines++;
      if (lines >= maxLines) {
        ctx.fillText(line.slice(0, -1) + '...', x, curY);
        return curY + lineHeight;
      }
      ctx.fillText(line, x, curY);
      curY += lineHeight;
      line = chars[i];
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}

const ShareImage = ({ visible, onClose, shareUrl, question, spreadName, readerName, interpretation, cards }: ShareImageProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [, setGenerating] = useState(false);

  useEffect(() => {
    if (!visible || !shareUrl) return;
    setImageUrl('');
    generateImage();
  }, [visible, shareUrl]);

  const generateImage = async () => {
    setGenerating(true);
    try {
      const W = 750;
      const pad = 48;
      const contentW = W - pad * 2;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(shareUrl, { width: 300, margin: 1, color: { dark: '#1e1b4b', light: '#ffffff' } });
      
      // Pre-calculate height
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = 2000; // temp large
      const ctx = canvas.getContext('2d')!;
      
      // Measure text to get final height
      let curY = pad;
      
      // Header
      curY += 50; // brand
      curY += 24; // subtitle
      curY += 30; // gap + divider
      
      // Spread info
      curY += 36; // spread name
      curY += 28; // question
      if (readerName) curY += 24;
      curY += 24; // gap
      
      // Cards area (estimate)
      const cardW = cards.length > 3 ? 120 : 160;
      const cardH = cardW * (917 / 512);
      curY += cardH + 50; // cards + labels
      curY += 20; // gap
      
      // Interpretation (estimate ~6 lines)
      curY += 40; // title
      const summary = interpretation.length > 200 ? interpretation.slice(0, 200) + '...' : interpretation;
      ctx.font = '24px sans-serif';
      const estLines = Math.ceil(ctx.measureText(summary).width / contentW) + 1;
      curY += estLines * 34 + 40;
      curY += 20;
      
      // QR section
      curY += 160;
      curY += pad;
      
      // Set real height
      const H = curY;
      canvas.height = H;
      
      // Draw background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1a1145');
      grad.addColorStop(0.5, '#0f0a2e');
      grad.addColorStop(1, '#1a1145');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      
      // Reset Y
      curY = pad;
      
      // Brand header
      ctx.textAlign = 'center';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🔮 2or.com', W / 2, curY + 38);
      curY += 50;
      
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('AI塔罗占卜', W / 2, curY + 18);
      curY += 30;
      
      // Divider
      const divGrad = ctx.createLinearGradient(pad, 0, W - pad, 0);
      divGrad.addColorStop(0, 'transparent');
      divGrad.addColorStop(0.5, '#6366f1');
      divGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, curY);
      ctx.lineTo(W - pad, curY);
      ctx.stroke();
      curY += 24;
      
      // Spread name
      ctx.font = 'bold 30px sans-serif';
      ctx.fillStyle = '#e0e7ff';
      ctx.fillText(spreadName, W / 2, curY + 24);
      curY += 36;
      
      // Question
      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#94a3b8';
      const q = question.length > 25 ? '「' + question.slice(0, 25) + '...」' : '「' + question + '」';
      ctx.fillText(q, W / 2, curY + 20);
      curY += 28;
      
      // Reader name
      if (readerName) {
        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('塔罗师：' + readerName, W / 2, curY + 18);
        curY += 24;
      }
      curY += 20;
      
      // Cards
      const totalCardsW = cards.length * cardW + (cards.length - 1) * 16;
      let cardX = (W - totalCardsW) / 2;
      const cardStartY = curY;
      
      // Load and draw card images
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to load: ' + src));
          img.src = src;
        });
      };
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const cx = cardX + i * (cardW + 16);
        
        // Card border
        ctx.strokeStyle = '#4338ca';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cx, cardStartY, cardW, cardH, 10);
        ctx.stroke();
        
        // Try to load card image
        if (card.image) {
          try {
            const imgSrc = card.image.startsWith('/') ? window.location.origin + card.image : card.image;
            const img = await loadImage(imgSrc);
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(cx, cardStartY, cardW, cardH, 10);
            ctx.clip();
            if (card.orientation === 'reversed') {
              ctx.translate(cx + cardW / 2, cardStartY + cardH / 2);
              ctx.rotate(Math.PI);
              ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);
            } else {
              ctx.drawImage(img, cx, cardStartY, cardW, cardH);
            }
            ctx.restore();
          } catch {
            // Fallback
            ctx.fillStyle = '#312e81';
            ctx.beginPath();
            ctx.roundRect(cx, cardStartY, cardW, cardH, 10);
            ctx.fill();
            ctx.font = '36px sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('🎴', cx + cardW / 2, cardStartY + cardH / 2 + 12);
          }
        } else {
          ctx.fillStyle = '#312e81';
          ctx.beginPath();
          ctx.roundRect(cx, cardStartY, cardW, cardH, 10);
          ctx.fill();
        }
        
        // Card name below
        const labelY = cardStartY + cardH + 20;
        ctx.textAlign = 'center';
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#c7d2fe';
        ctx.fillText(card.name, cx + cardW / 2, labelY);
        
        ctx.font = '18px sans-serif';
        ctx.fillStyle = card.orientation === 'reversed' ? '#f87171' : '#4ade80';
        ctx.fillText(card.orientation === 'reversed' ? '逆位' : '正位', cx + cardW / 2, labelY + 22);
      }
      
      curY = cardStartY + cardH + 56;
      
      // Interpretation box
      const boxY = curY;
      ctx.textAlign = 'left';
      
      // Title
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('✨ AI解读摘要', pad + 20, boxY + 30);
      
      // Summary text
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      const endY = wrapText(ctx, summary, pad + 20, boxY + 60, contentW - 40, 32, 6);
      
      // Draw box background
      const boxH = endY - boxY + 16;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.beginPath();
      ctx.roundRect(pad, boxY, contentW, boxH, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pad, boxY, contentW, boxH, 16);
      ctx.stroke();
      ctx.restore();
      
      curY = endY + 30;
      
      // QR code section
      const qrSize = 140;
      const qrX = pad;
      const qrY = curY;
      
      // QR background
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 10);
      ctx.fill();
      
      // Draw QR
      const qrImg = await loadImage(qrDataUrl);
      ctx.drawImage(qrImg, qrX + 6, qrY + 6, qrSize - 12, qrSize - 12);
      
      // CTA text
      ctx.textAlign = 'left';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#e0e7ff';
      ctx.fillText('扫码查看完整解读', qrX + qrSize + 24, qrY + 35);
      
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('也来测测你的运势吧~', qrX + qrSize + 24, qrY + 70);
      
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#6366f1';
      ctx.fillText('2or.com · AI塔罗占卜', qrX + qrSize + 24, qrY + 105);
      
      // Final: trim canvas to actual content
      const finalH = qrY + qrSize + pad;
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = W;
      finalCanvas.height = finalH;
      const fctx = finalCanvas.getContext('2d')!;
      // Redraw background for the final canvas
      const fGrad = fctx.createLinearGradient(0, 0, 0, finalH);
      fGrad.addColorStop(0, '#1a1145');
      fGrad.addColorStop(0.5, '#0f0a2e');
      fGrad.addColorStop(1, '#1a1145');
      fctx.fillStyle = fGrad;
      fctx.fillRect(0, 0, W, finalH);
      fctx.drawImage(canvas, 0, 0);
      
      setImageUrl(finalCanvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Generate share image failed:', err);
      // Fallback: just show a message
      setImageUrl('error');
    } finally {
      setGenerating(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="relative max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
          <X className="w-5 h-5" />
        </button>

        {imageUrl && imageUrl !== 'error' ? (
          <div className="flex flex-col items-center gap-4">
            <img src={imageUrl} alt="分享图片" className="w-full rounded-xl" />
            <p className="text-gray-400 text-sm text-center">长按图片保存，分享到微信</p>
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = imageUrl;
                a.download = 'tarot-reading.png';
                a.click();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors"
            >
              <Download className="w-4 h-4" />
              保存图片
            </button>
          </div>
        ) : imageUrl === 'error' ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-red-400">图片生成失败</p>
            <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded-lg">关闭</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-gray-400">正在生成分享图片...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareImage;
